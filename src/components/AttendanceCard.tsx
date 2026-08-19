import React, { useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Zap,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  HardHat,
  Radio,
  FileCheck,
  Video,
  ListChecks,
  LogOut,
  ChevronRight,
  CheckSquare
} from 'lucide-react';
import {
  UserProfile,
  AttendanceRecord,
  Milestone,
  MilestoneSubmission,
  Language
} from '../types';
import { translations } from '../translations';

interface AttendanceCardProps {
  user: UserProfile;
  language: Language;
  todayRecord: AttendanceRecord | null;
  todayCheckOutRecord: AttendanceRecord | null;
  milestones: Milestone[];
  submissions: MilestoneSubmission[];
  onNavigateToMilestones: () => void;
  onInitiateCapture: (file: File | Blob, type: 'CHECK_IN' | 'CHECK_OUT') => void;
  onOpenLiveWebcam: (type: 'CHECK_IN' | 'CHECK_OUT') => void;
  onViewPhoto: (record: AttendanceRecord) => void;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  user,
  language,
  todayRecord,
  todayCheckOutRecord,
  milestones,
  submissions,
  onNavigateToMilestones,
  onInitiateCapture,
  onOpenLiveWebcam,
  onViewPhoto
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeCaptureType, setActiveCaptureType] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');

  const handleDirectFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      onInitiateCapture(file, activeCaptureType);
      e.target.value = '';
    }
  };

  const triggerDirectCamera = (type: 'CHECK_IN' | 'CHECK_OUT') => {
    setActiveCaptureType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const today = new Date();
  const dateFormatted = today.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const isCheckedIn = Boolean(todayRecord);
  const isCheckedOut = Boolean(todayCheckOutRecord);

  // Compute milestone progress
  const totalMilestones = milestones.length || 5;
  const userSubmissions = submissions.filter((s) => s.workerId === user.workerId);
  const submittedCount = userSubmissions.length;
  const approvedCount = userSubmissions.filter((s) => s.status === 'approved').length;

  // Next step ready for submission
  const nextPendingMilestone = milestones.find(
    (m) => !userSubmissions.some((s) => s.milestoneId === m.id && s.status !== 'rejected')
  );
  const nextStepNumber = nextPendingMilestone ? nextPendingMilestone.stepOrder : Math.min(submittedCount + 1, totalMilestones);
  const isAllSubmitted = submittedCount >= totalMilestones;

  return (
    <div className="space-y-4">
      {/* Hidden HTML5 Native Front Camera Input */}
      <input
        ref={fileInputRef}
        id="native-selfie-camera-input"
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleDirectFileInputChange}
        className="hidden"
      />

      {/* Main Container Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        {/* Date & GPS Active Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Clock className="w-4 h-4 text-[#0052cc]" />
            <span>{dateFormatted}</span>
          </div>
          <span className="flex items-center text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
            <Radio className="w-3 h-3 mr-1 text-green-600 animate-pulse" />
            <span>GPS ACTIVE</span>
          </span>
        </div>

        {/* STATUS BADGE SECTION */}
        <div>
          {!isCheckedIn ? (
            /* STATE A: NOT CHECKED IN (Orange / Amber Badge) */
            <div
              id="status-not-checked-in"
              className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center gap-3.5"
            >
              <div className="h-12 w-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/20">
                <AlertCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  {language === 'hi' ? 'वर्तमान स्थिति' : 'Current Status'}
                </p>
                <p className="text-base sm:text-lg font-black text-amber-950 truncate">
                  {language === 'hi' ? 'आज की हाजिरी दर्ज नहीं है' : 'NOT CHECKED IN'}
                </p>
                <p className="text-xs text-amber-700 font-medium">
                  {language === 'hi' ? 'कार्य शुरू करने के लिए साइट सेल्फी लें' : 'Take attendance selfie to unlock milestones'}
                </p>
              </div>
            </div>
          ) : !isCheckedOut ? (
            /* STATE B: CHECKED IN (Forest Green Badge with Checkmark & Time IST) */
            <div
              id="status-checked-in-active"
              className="bg-[#f0fdf4] border-2 border-[#86efac] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-12 w-12 bg-[#16a34a] rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-green-600/20">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[11px] font-bold text-green-800 uppercase tracking-wider">
                      {language === 'hi' ? 'हाजिरी सत्यापित' : 'ATTENDANCE VERIFIED'}
                    </p>
                  </div>
                  <p className="text-base sm:text-lg font-black text-green-950 truncate">
                    CHECKED IN • {todayRecord.timeFormatted} IST
                  </p>
                  <p className="text-xs text-green-800 font-medium truncate">
                    {todayRecord.substation || user.substation}
                  </p>
                </div>
              </div>

              {todayRecord.photoDataUrl && (
                <button
                  onClick={() => onViewPhoto(todayRecord)}
                  className="relative rounded-xl overflow-hidden border-2 border-green-400 w-12 h-12 shrink-0 group hover:opacity-90 transition-opacity shadow-xs"
                  title="View Attendance Selfie"
                >
                  <img
                    src={todayRecord.photoDataUrl}
                    alt="Check-in Selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white font-bold" />
                  </div>
                </button>
              )}
            </div>
          ) : (
            /* STATE C: SHIFT COMPLETED */
            <div
              id="status-shift-completed"
              className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-[#0052cc] rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
                  <FileCheck className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                    {language === 'hi' ? 'शिफ्ट पूर्ण' : 'Shift Complete'}
                  </p>
                  <p className="text-base sm:text-lg font-black text-blue-950">
                    {t.checkedOutToday}
                  </p>
                  <p className="text-xs font-mono text-blue-900 font-bold mt-0.5">
                    In: {todayRecord?.timeFormatted} | Out: {todayCheckOutRecord.timeFormatted} IST
                  </p>
                </div>
              </div>

              {todayCheckOutRecord.photoDataUrl && (
                <button
                  onClick={() => onViewPhoto(todayCheckOutRecord)}
                  className="relative rounded-xl overflow-hidden border-2 border-blue-300 w-12 h-12 shrink-0 hover:opacity-90 shadow-xs"
                >
                  <img
                    src={todayCheckOutRecord.photoDataUrl}
                    alt="Check-out Selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* DYNAMIC ACTION SECTION BASED ON ATTENDANCE STATE */}
        {!isCheckedIn ? (
          /* STATE A ACTION CARD: Big 64px Green Button "MARK ATTENDANCE" */
          <div className="space-y-3 pt-1">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm uppercase tracking-widest flex items-center">
              <Zap className="w-4 h-4 text-[#0052cc] mr-1.5" />
              <span>{language === 'hi' ? "आज की हाजिरी" : "Today's Attendance"}</span>
            </h3>

            {/* Big 64px Green Button */}
            <button
              id="mark-attendance-btn"
              type="button"
              onClick={() => triggerDirectCamera('CHECK_IN')}
              className="w-full min-h-[64px] py-4 px-5 bg-[#16a34a] hover:bg-[#15803d] active:bg-[#166534] text-white rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-green-600/25 flex items-center justify-center space-x-3 transition-all active:scale-[0.99] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Camera className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <div className="leading-tight">
                  {language === 'hi'
                    ? 'हाजिरी लगाएं (साइट पर सेल्फी लें)'
                    : 'MARK ATTENDANCE (Take Selfie at Job Site)'}
                </div>
                <div className="text-[11px] font-normal text-green-100 normal-case">
                  {language === 'hi' ? 'जीपीएस लोकेशन व टाइमस्टैम्प ऑटो-टैग होगा' : 'Direct front camera • Auto GPS watermarked'}
                </div>
              </div>
            </button>

            {/* Alternative Live Webcam trigger for desktop testing */}
            <button
              id="open-webcam-checkin-btn"
              type="button"
              onClick={() => onOpenLiveWebcam('CHECK_IN')}
              className="w-full h-10 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase rounded-xl border border-gray-200 flex items-center justify-center space-x-2 transition-colors"
            >
              <Video className="w-4 h-4 text-[#0052cc]" />
              <span>{t.openWebcam}</span>
            </button>
          </div>
        ) : !isCheckedOut ? (
          /* STATE B ACTION CARD: Replaces Mark Attendance with Dynamic Today's Work Milestones Card */
          <div className="space-y-4 pt-1">
            {/* Dynamic Next-Action Card */}
            <div className="bg-linear-to-br from-blue-50/80 to-indigo-50/50 border-2 border-blue-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-[#0052cc] text-white shadow-xs">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 leading-tight">
                      {t.todaysWorkMilestones}
                    </h3>
                    <p className="text-xs font-semibold text-blue-700">
                      {isAllSubmitted
                        ? (language === 'hi'
                            ? `सभी ${totalMilestones} कार्य सबमिट हो चुके हैं (समीक्षाधीन)`
                            : `All ${totalMilestones} Milestones Submitted & Under Review`)
                        : (language === 'hi'
                            ? `चरण ${nextStepNumber} / ${totalMilestones} सबमिशन के लिए तैयार`
                            : `Step ${nextStepNumber} of ${totalMilestones} Ready for Submission`)}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-[#0052cc] text-xs font-mono font-bold border border-blue-200 shrink-0">
                  {submittedCount}/{totalMilestones}
                </span>
              </div>

              {/* Visual Step Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold">
                  <span>Commissioning Progress</span>
                  <span>{Math.round((submittedCount / totalMilestones) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#0052cc] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${(submittedCount / totalMilestones) * 100}%` }}
                  />
                </div>
              </div>

              {/* Big Action Button: START TODAY'S MILESTONES → */}
              <button
                id="start-milestones-btn"
                type="button"
                onClick={onNavigateToMilestones}
                className="w-full h-14 bg-[#0052cc] hover:bg-[#0041a3] active:bg-blue-900 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>
                  {submittedCount === 0
                    ? t.startTodaysMilestones
                    : t.continueMilestones}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Secondary Subtle Action: Punch Out / Shift End */}
            <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="text-xs text-gray-500 text-center sm:text-left">
                <span className="font-bold text-gray-700">{t.punchOutShiftEnd}: </span>
                <span>{t.punchOutSubtext}</span>
              </div>

              <button
                id="punch-out-btn"
                type="button"
                onClick={() => triggerDirectCamera('CHECK_OUT')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-700 font-bold text-xs border border-gray-300 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-gray-500" />
                <span>{t.punchOutShiftEnd}</span>
              </button>
            </div>
          </div>
        ) : (
          /* STATE C ACTION: Both Punches Complete */
          <div className="space-y-3 pt-1">
            <div className="p-4 bg-green-50 rounded-2xl border border-green-200 text-center space-y-2">
              <p className="text-xs font-bold text-green-900">
                {language === 'hi'
                  ? '✅ आज की दोनों शिफ्ट हाजिरी (चेक-इन और चेक-आउट) पूर्ण हो चुकी हैं।'
                  : '✅ Both check-in and check-out punches recorded for today.'}
              </p>
              <button
                onClick={onNavigateToMilestones}
                className="px-4 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a3] text-white font-bold text-xs flex items-center justify-center space-x-1.5 mx-auto transition-colors"
              >
                <span>View Job Site Milestones</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Location & Network Status Bar */}
        <div className="pt-1 border-t border-gray-100">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 stroke-[3]" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">
                Location Verified
              </span>
            </div>
            <span className="text-[11px] font-mono text-gray-500 font-bold">
              {todayRecord ? `${todayRecord.location.latitude.toFixed(2)}°, ${todayRecord.location.longitude.toFixed(2)}°` : '28.62°, 77.36°'}
            </span>
          </div>
        </div>
      </div>

      {/* Duty & Assigned Site Info */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          <HardHat className="w-4 h-4 text-[#0052cc]" />
          <span>{t.todaysDuty}</span>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2">
          <div className="text-sm font-bold text-gray-900">
            {t.dutyDetails}
          </div>
          <div className="flex items-center text-xs text-gray-600 font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1 text-red-500 shrink-0" />
            <span className="truncate">{user.substation}</span>
          </div>
          <div className="text-[11px] text-gray-500">
            Discom: <span className="text-gray-700 font-semibold">{user.discom}</span>
          </div>
        </div>

        {/* Safety checklist prompt */}
        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center space-x-2.5 text-xs text-blue-900 font-medium">
          <Zap className="w-4 h-4 text-[#0052cc] shrink-0" />
          <span>
            {language === 'hi'
              ? 'सुरक्षा नियम: 11kV लाइन पर काम करते समय इंसुलेटेड ग्लव्स व सेफ्टी हेलमेट अनिवार्य है।'
              : 'Safety First: Always wear 11kV rated safety gloves and helmet before line work.'}
          </span>
        </div>
      </div>
    </div>
  );
};
