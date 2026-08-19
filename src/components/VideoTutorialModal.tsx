import React from 'react';
import { X, Youtube, ShieldAlert, Sparkles } from 'lucide-react';
import { Milestone, Language } from '../types';
import { translations } from '../translations';

interface VideoTutorialModalProps {
  milestone: Milestone;
  language: Language;
  onClose: () => void;
}

export const VideoTutorialModal: React.FC<VideoTutorialModalProps> = ({
  milestone,
  language,
  onClose
}) => {
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200">
              <Youtube className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {t.milestoneStep.replace('{step}', String(milestone.stepOrder))}
              </div>
              <h3 className="text-sm font-bold text-gray-900 truncate max-w-[280px]">
                {language === 'hi' ? milestone.titleHi : milestone.title}
              </h3>
            </div>
          </div>

          <button
            id="close-video-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player (Responsive 16:9 iframe) */}
        <div className="relative w-full pb-[56.25%] bg-black">
          <iframe
            src={`${milestone.youtubeVideoUrl}?autoplay=1&rel=0`}
            title={milestone.title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Key Points & Safety Instructions */}
        <div className="p-5 bg-gray-50 space-y-3 overflow-y-auto max-h-[40vh]">
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-[#0052cc] mr-1.5" />
              <span>Standard Operating Procedure (SOP)</span>
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {language === 'hi' ? milestone.descriptionHi : milestone.description}
            </p>
          </div>

          {milestone.criticalTools && (
            <div className="p-3 bg-white rounded-2xl border border-gray-200 space-y-1.5">
              <div className="text-[11px] font-bold text-gray-900">
                Required Site Tools & Equipment:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {milestone.criticalTools.map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg text-[11px] font-semibold"
                  >
                    ⚡ {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Always wear 1000V rated insulated gloves and safety helmet before starting work.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a3] text-white font-bold text-xs shadow-sm transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
