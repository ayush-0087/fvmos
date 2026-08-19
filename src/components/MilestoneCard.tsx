import React from 'react';
import {
  Video,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Camera,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  RotateCcw
} from 'lucide-react';
import { Milestone, MilestoneSubmission, Language } from '../types';
import { translations } from '../translations';

interface MilestoneCardProps {
  milestone: Milestone;
  submission?: MilestoneSubmission;
  language: Language;
  onOpenVideo: (milestone: Milestone) => void;
  onOpenSubmit: (milestone: Milestone) => void;
  onViewPhoto: (imageUrl: string, title: string) => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  submission,
  language,
  onOpenVideo,
  onOpenSubmit,
  onViewPhoto
}) => {
  const t = translations[language];

  // Derive status
  const status = submission ? submission.status : 'pending';

  const getStatusBadge = () => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <span>{t.statusApproved}</span>
          </span>
        );
      case 'pending': // submitted - under review
        if (submission) {
          return (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>{t.statusUnderReview}</span>
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
            <span>{t.statusPending}</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 flex items-center space-x-1">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>{t.statusRejected}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs transition-all hover:shadow-md space-y-4">
      {/* Top Header & Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0052cc] font-black text-sm flex items-center justify-center border border-blue-200 shrink-0">
            #{milestone.stepOrder}
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t.milestoneStep.replace('{step}', String(milestone.stepOrder))}
            </div>
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              {language === 'hi' ? milestone.titleHi : milestone.title}
            </h3>
          </div>
        </div>

        <div>{getStatusBadge()}</div>
      </div>

      {/* Description & Work Instructions */}
      <p className="text-xs text-gray-600 leading-relaxed">
        {language === 'hi' ? milestone.descriptionHi : milestone.description}
      </p>

      {/* Reference Work & Video Tutorial Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Sample Correct Work Card */}
        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-[#0052cc] mr-1" />
              <span>{t.referenceWork}</span>
            </span>
            <button
              onClick={() =>
                onViewPhoto(
                  milestone.referenceImageUrl,
                  `${t.referenceWork}: ${milestone.title}`
                )
              }
              className="text-[11px] font-bold text-[#0052cc] hover:underline"
            >
              Zoom
            </button>
          </div>

          <div
            onClick={() =>
              onViewPhoto(
                milestone.referenceImageUrl,
                `${t.referenceWork}: ${milestone.title}`
              )
            }
            className="relative h-28 rounded-xl overflow-hidden cursor-pointer group bg-black"
          >
            <img
              src={milestone.referenceImageUrl}
              alt="Reference Standard Work"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
              <span className="text-[10px] font-semibold text-white">
                🔍 Tap to inspect SOP standard
              </span>
            </div>
          </div>
        </div>

        {/* Video Tutorial Card */}
        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-2">
          <div>
            <div className="text-xs font-bold text-gray-900 flex items-center mb-1">
              <Video className="w-3.5 h-3.5 text-red-500 mr-1.5" />
              <span>Video Demonstration</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-snug">
              Watch step-by-step verified installation methods and safety checks.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenVideo(milestone)}
            className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs border border-gray-200 flex items-center justify-center space-x-2 shadow-xs transition-colors"
          >
            <Video className="w-4 h-4 text-red-500" />
            <span>{t.videoTutorial}</span>
          </button>
        </div>
      </div>

      {/* Rejection Feedback Box if Rejected */}
      {status === 'rejected' && submission?.adminFeedback && (
        <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 space-y-1">
          <div className="font-bold flex items-center text-red-700">
            <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
            <span>{t.supervisorFeedback}:</span>
          </div>
          <p className="text-[11px] leading-relaxed font-medium pl-5">
            "{submission.adminFeedback}"
          </p>
        </div>
      )}

      {/* Submitted Work Preview if available */}
      {submission && (
        <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={submission.submittedImageUrl}
              alt="Submitted Work"
              onClick={() =>
                onViewPhoto(
                  submission.submittedImageUrl,
                  `Submitted Work: ${milestone.title}`
                )
              }
              className="w-12 h-12 rounded-xl object-cover border border-gray-300 cursor-pointer shadow-xs"
            />
            <div className="text-xs">
              <div className="font-bold text-gray-900">
                {submission.dateFormatted} • {submission.timeFormatted}
              </div>
              <div className="text-[11px] text-gray-500">
                Size: {submission.compressedSizeKb} KB • Lat: {submission.location.latitude.toFixed(4)}°
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              onViewPhoto(
                submission.submittedImageUrl,
                `Submitted Work: ${milestone.title}`
              )
            }
            className="text-xs font-bold text-[#0052cc] hover:underline"
          >
            Inspect
          </button>
        </div>
      )}

      {/* Action Trigger Button */}
      <div>
        {status === 'approved' ? (
          <div className="w-full py-3 bg-green-50 text-green-700 font-bold text-xs uppercase tracking-wider rounded-2xl border border-green-200 flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Milestone Verified & Approved</span>
          </div>
        ) : status === 'rejected' ? (
          <button
            type="button"
            onClick={() => onOpenSubmit(milestone)}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-red-500/20 flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.resubmitWork}</span>
          </button>
        ) : submission ? (
          <button
            type="button"
            onClick={() => onOpenSubmit(milestone)}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider rounded-2xl border border-gray-300 flex items-center justify-center space-x-2 transition-colors"
          >
            <Camera className="w-4 h-4 text-[#0052cc]" />
            <span>Update / Retake Submission Photo</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpenSubmit(milestone)}
            className="w-full py-3.5 bg-[#0052cc] hover:bg-[#0041a3] active:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <Camera className="w-4 h-4" />
            <span>{t.submitWorkPhoto}</span>
          </button>
        )}
      </div>
    </div>
  );
};
