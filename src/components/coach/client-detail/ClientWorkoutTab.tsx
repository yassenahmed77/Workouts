'use client';

import React, { useState } from 'react';
import { User, WorkoutPlan } from '@/types';
import { useGym } from '@/context/GymContext';
import { ChevronDown, ChevronRight, ExternalLink, Play } from 'lucide-react';
import { ExerciseProgressionVaultModal } from './ExerciseProgressionVaultModal';
import { sanitizeUrl } from '@/lib/sanitizer';

interface ClientWorkoutTabProps {
  client: User;
  onOpenPlanBuilderForUser: (userId: string, plan?: WorkoutPlan) => void;
}

export const ClientWorkoutTab: React.FC<ClientWorkoutTabProps> = ({
  client,
  onOpenPlanBuilderForUser,
}) => {
  const { getPlanForUser } = useGym();
  const currentPlan = getPlanForUser(client.id);
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  // Accordion state: track which days are expanded. Default to the first active workout day open.
  const [expandedDayIds, setExpandedDayIds] = useState<Record<string, boolean>>(() => {
    if (currentPlan && currentPlan.days.length > 0) {
      const firstActiveDay = currentPlan.days.find((d) => !d.isRestDay) || currentPlan.days[0];
      return { [firstActiveDay.id]: true };
    }
    return {};
  });

  const toggleDay = (dayId: string) => {
    setExpandedDayIds((prev) => ({
      ...prev,
      [dayId]: !prev[dayId]
    }));
  };

  const allDaysExpanded = currentPlan?.days.every((d) => expandedDayIds[d.id]) ?? false;

  const toggleAllDays = () => {
    if (!currentPlan) return;
    if (allDaysExpanded) {
      setExpandedDayIds({});
    } else {
      const next: Record<string, boolean> = {};
      currentPlan.days.forEach((d) => { next[d.id] = true; });
      setExpandedDayIds(next);
    }
  };

  if (!currentPlan) {
    return (
      <div className="p-8 text-center rounded-xl bg-[#090d14] border border-white/[0.07] space-y-3 select-none">
        <div>
          <h3 className="text-sm font-bold text-white">No Workout Routine Assigned</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-sans">
            Design and architect a bespoke 1-on-1 periodized training routine tailored for {client.name}.
          </p>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => onOpenPlanBuilderForUser(client.id)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            + Build Custom Routine for {client.name}
          </button>
        </div>
      </div>
    );
  }

  const totalExercises = currentPlan.days.reduce((acc, d) => acc + d.exercises.length, 0);

  return (
    <div className="flex flex-col h-full space-y-1.5 select-none">
      
      {/* 1. Protocol Overview Telemetry Banner (Slim Executive Capsule) */}
      <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/[0.07] space-y-2 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex-shrink-0">
              Training Split
            </span>
            <span className="text-slate-600 text-xs hidden sm:inline">&bull;</span>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
              {currentPlan.title}
            </h3>
            <span className="px-1.5 py-0.2 rounded bg-white/[0.05] border border-white/[0.08] text-[9.5px] font-mono text-slate-300 font-medium flex-shrink-0 hidden sm:inline">
              {currentPlan.level}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsVaultOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer shadow-xs"
            >
              Exercise History
            </button>
            <button
              type="button"
              onClick={() => onOpenPlanBuilderForUser(client.id, currentPlan)}
              className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 active:scale-95 text-[#080c14] text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Edit Routine
            </button>
          </div>
        </div>

        {/* 4 Compact Telemetry Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-white/[0.05]">
          <div className="p-1.5 rounded-lg bg-[#05080e] border border-white/[0.04] text-center">
            <span className="text-[9px] font-mono uppercase text-slate-400 block font-semibold">Frequency</span>
            <span className="text-xs font-bold text-white mt-0.5 block font-mono">
              {currentPlan.daysPerWeek} Days / Week
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-[#05080e] border border-white/[0.04] text-center">
            <span className="text-[9px] font-mono uppercase text-slate-400 block font-semibold">Duration</span>
            <span className="text-xs font-bold text-white mt-0.5 block font-mono">
              {currentPlan.durationWeeks} Weeks
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-[#05080e] border border-white/[0.04] text-center">
            <span className="text-[9px] font-mono uppercase text-slate-400 block font-semibold">Experience</span>
            <span className="text-xs font-bold text-white mt-0.5 block font-mono">
              {currentPlan.level}
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-[#05080e] border border-white/[0.04] text-center">
            <span className="text-[9px] font-mono uppercase text-slate-400 block font-semibold">Movements</span>
            <span className="text-xs font-bold text-emerald-400 mt-0.5 block font-mono">
              {totalExercises} Exercises
            </span>
          </div>
        </div>
      </div>

      {/* 2. Days & Exercises Accordion Breakdown */}
      <div className="flex-1 min-h-0 flex flex-col space-y-1">
        {/* Accordion Controls Bar */}
        <div className="flex items-center justify-between px-1 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Weekly Routine Breakdown ({currentPlan.days.length} Days)
            </span>
            <span className="text-slate-600 text-xs hidden sm:inline">&bull;</span>
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
              Click any workout to expand / collapse
            </span>
          </div>

          <button
            type="button"
            onClick={toggleAllDays}
            className="text-[10px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/[0.04]"
          >
            {allDaysExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        {/* Scrollable Accordion Days Container */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
          {currentPlan.days.map((day, idx) => {
            const isExpanded = Boolean(expandedDayIds[day.id]);
            const totalSetsForDay = day.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);

            return (
              <div
                key={day.id}
                className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                  isExpanded
                    ? 'bg-[#090d14] border-white/20 shadow-xs'
                    : 'bg-[#090d14] border-white/[0.06] hover:border-white/12'
                }`}
              >
                {/* Accordion Header (Click to toggle) */}
                <div
                  onClick={() => toggleDay(day.id)}
                  className="w-full p-2.5 flex items-center justify-between gap-3 text-left hover:bg-white/[0.02] cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded-md border text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 ${
                      day.isRestDay
                        ? 'bg-white/[0.02] border-white/[0.06] text-slate-500'
                        : isExpanded
                        ? 'bg-white/[0.12] border-white/30 text-white shadow-2xs'
                        : 'bg-white/[0.04] border-white/[0.08] text-slate-300'
                    }`}>
                      {idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-semibold text-white tracking-tight truncate">
                          {day.dayName}
                        </h5>
                        {day.isRestDay ? (
                          <span className="px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.06] text-[9.5px] font-mono text-slate-400">
                            Rest
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                            {day.exercises.length} Movements &bull; {totalSetsForDay} Sets &bull; ~{day.estimatedMinutes || 60}m
                          </span>
                        )}
                      </div>

                      {/* Muscle Groups Pills */}
                      {!day.isRestDay && day.targetMuscles.length > 0 && (
                        <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
                          {day.targetMuscles.map((muscle) => (
                            <span
                              key={muscle}
                              className="text-[9px] font-mono text-slate-400 px-1 py-0.2 rounded bg-white/[0.03] border border-white/[0.05]"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Header Status & Chevron */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!day.isRestDay && (
                      <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
                        {day.exercises.length} ex &bull; {totalSetsForDay} sets
                      </span>
                    )}
                    <span className="p-1 rounded bg-white/[0.03] text-slate-400">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Accordion Content (Reveals when expanded) */}
                {isExpanded && (
                  <div className="p-2.5 pt-0 border-t border-white/[0.04] space-y-1.5 mt-1">
                    {day.isRestDay ? (
                      <div className="p-3 rounded-lg bg-[#05080e] border border-white/[0.04] text-center space-y-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                          Scheduled Recovery Day
                        </span>
                        <p className="text-xs text-slate-300 max-w-sm mx-auto">
                          Active physiological recovery protocol. Focus on optimal hydration, nutrient absorption, mobility, and 7-9 hours of sleep.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {day.exercises.map((ex, exIdx) => (
                          <div
                            key={ex.id}
                            className="p-2 rounded-lg bg-[#05080e] border border-white/[0.04] space-y-1 text-xs hover:border-white/10 transition-colors"
                          >
                            {/* Exercise Title Row */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-slate-500 text-[10px] font-mono flex-shrink-0 w-4">
                                  {String(exIdx + 1).padStart(2, '0')}.
                                </span>
                                <div className="min-w-0">
                                  <span className="font-semibold text-white block truncate text-xs">
                                    {ex.exerciseName}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {ex.targetMuscle} &bull; {ex.equipment}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right flex items-center gap-2 flex-shrink-0 font-numeric text-xs font-mono">
                                <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-white font-bold">
                                  {ex.sets} &times; {ex.targetReps}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {ex.restSeconds}s rest
                                </span>
                                {ex.targetRpe && (
                                  <span className="text-[10px] text-cyan-400 font-medium hidden sm:inline">
                                    RIR {ex.targetRpe}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Execution Notes / Form Cues / Alternatives / Video Link */}
                            {(ex.notes || ex.alternativeExercise || (ex.alternatives && ex.alternatives.length > 0) || ex.videoUrl) && (
                              <div className="pt-1 border-t border-white/[0.04] space-y-1 text-[10px] text-slate-400 font-mono">
                                {ex.notes && (
                                  <div className="px-2 py-1 rounded bg-white/[0.02] border-l-2 border-cyan-400/60 text-slate-300 font-sans italic text-[11px] leading-relaxed">
                                    {ex.notes}
                                  </div>
                                )}
                                <div className="flex flex-wrap items-center justify-between gap-1.5">
                                  {ex.alternatives && ex.alternatives.length > 0 ? (
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="text-slate-500 font-semibold">Swaps:</span>
                                      {ex.alternatives.map((alt, i) => (
                                        <span
                                          key={i}
                                          className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-white/[0.03] border border-white/[0.06] text-slate-300 text-[10px]"
                                        >
                                          <span>{alt.name}</span>
                                          {alt.videoUrl && sanitizeUrl(alt.videoUrl) && (
                                            <a
                                              href={sanitizeUrl(alt.videoUrl)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-cyan-400 hover:text-cyan-300 underline font-mono text-[9px]"
                                            >
                                              Demo ↗
                                            </a>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                  ) : ex.alternativeExercise ? (
                                    <span className="truncate">
                                      Swap: <strong className="text-slate-300 font-normal">{ex.alternativeExercise}</strong>
                                    </span>
                                  ) : null}

                                  {ex.videoUrl && sanitizeUrl(ex.videoUrl) && (
                                    <a
                                      href={sanitizeUrl(ex.videoUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] text-[10px] font-medium text-slate-200 hover:text-white transition-all ml-auto inline-flex items-center gap-1"
                                    >
                                      <span>Video Guide ↗</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Exercise History Modal */}
      <ExerciseProgressionVaultModal
        client={client}
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />
    </div>
  );
};
