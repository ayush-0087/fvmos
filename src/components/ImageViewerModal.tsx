import React from 'react';
import { X, Download, ZoomIn } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface ImageViewerModalProps {
  imageUrl: string;
  title: string;
  language: Language;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  title,
  language,
  onClose
}) => {
  const t = translations[language];

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 truncate max-w-[380px]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Full Image */}
        <div className="p-3 bg-black flex-1 overflow-y-auto flex items-center justify-center min-h-[300px] max-h-[65vh]">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto max-h-[60vh] object-contain rounded-2xl"
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            High-Definition Field Audit View
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs border border-gray-200 flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a3] text-white font-bold text-xs transition-colors shadow-xs"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
