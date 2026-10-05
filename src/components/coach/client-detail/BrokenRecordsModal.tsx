'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { User } from '@/types';
import {
  ExerciseProgressSummary,
  getAllBrokenRecords
} from '@/lib/progressEngine';
import { X, Search } from 'lucide-react';

interface BrokenRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: User;
  summaries: ExerciseProgressSummary[];
  onViewExerciseGraph?: (exerciseName: string) => void;
}

/**
 * BrokenRecordsModal
 * 
 * Displays an audit ledger of all personal records (Weight PRs & Rep Overloads)
 * achieved by an athlete over time, calculated directly from verified workout logs.
 * 
 * Architecture:
 * - Pure Presentation Layer with derived calculations memoized.
 * - Defensive empty-state fallbacks (safely handles athletes with 0 historical sessions).
 * - Widescreen (>= 1280px) visuals locked and preserved down to the pixel.
 * - Keyboard accessible (Escape key dismiss).
 */
export const BrokenRecordsModal: React.FC<BrokenRecordsModalProps> = ({
  isOpen,
  onClose,
  client,
  summaries = [],
  onViewExerciseGraph
}) => {
  const [filterType, setFilterType] = useState<'all' | 'weight_pr' | 'reps_pr'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape key press (Power-user accessibility)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Extract all broken records across all exercises dynamically with null-safety
  const allRecords = useMemo(() => {
    if (!Array.isArray(summaries) || summaries.length === 0) return [];
    return getAllBrokenRecords(summaries);
  }, [summaries]);

  // Categorized records
  const weightPRs = useMemo(() => {
    return allRecords.filter((r) => r.recordType === 'weight_pr');
  }, [allRecords]);

  const repsPRs = useMemo(() => {
    return allRecords.filter((r) => r.recordType === 'reps_pr');
  }, [allRecords]);

  // Cumulative net strength gain across movements (safely rounded to 1 decimal)
  const totalStrengthGainKg = useMemo(() => {
    if (!Array.isArray(summaries) || summaries.length === 0) return 0;
    const total = summaries.reduce((sum, ex) => sum + Math.max(0, ex?.netWeightGainKg || 0), 0);
    return Math.round(total * 10) / 10;
  }, [summaries]);

  // Filtered & searched records
  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allRecords.filter((rec) => {
      const matchesType = filterType === 'all' ? true : rec.recordType === filterType;
      if (!matchesType) return false;
      if (!query) return true;

      const nameMatch = (rec.exerciseName || '').toLowerCase().includes(query);
      const muscleMatch = (rec.targetMuscle || '').toLowerCase().includes(query);
      const dayMatch = (rec.dayName || '').toLowerCase().includes(query);
      return nameMatch || muscleMatch || dayMatch;
    });
  }, [allRecords, filterType, searchQuery]);

  const handleSelectRecordGraph = useCallback((exerciseName: string) => {
    onClose();
    if (onViewExerciseGraph) {
      onViewExerciseGraph(exerciseName);
    }
  }, [onClose, onViewExerciseGraph]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none cursor-pointer"
      onClick={(e) => {
        // Dismiss when clicking the backdrop container
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="broken-records-title"
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#090d14] border border-white/[0.08] shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.07] bg-[#090d14] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Milestone Telemetry
              </span>
              <span className="text-slate-600 text-xs">&bull;</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                {client?.name || 'Athlete'}
              </span>
            </div>
            <h2 id="broken-records-title" className="text-sm sm:text-base font-bold text-white mt-0.5 tracking-tight">
              Broken Records &amp; Strength Milestones
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Highlight Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4 border-b border-white/[0.06] bg-[#05080e] flex-shrink-0">
          <div className="p-2.5 rounded-lg bg-[#090d14] border border-white/[0.04]">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-medium">
              Total Milestones
            </span>
            <span className="text-base font-semibold text-white font-numeric tracking-tight block mt-0.5">
              {allRecords.length} <span className="text-xs font-normal text-slate-400">Events</span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#090d14] border border-white/[0.04]">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-medium">
              Weight PRs
            </span>
            <span className="text-base font-semibold text-white font-numeric tracking-tight block mt-0.5">
              {weightPRs.length} <span className="text-xs font-normal text-slate-400">Lifts</span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#090d14] border border-white/[0.04]">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-medium">
              Rep Progressions
            </span>
            <span className="text-base font-semibold text-white font-numeric tracking-tight block mt-0.5">
              {repsPRs.length} <span className="text-xs font-normal text-emerald-400">Gains</span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#090d14] border border-white/[0.04]">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-medium">
              Net Strength Added
            </span>
            <span className="text-base font-semibold text-white font-numeric tracking-tight block mt-0.5">
              +{totalStrengthGainKg} <span className="text-xs font-normal text-emerald-400">kg</span>
            </span>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 sm:px-4 sm:py-3 border-b border-white/[0.06] bg-[#090d14] flex-shrink-0">
          {/* Segment Filter Buttons */}
          <div className="flex items-center gap-1.5">
            {[
              { key: 'all' as const, label: 'All Records', count: allRecords.length },
              { key: 'weight_pr' as const, label: 'Weight PRs', count: weightPRs.length },
              { key: 'reps_pr' as const, label: 'Rep Progressions', count: repsPRs.length }
            ].map((tab) => {
              const isSelected = filterType === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterType(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-[#080c14] font-semibold shadow-sm'
                      : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.07] border border-white/[0.06]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-black/15 text-[#080c14]' : 'bg-white/[0.06] text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by exercise name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#05080e] border border-white/[0.07] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>

        {/* Broken Records List (Custom Scrollable Container) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2.5 min-h-[260px]">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-[#05080e] border border-white/[0.04] space-y-1.5">
              <h4 className="text-xs font-semibold text-white">No Broken Records Found</h4>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? `No milestones match "${searchQuery}". Try clearing your search.`
                  : 'As workouts are logged and personal bests or rep gains occur, they will automatically be recorded in this audit ledger.'}
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const isWeightPR = record.recordType === 'weight_pr';

              return (
                <div
                  key={record.id}
                  className="p-3 rounded-xl bg-[#05080e] border border-white/[0.06] hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Left info: Movement & Date */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                        {record.exerciseName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06] text-[10px] font-mono">
                        {record.targetMuscle}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${
                          isWeightPR
                            ? 'bg-white/[0.06] text-white border-white/[0.12]'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {isWeightPR ? 'Weight PR' : 'Rep Overload'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{record.date}</span>
                      <span>&bull;</span>
                      <span>{record.dayName}</span>
                      <span>&bull;</span>
                      <span>Est. 1RM: {record.est1RM} kg</span>
                    </div>

                    {/* Progress Detail */}
                    <div className="pt-1 text-xs font-mono flex flex-wrap items-center gap-2">
                      {isWeightPR ? (
                        <>
                          <span className="text-slate-400">
                            Previous Peak:{' '}
                            <span className="text-slate-200">{record.previousWeightKg} kg</span>
                          </span>
                          <span className="text-slate-600">to</span>
                          <span className="text-white font-semibold">
                            New Peak: {record.weightKg} kg &times; {record.reps} reps
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[11px] border border-emerald-500/20">
                            {record.deltaText}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-400">
                            Previous Reps:{' '}
                            <span className="text-slate-200">
                              {record.previousReps} reps at {record.weightKg} kg
                            </span>
                          </span>
                          <span className="text-slate-600">to</span>
                          <span className="text-white font-semibold">
                            New Reps: {record.reps} reps at {record.weightKg} kg
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[11px] border border-emerald-500/20">
                            {record.deltaText}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Action: Button to jump directly to this exercise's history graph */}
                  <div className="flex-shrink-0 sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleSelectRecordGraph(record.exerciseName)}
                      className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm text-center"
                    >
                      View Movement Graph
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:px-4 sm:py-3 border-t border-white/[0.07] bg-[#090d14] flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            Showing {filteredRecords.length} recorded milestone events
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-white border border-white/[0.08] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
