import React, { useState } from 'react';
import {
  ListChecks,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Milestone, MilestoneSubmission, Language } from '../types';
import { translations } from '../translations';
import { MilestoneCard } from './MilestoneCard';

interface MilestonesTabProps {
  milestones: Milestone[];
  submissions: MilestoneSubmission[];
  language: Language;
  onOpenVideo: (milestone: Milestone) => void;
  onOpenSubmit: (milestone: Milestone) => void;
  onViewPhoto: (imageUrl: string, title: string) => void;
}

export const MilestonesTab: React.FC<MilestonesTabProps> = ({
  milestones,
  submissions,
  language,
  onOpenVideo,
  onOpenSubmit,
  onViewPhoto
}) => {
  const t = translations[language];
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Map submissions by milestone ID
  const submissionMap = new Map<string, MilestoneSubmission>();
  submissions.forEach((sub) => {
    submissionMap.set(sub.milestoneId, sub);
  });

  const sortedMilestones = [...milestones].sort((a, b) => a.stepOrder - b.stepOrder);
  let unlockedUpTo = 0;
  for (let i = 0; i < sortedMilestones.length; i++) {
    const sub = submissionMap.get(sortedMilestones[i].id);
    if (sub?.status === 'approved') {
      unlockedUpTo = i + 1;
    } else {
      break;
    }
  }

  // Pre-calculate lock status per milestone using sortedMilestones
  const lockMap = new Map<string, boolean>();
  sortedMilestones.forEach((sm, index) => {
    lockMap.set(sm.id, index > unlockedUpTo);
  });

  // Calculate stats
  const total = milestones.length;
  let approvedCount = 0;
  let reviewCount = 0;
  let rejectedCount = 0;

  milestones.forEach((m) => {
    const sub = submissionMap.get(m.id);
    if (sub?.status === 'approved') approvedCount++;
    else if (sub?.status === 'pending') reviewCount++;
    else if (sub?.status === 'rejected') rejectedCount++;
  });

  const progressPct = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

  // Filter list
  const filteredMilestones = milestones.filter((m) => {
    const sub = submissionMap.get(m.id);
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.titleHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(m.stepOrder).includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterStatus === 'APPROVED') return sub?.status === 'approved';
    if (filterStatus === 'UNDER_REVIEW') return sub?.status === 'pending';
    if (filterStatus === 'REJECTED') return sub?.status === 'rejected';
    if (filterStatus === 'PENDING') return !sub;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Progress & Overview Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0052cc] border border-blue-200">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {t.milestoneListTitle}
              </h3>
              <p className="text-xs text-gray-500">
                {t.milestoneListSubtitle}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0052cc] border border-blue-200 font-mono">
            {approvedCount}/{total} Done
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-gray-600">Commissioning Progress</span>
            <span className="text-[#0052cc] font-mono">{progressPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0052cc] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Counters summary pills */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => setFilterStatus('APPROVED')}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              filterStatus === 'APPROVED'
                ? 'bg-green-50 border-green-300 ring-2 ring-green-200'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-green-700">Approved</div>
            <div className="text-sm font-black text-green-800 font-mono">{approvedCount}</div>
          </button>

          <button
            onClick={() => setFilterStatus('UNDER_REVIEW')}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              filterStatus === 'UNDER_REVIEW'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-amber-700">Review</div>
            <div className="text-sm font-black text-amber-800 font-mono">{reviewCount}</div>
          </button>

          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`p-2.5 rounded-2xl border text-center transition-all ${
              filterStatus === 'PENDING'
                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-gray-600">Pending</div>
            <div className="text-sm font-black text-gray-800 font-mono">{total - approvedCount - reviewCount}</div>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-2.5 shadow-xs flex items-center space-x-2">
        <Search className="w-4 h-4 text-gray-400 ml-1 shrink-0" />
        <input
          type="text"
          placeholder="Search milestones or step #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-0 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-hidden"
        />
        {filterStatus !== 'ALL' && (
          <button
            onClick={() => setFilterStatus('ALL')}
            className="text-[11px] font-bold text-[#0052cc] px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Sequential Milestone Cards List */}
      <div className="space-y-4">
        {filteredMilestones.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center text-gray-500 text-xs">
            No milestones match your current filter.
          </div>
        ) : (
          filteredMilestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              submission={submissionMap.get(milestone.id)}
              language={language}
              isLocked={lockMap.get(milestone.id) ?? false}
              onOpenVideo={onOpenVideo}
              onOpenSubmit={onOpenSubmit}
              onViewPhoto={onViewPhoto}
            />
          ))
        )}
      </div>
    </div>
  );
};
