import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Zap,
  Image,
  RefreshCw
} from 'lucide-react';
import { AttendanceRecord, Language } from '../types';
import { translations } from '../translations';

interface HistoryTabProps {
  records: AttendanceRecord[];
  language: Language;
  onViewPhoto: (record: AttendanceRecord) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  records,
  language,
  onViewPhoto
}) => {
  const t = translations[language];
  const [filter, setFilter] = useState<'ALL' | 'WEEK' | 'MONTH'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logic
  const now = new Date();
  const filteredRecords = records.filter((r) => {
    // Search query
    if (searchTerm) {
      const matchSearch =
        r.dateFormatted.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.timeFormatted.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.substation.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
    }

    if (filter === 'WEEK') {
      const recDate = new Date(r.timestamp);
      const diffDays = (now.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }

    if (filter === 'MONTH') {
      const recDate = new Date(r.timestamp);
      const diffDays = (now.getTime() - recDate.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 30;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'hi' ? 'दिनांक या समय से खोजें...' : 'Search by date or time...'}
            className="w-full h-12 pl-10 pr-4 bg-gray-50 border-2 border-gray-200 focus:border-[#0052cc] focus:bg-white rounded-xl text-gray-900 text-xs outline-none transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-colors ${
              filter === 'ALL'
                ? 'bg-[#0052cc] text-white shadow-md shadow-blue-500/20'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {t.filterAll} ({records.length})
          </button>
          <button
            onClick={() => setFilter('WEEK')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-colors ${
              filter === 'WEEK'
                ? 'bg-[#0052cc] text-white shadow-md shadow-blue-500/20'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {t.filterThisWeek}
          </button>
          <button
            onClick={() => setFilter('MONTH')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-colors ${
              filter === 'MONTH'
                ? 'bg-[#0052cc] text-white shadow-md shadow-blue-500/20'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {t.filterThisMonth}
          </button>
        </div>
      </div>

      {/* Record Cards */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center space-y-2">
          <Calendar className="w-10 h-10 text-gray-400 mx-auto" />
          <p className="text-sm font-bold text-gray-500">{t.noRecords}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((rec) => {
            const isCheckIn = rec.type === 'CHECK_IN';
            return (
              <div
                key={rec.id}
                id={`record-card-${rec.id}`}
                className="bg-white border border-gray-200 hover:border-[#0052cc]/40 rounded-2xl p-4 shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Photo Thumbnail */}
                  <button
                    type="button"
                    onClick={() => onViewPhoto(rec)}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 shrink-0 group bg-gray-100"
                  >
                    {rec.photoDataUrl ? (
                      <img
                        src={rec.photoDataUrl}
                        alt="Selfie"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Image className="w-6 h-6" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 flex items-center justify-center">
                      <div className="p-1 rounded-full bg-white/90 text-gray-900 shadow-xs">
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </button>

                  {/* Record Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isCheckIn
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {isCheckIn ? '⚡ CHECK-IN' : '🏁 CHECK-OUT'}
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {rec.dateFormatted}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#0052cc]">
                        {rec.timeFormatted}
                      </span>
                    </div>

                    {/* Coordinates & Accuracy */}
                    <div className="flex items-center text-[11px] font-mono text-gray-600 mb-1 truncate">
                      <MapPin className="w-3 h-3 text-red-500 mr-1 shrink-0" />
                      <span>
                        {rec.location.latitude.toFixed(4)}°N, {rec.location.longitude.toFixed(4)}°E (±{Math.round(rec.location.accuracy)}m)
                      </span>
                    </div>

                    {/* Bandwidth Optimization Metric & Sync Status */}
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-gray-100">
                      <span className="text-green-700 font-bold">
                        📦 {rec.compressedSizeKb} KB ({rec.compressionRatio}% saved)
                      </span>
                      <span
                        className={`font-sans font-semibold flex items-center ${
                          rec.syncStatus === 'synced'
                            ? 'text-green-700'
                            : 'text-orange-700'
                        }`}
                      >
                        {rec.syncStatus === 'synced' ? (
                          <>
                            <ShieldCheck className="w-3 h-3 mr-0.5 text-green-600" />
                            <span>{language === 'hi' ? 'सिंक हुआ' : 'Cloud Synced'}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-0.5 text-orange-600" />
                            <span>{language === 'hi' ? 'लोकल सुरक्षित' : 'Local (Pending)'}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
