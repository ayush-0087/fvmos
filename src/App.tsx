import React, { useState, useEffect } from 'react';
import {
  Zap,
  Home,
  CheckSquare,
  ClipboardList,
  History,
  User,
  ShieldCheck,
  Radio,
  CheckCircle2,
  Clock,
  HelpCircle
} from 'lucide-react';
import {
  UserProfile,
  AttendanceRecord,
  Milestone,
  MilestoneSubmission,
  Language
} from './types';
import { translations, defaultElectricians } from './translations';
import {
  getLocalAttendanceRecords,
  saveLocalAttendanceRecords,
  recordAttendance,
  syncPendingRecords,
  getStoredUser,
  saveStoredUser,
  getLocalMilestones,
  getLocalMilestoneSubmissions,
  submitMilestoneWork,
  updateMilestoneSubmissionStatus,
  fetchMilestones,
  fetchMySubmissions
} from './services/storageService';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { AttendanceCard } from './components/AttendanceCard';
import { MilestonesTab } from './components/MilestonesTab';
import { HistoryTab } from './components/HistoryTab';
import { ProfileTab } from './components/ProfileTab';
import { AdminPanel } from './components/AdminPanel';
import { SelfieModal } from './components/SelfieModal';
import { LiveWebcamModal } from './components/LiveWebcamModal';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { VideoTutorialModal } from './components/VideoTutorialModal';
import { MilestoneSubmissionModal } from './components/MilestoneSubmissionModal';
import { ImageViewerModal } from './components/ImageViewerModal';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser() || defaultElectricians[0]);
  
  // 4 Primary Tabs: 'HOME' | 'MILESTONES' | 'HISTORY' | 'PROFILE' (and 'ADMIN' for supervisor view)
  const [activeTab, setActiveTab] = useState<'HOME' | 'MILESTONES' | 'HISTORY' | 'PROFILE' | 'ADMIN'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.includes('/admin') || window.location.hash.includes('admin')) {
        return 'ADMIN';
      }
    }
    return 'HOME';
  });

  const [records, setRecords] = useState<AttendanceRecord[]>(() => getLocalAttendanceRecords());
  const [milestones, setMilestones] = useState<Milestone[]>(() => getLocalMilestones());
  const [submissions, setSubmissions] = useState<MilestoneSubmission[]>(() => getLocalMilestoneSubmissions());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const [freshMilestones, freshSubmissions] = await Promise.all([
        fetchMilestones(),
        fetchMySubmissions()
      ]);
      if (active) {
        setMilestones(freshMilestones);
        setSubmissions((prev) => {
          const others = prev.filter((s) => s.workerId !== user?.workerId);
          return [...others, ...freshSubmissions];
        });
      }
    })();
    return () => { active = false; };
  }, [user?.id]);

  // Modals state
  const [activeCapture, setActiveCapture] = useState<{
    source: File | Blob | string;
    type: 'CHECK_IN' | 'CHECK_OUT';
  } | null>(null);

  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [webcamCaptureType, setWebcamCaptureType] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [selectedPhotoRecord, setSelectedPhotoRecord] = useState<AttendanceRecord | null>(null);
  
  // Milestone Modals
  const [selectedVideoMilestone, setSelectedVideoMilestone] = useState<Milestone | null>(null);
  const [selectedSubmitMilestone, setSelectedSubmitMilestone] = useState<Milestone | null>(null);
  const [imageViewerData, setImageViewerData] = useState<{ imageUrl: string; title: string } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[language];

  // Route listener for /admin
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.includes('/admin') || window.location.hash.includes('admin')) {
        setActiveTab('ADMIN');
      } else {
        setActiveTab('HOME');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-sync listener when network returns
  useEffect(() => {
    const handleOnline = async () => {
      triggerSync();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const triggerSync = async () => {
    if (isSyncing || !navigator.onLine) return;
    setIsSyncing(true);
    try {
      const result = await syncPendingRecords();
      setRecords(getLocalAttendanceRecords());
      setSubmissions(getLocalMilestoneSubmissions());
      if (result.syncedCount > 0) {
        showToast(
          language === 'hi'
            ? `✅ ${result.syncedCount} रिकॉर्ड सफलतापूर्वक सिंक हो गए!`
            : `✅ Successfully synced ${result.syncedCount} records!`
        );
      }
    } catch (e) {
      console.warn('Sync attempt finished');
    } finally {
      setIsSyncing(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLanguageToggle = (targetLang?: Language) => {
    if (targetLang) {
      setLanguage(targetLang);
    } else {
      setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
    }
  };

  const handleLoginSuccess = (newUser: UserProfile) => {
    setUser(newUser);
    saveStoredUser(newUser);
    if (newUser.userType === 'admin') {
      setActiveTab('ADMIN');
    } else {
      setActiveTab('HOME');
    }
    showToast(
      language === 'hi'
        ? `स्वागत है, ${newUser.nameHi || newUser.name}!`
        : `Welcome back, ${newUser.name}!`
    );
  };

  const handleLogout = () => {
    setUser(null);
    saveStoredUser(null);
    setActiveTab('HOME');
  };

  const handleInitiateCapture = (fileOrBlob: File | Blob, type: 'CHECK_IN' | 'CHECK_OUT') => {
    setActiveCapture({
      source: fileOrBlob,
      type: type
    });
  };

  const handleOpenLiveWebcam = (type: 'CHECK_IN' | 'CHECK_OUT') => {
    setWebcamCaptureType(type);
    setIsWebcamOpen(true);
  };

  const handleWebcamSnap = (blob: Blob) => {
    setIsWebcamOpen(false);
    setActiveCapture({
      source: blob,
      type: webcamCaptureType
    });
  };

  const handleSubmitAttendanceRecord = async (
    record: AttendanceRecord,
    photoBlob: Blob
  ) => {
    setActiveCapture(null);
    await recordAttendance(record, photoBlob);
    setRecords(getLocalAttendanceRecords());

    showToast(
      record.type === 'CHECK_IN'
        ? language === 'hi'
          ? '⚡ हाजिरी (चेक-इन) सफलतापूर्वक दर्ज!'
          : '⚡ Check-in attendance recorded successfully!'
        : language === 'hi'
        ? '🏁 शिफ्ट समाप्ति (चेक-आउट) दर्ज!'
        : '🏁 Shift checkout punch recorded!'
    );

    if (navigator.onLine) {
      triggerSync();
    }
  };

  // Submit Milestone Work Photo
  const handleSubmitMilestoneWork = async (
    submission: MilestoneSubmission,
    photoBlob: Blob
  ) => {
    setSelectedSubmitMilestone(null);
    const res = await submitMilestoneWork(submission, photoBlob);
    setSubmissions(getLocalMilestoneSubmissions());

    if (!res.success && res.error) {
      showToast(`⚠️ ${res.error}`);
      return;
    }

    showToast(
      language === 'hi'
        ? '📸 कार्य फोटो सफलतापूर्वक सबमिट की गई (समीक्षाधीन)!'
        : '📸 Milestone work photo submitted for supervisor review!'
    );

    if (navigator.onLine) {
      triggerSync();
    }
  };

  // Supervisor Review Actions
  const handleApproveSubmission = async (submissionId: string, feedback: string) => {
    await updateMilestoneSubmissionStatus(
      submissionId,
      'approved',
      feedback,
      user?.name || 'Supervisor'
    );
    setSubmissions(getLocalMilestoneSubmissions());
    showToast('✅ Milestone approved successfully!');
  };

  const handleRejectSubmission = async (submissionId: string, feedback: string) => {
    await updateMilestoneSubmissionStatus(
      submissionId,
      'rejected',
      feedback,
      user?.name || 'Supervisor'
    );
    setSubmissions(getLocalMilestoneSubmissions());
    showToast('❌ Milestone rejected with feedback sent to electrician.');
  };

  // Find today's check-in & check-out for current user
  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const todayRecord = user
    ? records.find(
        (r) =>
          r.workerId === user.workerId &&
          r.dateFormatted === todayStr &&
          r.type === 'CHECK_IN'
      ) || null
    : null;

  const todayCheckOutRecord = user
    ? records.find(
        (r) =>
          r.workerId === user.workerId &&
          r.dateFormatted === todayStr &&
          r.type === 'CHECK_OUT'
      ) || null
    : null;

  const pendingAttendanceCount = records.filter((r) => r.syncStatus === 'pending').length;
  const pendingMilestoneCount = submissions.filter((s) => s.syncStatus === 'pending').length;
  const totalPendingSync = pendingAttendanceCount + pendingMilestoneCount;

  return (
    <div className="min-h-screen bg-[#f4f7f9] text-gray-900 flex flex-col font-sans selection:bg-[#0052cc] selection:text-white">
      {/* Top Header with Prominent Bilingual [ENG | हिंदी] Toggle */}
      <Header
        user={user}
        language={language}
        onToggleLanguage={handleLanguageToggle}
        onLogout={handleLogout}
        pendingCount={totalPendingSync}
        onSyncClick={triggerSync}
        isSyncing={isSyncing}
        isAdminView={activeTab === 'ADMIN'}
        onToggleAdminView={() => {
          if (activeTab === 'ADMIN') {
            setActiveTab('HOME');
            if (window.history.pushState) {
              window.history.pushState(null, '', '/');
            }
          } else {
            setActiveTab('ADMIN');
            if (window.history.pushState) {
              window.history.pushState(null, '', '/admin');
            }
          }
        }}
      />

      {/* Main Container */}
      <main
        className={`flex-1 w-full mx-auto p-3 sm:p-4 pb-24 ${
          activeTab === 'ADMIN' ? 'max-w-5xl' : 'max-w-lg'
        }`}
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#0052cc] text-white font-bold text-xs sm:text-sm shadow-2xl border-2 border-white flex items-center space-x-2 animate-bounce">
            <Zap className="w-4 h-4 fill-white" />
            <span>{toastMessage}</span>
          </div>
        )}

        {!user ? (
          <LoginScreen
            language={language}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <>
            {/* TAB 1: HOME (Attendance & Daily Overview with Dynamic Next-Action Card) */}
            {activeTab === 'HOME' && (
              <AttendanceCard
                user={user}
                language={language}
                todayRecord={todayRecord}
                todayCheckOutRecord={todayCheckOutRecord}
                milestones={milestones}
                submissions={submissions}
                onNavigateToMilestones={() => setActiveTab('MILESTONES')}
                onInitiateCapture={handleInitiateCapture}
                onOpenLiveWebcam={handleOpenLiveWebcam}
                onViewPhoto={(rec) => setSelectedPhotoRecord(rec)}
              />
            )}

            {/* TAB 2: MILESTONES (Job Site Sequential Task Checklist & Submissions) */}
            {activeTab === 'MILESTONES' && (
              <MilestonesTab
                milestones={milestones}
                submissions={submissions.filter((s) => s.workerId === user.workerId)}
                language={language}
                onOpenVideo={(m) => setSelectedVideoMilestone(m)}
                onOpenSubmit={(m) => setSelectedSubmitMilestone(m)}
                onViewPhoto={(url, title) => setImageViewerData({ imageUrl: url, title })}
              />
            )}

            {/* TAB 3: HISTORY (Past Punches & Submitted Tasks) */}
            {activeTab === 'HISTORY' && (
              <HistoryTab
                records={records.filter((r) => r.workerId === user.workerId)}
                language={language}
                onViewPhoto={(rec) => setSelectedPhotoRecord(rec)}
              />
            )}

            {/* TAB 4: PROFILE / HELP (Worker Details, Supervisor Contact & Emergency Helpline) */}
            {activeTab === 'PROFILE' && (
              <ProfileTab
                user={user}
                language={language}
                onLogout={handleLogout}
              />
            )}

            {/* SUPERVISOR ADMIN PANEL (/admin) */}
            {activeTab === 'ADMIN' && (
              <AdminPanel
                user={user}
                attendanceRecords={records}
                milestones={milestones}
                submissions={submissions}
                language={language}
                onApproveSubmission={handleApproveSubmission}
                onRejectSubmission={handleRejectSubmission}
                onViewPhoto={(url, title) => setImageViewerData({ imageUrl: url, title })}
                onSwitchToElectricianView={() => setActiveTab('HOME')}
              />
            )}
          </>
        )}
      </main>

      {/* 4-TAB BOTTOM NAVIGATION BAR (HOME | MILESTONES | HISTORY | PROFILE / HELP) */}
      {user && activeTab !== 'ADMIN' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl">
          <div className="max-w-lg mx-auto grid grid-cols-4 h-16 px-1">
            {/* 1. HOME (Attendance & Daily Overview) */}
            <button
              id="tab-home-btn"
              onClick={() => setActiveTab('HOME')}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeTab === 'HOME'
                  ? 'text-[#0052cc] font-black'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Home className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[10px] font-bold uppercase tracking-tight">{t.home}</span>
              {activeTab === 'HOME' && (
                <div className="w-6 h-1 bg-[#0052cc] rounded-full" />
              )}
            </button>

            {/* 2. MILESTONES (Job Site Task Checklist & Submissions - ClipboardList / CheckSquare Icon) */}
            <button
              id="tab-milestones-btn"
              onClick={() => setActiveTab('MILESTONES')}
              className={`relative flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeTab === 'MILESTONES'
                  ? 'text-[#0052cc] font-black'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <ClipboardList className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[10px] font-bold uppercase tracking-tight">{t.milestones}</span>
              {activeTab === 'MILESTONES' && (
                <div className="w-6 h-1 bg-[#0052cc] rounded-full" />
              )}
            </button>

            {/* 3. HISTORY (Past Punches & Submitted Tasks) */}
            <button
              id="tab-history-btn"
              onClick={() => setActiveTab('HISTORY')}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeTab === 'HISTORY'
                  ? 'text-[#0052cc] font-black'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <History className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[10px] font-bold uppercase tracking-tight">{t.history}</span>
              {activeTab === 'HISTORY' && (
                <div className="w-6 h-1 bg-[#0052cc] rounded-full" />
              )}
            </button>

            {/* 4. PROFILE / HELP (Worker Details & Supervisor Contact) */}
            <button
              id="tab-profile-btn"
              onClick={() => setActiveTab('PROFILE')}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                activeTab === 'PROFILE'
                  ? 'text-[#0052cc] font-black'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <User className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[70px]">
                {language === 'hi' ? 'सहायता' : 'Profile'}
              </span>
              {activeTab === 'PROFILE' && (
                <div className="w-6 h-1 bg-[#0052cc] rounded-full" />
              )}
            </button>
          </div>
        </nav>
      )}

      {/* Attendance Selfie Watermarking Modal */}
      {activeCapture && user && (
        <SelfieModal
          user={user}
          language={language}
          photoSource={activeCapture.source}
          attendanceType={activeCapture.type}
          onClose={() => setActiveCapture(null)}
          onSubmit={handleSubmitAttendanceRecord}
        />
      )}

      {/* Live Webcam Stream Modal Fallback */}
      {isWebcamOpen && (
        <LiveWebcamModal
          language={language}
          onCapture={handleWebcamSnap}
          onClose={() => setIsWebcamOpen(false)}
        />
      )}

      {/* Attendance Photo Inspector Modal */}
      {selectedPhotoRecord && (
        <PhotoDetailModal
          record={selectedPhotoRecord}
          language={language}
          onClose={() => setSelectedPhotoRecord(null)}
        />
      )}

      {/* Milestone Video Tutorial Modal (16:9 YouTube player) */}
      {selectedVideoMilestone && (
        <VideoTutorialModal
          milestone={selectedVideoMilestone}
          language={language}
          onClose={() => setSelectedVideoMilestone(null)}
        />
      )}

      {/* Milestone Rear Camera Submission Drawer/Modal (1080p, 0.75 JPEG, GPS watermark) */}
      {selectedSubmitMilestone && user && (
        <MilestoneSubmissionModal
          milestone={selectedSubmitMilestone}
          user={user}
          language={language}
          onClose={() => setSelectedSubmitMilestone(null)}
          onSubmit={handleSubmitMilestoneWork}
        />
      )}

      {/* Full Size Generic Image Viewer Modal (Sample Correct Work) */}
      {imageViewerData && (
        <ImageViewerModal
          imageUrl={imageViewerData.imageUrl}
          title={imageViewerData.title}
          language={language}
          onClose={() => setImageViewerData(null)}
        />
      )}
    </div>
  );
}
