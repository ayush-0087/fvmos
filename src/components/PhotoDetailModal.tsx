import React from 'react';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
  Zap,
  HardHat,
  Download
} from 'lucide-react';
import { AttendanceRecord, Language } from '../types';
import { translations } from '../translations';

interface PhotoDetailModalProps {
  record: AttendanceRecord;
  language: Language;
  onClose: () => void;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  record,
  language,
  onClose
}) => {
  const t = translations[language];
  const isCheckIn = record.type === 'CHECK_IN';

  const mapsUrl = `https://www.google.com/maps?q=${record.location.latitude},${record.location.longitude}`;

  const handleDownload = () => {
    if (!record.photoDataUrl) return;
    const link = document.createElement('a');
    link.href = record.photoDataUrl;
    link.download = `Attendance_${record.workerId}_${record.dateFormatted.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isCheckIn
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {isCheckIn ? '⚡ CHECK-IN' : '🏁 CHECK-OUT'}
            </span>
            <span className="text-xs font-bold text-gray-900">
              {record.dateFormatted} • {record.timeFormatted}
            </span>
          </div>

          <button
            id="close-photo-detail-modal"
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Display */}
        <div className="p-3 bg-black flex-1 overflow-y-auto flex items-center justify-center min-h-[300px]">
          {record.photoDataUrl ? (
            <img
              src={record.photoDataUrl}
              alt="Watermarked Attendance Selfie"
              className="w-full h-auto max-h-[480px] object-contain rounded-2xl border border-gray-800"
            />
          ) : (
            <div className="text-gray-400 text-sm">No photo available</div>
          )}
        </div>

        {/* Metadata Details */}
        <div className="p-5 bg-gray-50 border-t border-gray-200 space-y-3">
          {/* Coordinates and Map Link */}
          <div className="p-3.5 bg-white rounded-2xl border border-gray-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-red-500" />
                <span>Geo Coordinates</span>
              </span>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-[#0052cc] hover:underline flex items-center"
              >
                <span>{t.viewOnMap}</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
            <div className="font-mono text-[#0052cc] font-bold text-xs">
              {record.location.latitude.toFixed(6)}° N, {record.location.longitude.toFixed(6)}° E
            </div>
            <div className="text-gray-600 text-xs truncate">
              {record.location.address || record.substation}
            </div>
          </div>

          {/* Stats Bar & Download */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] font-mono text-gray-500">
              ⚡ ID: <span className="text-gray-900 font-bold">{record.workerId}</span> | Size: <span className="text-green-700 font-bold">{record.compressedSizeKb} KB</span>
            </div>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a3] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
