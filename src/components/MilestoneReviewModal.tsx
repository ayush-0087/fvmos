import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Send,
  SplitSquareVertical,
  Maximize2
} from 'lucide-react';
import { Milestone, MilestoneSubmission, Language } from '../types';
import { translations } from '../translations';

interface MilestoneReviewModalProps {
  submission: MilestoneSubmission;
  milestone: Milestone;
  language: Language;
  onClose: () => void;
  onApprove: (submissionId: string, feedback: string) => Promise<void>;
  onReject: (submissionId: string, feedback: string) => Promise<void>;
}

export const MilestoneReviewModal: React.FC<MilestoneReviewModalProps> = ({
  submission,
  milestone,
  language,
  onClose,
  onApprove,
  onReject
}) => {
  const t = translations[language];
  const [feedback, setFeedback] = useState(submission.adminFeedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${submission.location.latitude},${submission.location.longitude}`;

  const handleApproveClick = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onApprove(submission.id, feedback || 'Approved - Quality and safety standard met.');
      onClose();
    } catch (err) {
      setError('Failed to approve milestone submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = async () => {
    if (!feedback.trim()) {
      setError('Please provide specific correction feedback for the electrician before rejecting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onReject(submission.id, feedback.trim());
      onClose();
    } catch (err) {
      setError('Failed to reject milestone submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-blue-50 text-[#0052cc] font-black text-sm border border-blue-200">
              #{milestone.stepOrder}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Side-by-Side Milestone Verification
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    submission.status === 'approved'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : submission.status === 'rejected'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {submission.status === 'pending' ? 'UNDER REVIEW' : submission.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                {milestone.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Worker Metadata & GPS Location Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0052cc] text-white font-black text-xs flex items-center justify-center">
                  {submission.workerName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    {submission.workerName} ({submission.workerId})
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Ph: {submission.workerPhone} • {submission.dateFormatted} {submission.timeFormatted}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-gray-900 font-mono">
                    {submission.location.latitude.toFixed(5)}° N, {submission.location.longitude.toFixed(5)}° E (±{Math.round(submission.location.accuracy || 5)}m)
                  </div>
                  <div className="text-[11px] text-gray-500 truncate max-w-[220px]">
                    {submission.substation}
                  </div>
                </div>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-xl bg-white border border-gray-200 text-[#0052cc] hover:bg-blue-50 text-[11px] font-bold flex items-center space-x-1 shrink-0"
              >
                <span>Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Side-by-Side Image Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: Reference Standard Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-gray-900 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#0052cc] mr-1.5" />
                  <span>1. Standard SOP Reference Sample</span>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">Benchmark</span>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-300 h-64 sm:h-80 flex items-center justify-center">
                <img
                  src={milestone.referenceImageUrl}
                  alt="Standard Reference Work"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white text-[10px] font-bold border border-white/20">
                  STANDARD SOP
                </div>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                {milestone.description}
              </p>
            </div>

            {/* Column 2: Worker Uploaded Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-gray-900 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600 mr-1.5" />
                  <span>2. Electrician Live Upload ({submission.compressedSizeKb} KB)</span>
                </div>
                <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  Geo-Stamped
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-300 h-64 sm:h-80 flex items-center justify-center">
                <img
                  src={submission.submittedImageUrl}
                  alt="Worker Uploaded Milestone Work"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white text-[10px] font-bold border border-white/20">
                  FIELD AUDIT CAPTURE
                </div>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                Captured via rear camera with hardware lock & timestamp burned directly into JPEG pixels.
              </p>
            </div>
          </div>

          {/* Feedback & Review Input */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-gray-900">
              Supervisor Notes & Rejection / Approval Feedback:
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Approved with good ferrule grouping OR Reject: Conduit bend radius too sharp, please fix saddles at 600mm spacing..."
              className="w-full p-3 rounded-2xl border border-gray-300 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-hidden focus:border-[#0052cc] focus:ring-2 focus:ring-blue-100"
            />
            {error && (
              <div className="text-xs text-red-600 font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs border border-gray-300 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            <button
              id="reject-milestone-btn"
              type="button"
              onClick={handleRejectClick}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-500/20 flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>{t.rejectMilestone}</span>
            </button>

            <button
              id="approve-milestone-btn"
              type="button"
              onClick={handleApproveClick}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-green-500/20 flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.approveMilestone}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
