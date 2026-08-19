import React, { useState } from 'react';
import {
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Server,
  Zap
} from 'lucide-react';
import { AttendanceRecord, Language } from '../types';
import { translations } from '../translations';
import { isSupabaseConfigured } from '../services/storageService';

interface SyncQueueTabProps {
  records: AttendanceRecord[];
  language: Language;
  onSyncNow: () => void;
  isSyncing: boolean;
}

export const SyncQueueTab: React.FC<SyncQueueTabProps> = ({
  records,
  language,
  onSyncNow,
  isSyncing
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  const pendingRecords = records.filter((r) => r.syncStatus === 'pending');
  const isConfigured = isSupabaseConfigured();
  const isOnline = navigator.onLine;

  const sqlSchema = `-- Supabase PostgreSQL Schema for Bijli Sevak Field Electrician App

-- 1. Workers / Electricians & Supervisors
CREATE TABLE IF NOT EXISTS public.workers (
    id TEXT PRIMARY KEY,
    worker_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_hi TEXT,
    phone TEXT,
    role TEXT NOT NULL,
    user_type TEXT DEFAULT 'worker', -- 'worker' or 'admin'
    discom TEXT,
    substation TEXT,
    pin TEXT DEFAULT '1234',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Daily Attendance Pushes
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    worker_phone TEXT,
    substation TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    date_formatted TEXT,
    time_formatted TEXT,
    attendance_type TEXT NOT NULL, -- 'CHECK_IN' or 'CHECK_OUT'
    latitude FLOAT8 NOT NULL,
    longitude FLOAT8 NOT NULL,
    accuracy_meters FLOAT8,
    address TEXT,
    compressed_size_kb INT4,
    original_size_kb INT4,
    photo_url TEXT,
    sync_status TEXT DEFAULT 'synced',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Milestones Definitions
CREATE TABLE IF NOT EXISTS public.milestones (
    id TEXT PRIMARY KEY,
    step_order INT4 NOT NULL,
    title TEXT NOT NULL,
    title_hi TEXT,
    description TEXT NOT NULL,
    description_hi TEXT,
    youtube_video_url TEXT,
    reference_image_url TEXT,
    critical_tools TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Milestone Work Photo Submissions & Supervisor Review
CREATE TABLE IF NOT EXISTS public.milestone_submissions (
    id TEXT PRIMARY KEY,
    milestone_id TEXT REFERENCES public.milestones(id) ON DELETE CASCADE,
    worker_id TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    worker_phone TEXT,
    substation TEXT,
    submitted_at TIMESTAMPTZ NOT NULL,
    date_formatted TEXT,
    time_formatted TEXT,
    submitted_image_url TEXT NOT NULL,
    compressed_size_kb INT4,
    latitude FLOAT8 NOT NULL,
    longitude FLOAT8 NOT NULL,
    accuracy_meters FLOAT8,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_feedback TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    sync_status TEXT DEFAULT 'synced',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_submissions ENABLE ROW LEVEL SECURITY;

-- Permissive RLS Policies for Mobile PWA
CREATE POLICY "Allow public all on workers" ON public.workers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on milestones" ON public.milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on submissions" ON public.milestone_submissions FOR ALL USING (true) WITH CHECK (true);

-- Storage Buckets Setup:
-- Create 2 Public Buckets in Supabase Storage:
-- 1. 'attendance-selfies' (Public: true)
-- 2. 'milestone-work-photos' (Public: true)`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Network & Sync Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-[#0052cc]" />
            <h3 className="font-bold text-gray-900 text-base">
              {t.syncQueue}
            </h3>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
              isOnline
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-orange-50 text-orange-700 border border-orange-200'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-green-600" />
                <span>{t.online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-orange-600" />
                <span>{t.offline}</span>
              </>
            )}
          </span>
        </div>

        {/* Sync Status Banner */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-gray-900 font-mono">
              {pendingRecords.length}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {pendingRecords.length === 0
                ? t.allSynced
                : language === 'hi'
                ? `${pendingRecords.length} रिकॉर्ड क्लाउड में अपलोड होने बाकी हैं`
                : `${pendingRecords.length} records queued for cloud sync`}
            </div>
          </div>

          <button
            id="manual-sync-btn"
            type="button"
            onClick={onSyncNow}
            disabled={isSyncing || pendingRecords.length === 0 || !isOnline}
            className="px-4 py-3 bg-[#0052cc] hover:bg-[#0041a3] active:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 flex items-center space-x-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : t.syncNow.replace('{count}', String(pendingRecords.length))}</span>
          </button>
        </div>
      </div>

      {/* Supabase Integration Details Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-green-600" />
            <h4 className="font-bold text-gray-900 text-sm">
              Supabase PostgreSQL Database
            </h4>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isConfigured
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-100 text-[#0052cc] border border-gray-200'
            }`}
          >
            {isConfigured ? '🟢 Connected' : '⚡ Local-First Engine'}
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          {language === 'hi'
            ? 'यह PWA बिना इंटरनेट के भी पूरी तरह काम करता है (ऑफ़लाइन-फ़र्स्ट)। इंटरनेट आने पर या सुपाबेस क्रेडेंशियल जोड़ने पर डेटा स्वचालित रूप से सिंक हो जाता है।'
            : 'This PWA works 100% offline in rural/remote sub-stations. When connected, records and compressed photos sync directly to Supabase storage.'}
        </p>

        {/* SQL Schema Box */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">
              PostgreSQL Table Schema
            </span>
            <button
              onClick={handleCopySql}
              className="flex items-center space-x-1 text-[11px] font-bold text-[#0052cc] hover:underline"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="p-3.5 bg-gray-900 text-gray-200 rounded-xl border border-gray-800 text-[10px] font-mono overflow-x-auto max-h-40">
            {sqlSchema}
          </pre>
        </div>
      </div>
    </div>
  );
};
