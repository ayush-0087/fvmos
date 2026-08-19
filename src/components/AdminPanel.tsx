import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  CalendarCheck,
  ListChecks,
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Sparkles,
  RefreshCw,
  Database,
  ArrowLeft
} from 'lucide-react';
import {
  AttendanceRecord,
  Milestone,
  MilestoneSubmission,
  UserProfile,
  Language
} from '../types';
import { translations } from '../translations';
import { MilestoneReviewModal } from './MilestoneReviewModal';

interface AdminPanelProps {
  user: UserProfile;
  attendanceRecords: AttendanceRecord[];
  milestones: Milestone[];
  submissions: MilestoneSubmission[];
  language: Language;
  onApproveSubmission: (submissionId: string, feedback: string) => Promise<void>;
  onRejectSubmission: (submissionId: string, feedback: string) => Promise<void>;
  onViewPhoto: (imageUrl: string, title: string) => void;
  onSwitchToElectricianView?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  user,
  attendanceRecords,
  milestones,
  submissions,
  language,
  onApproveSubmission,
  onRejectSubmission,
  onViewPhoto,
  onSwitchToElectricianView
}) => {
  const t = translations[language];
  const [adminTab, setAdminTab] = useState<'MILESTONES' | 'ATTENDANCE'>('MILESTONES');
  const [selectedSubmission, setSelectedSubmission] = useState<{
    submission: MilestoneSubmission;
    milestone: Milestone;
  } | null>(null);

  const [milestoneFilter, setMilestoneFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  // Map milestones
  const milestoneMap = new Map<string, Milestone>();
  milestones.forEach((m) => milestoneMap.set(m.id, m));

  // Count pending reviews
  const pendingReviewsCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const milestone = milestoneMap.get(sub.milestoneId);
    const matchesSearch =
      sub.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.workerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.substation.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (milestoneFilter === 'PENDING') return sub.status === 'pending';
    if (milestoneFilter === 'APPROVED') return sub.status === 'approved';
    if (milestoneFilter === 'REJECTED') return sub.status === 'rejected';
    return true;
  });

  // Filter attendance logs
  const filteredAttendance = attendanceRecords.filter((rec) => {
    return (
      rec.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.workerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.substation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.dateFormatted.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-5">
      {/* Top Supervisor Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-blue-50 text-[#0052cc] border border-blue-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0052cc] px-2 py-0.5 rounded-md border border-blue-200">
                Site Supervisor / Inspector
              </span>
              <span className="text-xs font-bold text-gray-500 font-mono">
                {user.workerId}
              </span>
            </div>
            <h2 className="text-lg font-black text-gray-900 leading-tight">
              {user.name}
            </h2>
            <p className="text-xs text-gray-500 truncate max-w-sm">
              {user.substation} • {user.discom}
            </p>
          </div>
        </div>

        {onSwitchToElectricianView && (
          <button
            onClick={onSwitchToElectricianView}
            className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center space-x-2 border border-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#0052cc]" />
            <span>Switch to Field Worker App</span>
          </button>
        )}
      </div>

      {/* Main Admin Section Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
        <button
          id="admin-tab-milestones"
          onClick={() => setAdminTab('MILESTONES')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all ${
            adminTab === 'MILESTONES'
              ? 'bg-[#0052cc] text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>{t.milestoneReviewQueue}</span>
          {pendingReviewsCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                adminTab === 'MILESTONES' ? 'bg-white text-[#0052cc]' : 'bg-orange-500 text-white'
              }`}
            >
              {pendingReviewsCount}
            </span>
          )}
        </button>

        <button
          id="admin-tab-attendance"
          onClick={() => setAdminTab('ATTENDANCE')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all ${
            adminTab === 'ATTENDANCE'
              ? 'bg-[#0052cc] text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{t.attendanceLogs}</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              adminTab === 'ATTENDANCE' ? 'bg-white text-[#0052cc]' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {attendanceRecords.length}
          </span>
        </button>
      </div>

      {/* Global Search Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-2.5 shadow-xs flex items-center space-x-2">
        <Search className="w-4 h-4 text-gray-400 ml-1 shrink-0" />
        <input
          type="text"
          placeholder={
            adminTab === 'MILESTONES'
              ? 'Search electrician, worker ID, or milestone name...'
              : 'Search attendance logs by name, ID, or substation...'
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-0 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-hidden"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[11px] font-bold text-gray-500 hover:text-gray-900 px-2 py-0.5"
          >
            Clear
          </button>
        )}
      </div>

      {/* TAB 1: MILESTONE REVIEW QUEUE */}
      {adminTab === 'MILESTONES' && (
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMilestoneFilter('PENDING')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 border transition-all ${
                milestoneFilter === 'PENDING'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Under Review ({pendingReviewsCount})</span>
            </button>

            <button
              onClick={() => setMilestoneFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 border transition-all ${
                milestoneFilter === 'APPROVED'
                  ? 'bg-green-600 text-white border-green-700 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved ({approvedCount})</span>
            </button>

            <button
              onClick={() => setMilestoneFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 border transition-all ${
                milestoneFilter === 'REJECTED'
                  ? 'bg-red-600 text-white border-red-700 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected ({rejectedCount})</span>
            </button>

            <button
              onClick={() => setMilestoneFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
                milestoneFilter === 'ALL'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>All Submissions ({submissions.length})</span>
            </button>
          </div>

          {/* Submissions List */}
          <div className="space-y-3">
            {filteredSubmissions.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center text-gray-500 text-xs">
                No milestone submissions in this view.
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const milestone = milestoneMap.get(sub.milestoneId);
                if (!milestone) return null;
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${sub.location.latitude},${sub.location.longitude}`;

                return (
                  <div
                    key={sub.id}
                    className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                      <div
                        onClick={() => onViewPhoto(sub.submittedImageUrl, `Milestone ${milestone.stepOrder}: ${milestone.title}`)}
                        className="relative w-16 h-16 rounded-2xl bg-black overflow-hidden border border-gray-300 shrink-0 cursor-pointer group"
                      >
                        <img
                          src={sub.submittedImageUrl}
                          alt="Submission thumbnail"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold text-[#0052cc] uppercase">
                            Step #{milestone.stepOrder}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              sub.status === 'approved'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : sub.status === 'rejected'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {sub.status === 'pending' ? 'UNDER REVIEW' : sub.status.toUpperCase()}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-gray-900 truncate">
                          {milestone.title}
                        </h4>

                        <div className="text-xs text-gray-600 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-semibold text-gray-900">
                            {sub.workerName} ({sub.workerId})
                          </span>
                          <span>•</span>
                          <span>{sub.dateFormatted} {sub.timeFormatted}</span>
                        </div>

                        <div className="flex items-center space-x-2 mt-1 text-[11px] text-gray-500 font-mono">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          <span>{sub.location.latitude.toFixed(4)}°, {sub.location.longitude.toFixed(4)}° (±{Math.round(sub.location.accuracy || 5)}m)</span>
                        </div>

                        {sub.adminFeedback && (
                          <div className="mt-2 text-[11px] bg-gray-50 p-2 rounded-xl text-gray-700 border border-gray-200">
                            <span className="font-bold">Feedback:</span> "{sub.adminFeedback}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button: Open Side-by-Side Review Modal */}
                    <div className="w-full sm:w-auto flex sm:flex-col items-center gap-2">
                      <button
                        onClick={() =>
                          setSelectedSubmission({
                            submission: sub,
                            milestone: milestone
                          })
                        }
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0052cc] hover:bg-[#0041a3] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Side-by-Side Review</span>
                      </button>

                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-[11px] border border-gray-200 flex items-center justify-center space-x-1"
                      >
                        <span>View Map</span>
                        <ExternalLink className="w-3 h-3 text-[#0052cc]" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE LOGS TABLE */}
      {adminTab === 'ATTENDANCE' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Electrician Attendance Logs
              </h3>
              <p className="text-xs text-gray-500">
                Verified check-in & check-out logs with embedded geostamp thumbnails
              </p>
            </div>
            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200 font-mono">
              {filteredAttendance.length} records
            </span>
          </div>

          {filteredAttendance.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs">
              No attendance records match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-3">Selfie</th>
                    <th className="py-3 px-3">Electrician</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">GPS Location</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAttendance.map((rec) => {
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${rec.location.latitude},${rec.location.longitude}`;
                    const isCheckIn = rec.type === 'CHECK_IN';

                    return (
                      <tr key={rec.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <img
                            src={rec.photoDataUrl}
                            alt="Attendance Selfie"
                            onClick={() => onViewPhoto(rec.photoDataUrl, `${rec.workerName} - ${rec.dateFormatted}`)}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-300 cursor-pointer shadow-xs"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-900">{rec.workerName}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{rec.workerId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              isCheckIn
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {isCheckIn ? 'Check In' : 'Check Out'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-gray-900">{rec.dateFormatted}</div>
                          <div className="text-[11px] text-gray-500">{rec.timeFormatted}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono text-[#0052cc] text-[11px] font-bold">
                            {rec.location.latitude.toFixed(4)}°, {rec.location.longitude.toFixed(4)}°
                          </div>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-600 hover:underline flex items-center space-x-0.5 mt-0.5"
                          >
                            <span>Open Map</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.syncStatus === 'synced'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-orange-50 text-orange-700'
                            }`}
                          >
                            {rec.syncStatus === 'synced' ? 'Synced' : 'Offline Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side Review Modal */}
      {selectedSubmission && (
        <MilestoneReviewModal
          submission={selectedSubmission.submission}
          milestone={selectedSubmission.milestone}
          language={language}
          onClose={() => setSelectedSubmission(null)}
          onApprove={onApproveSubmission}
          onReject={onRejectSubmission}
        />
      )}
    </div>
  );
};
