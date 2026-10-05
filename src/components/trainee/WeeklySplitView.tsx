import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { WorkoutDay } from '@/types';
import { LiveWorkoutSession } from './LiveWorkoutSession';
import { 
  getUserActiveDraft, 
  getActiveWorkoutDraft, 
  isDayUnfinished, 
  clearUnfinishedStatus 
} from '@/lib/activeWorkoutEngine';
import { ShieldAlert, Play, ChevronRight, RotateCcw, CheckCircle2 } from 'lucide-react';

export const WeeklySplitView: React.FC = () => {
  const { currentUser, getPlanForUser, getUserLogs } = useGym();
  const plan = currentUser ? getPlanForUser(currentUser.id) : null;
  const userLogs = currentUser ? getUserLogs(currentUser.id) : [];

  const [hasManuallyExited, setHasManuallyExited] = useState(false);
  const [activeLiveDay, setActiveLiveDay] = useState<WorkoutDay | null>(() => {
    if (!currentUser || !plan) return null;
    const draft = getUserActiveDraft(currentUser.id);
    if (draft && plan.days) {
      const matched = plan.days.find((d) => d.id === draft.dayId);
      if (matched) return matched;
    }
    return null;
  });

  // Auto-resume in-progress workout session when entering Workouts tab unless manually exited
  useEffect(() => {
    if (!hasManuallyExited && !activeLiveDay && currentUser && plan && plan.days) {
      const draft = getUserActiveDraft(currentUser.id);
      if (draft) {
        const matched = plan.days.find((d) => d.id === draft.dayId);
        if (matched) {
          setActiveLiveDay(matched);
        }
      }
    }
  }, [hasManuallyExited, activeLiveDay, currentUser, plan]);

  if (!currentUser) return null;

  // If currently tracking a live workout session
  if (activeLiveDay && plan) {
    return (
      <LiveWorkoutSession
        plan={plan}
        day={activeLiveDay}
        onExit={() => {
          setHasManuallyExited(true);
          setActiveLiveDay(null);
        }}
        onSessionCompleted={() => {
          setHasManuallyExited(false);
          setActiveLiveDay(null);
        }}
      />
    );
  }

  if (!plan) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#18191e] border border-[#24262e] max-w-2xl mx-auto">
        <ShieldAlert className="w-10 h-10 mx-auto text-amber-400 mb-3" />
        <h3 className="text-base font-bold text-white">No Program Assigned</h3>
        <p className="text-xs text-zinc-400 mt-1">
          A customized workout split has not been assigned yet. Coach Yassen Ahmed will assign your training split shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-4 pb-28 md:pb-12">
      {/* Top Program Banner */}
      <div className="p-5 rounded-3xl bg-[#18191e] border border-[#24262e] flex flex-col justify-between gap-3 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#2f80ed]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {plan.title}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {plan.description || 'Targeted hypertrophy & progressive overload protocol.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-numeric text-zinc-300 pt-2 border-t border-[#24262e]">
          <div className="flex-1 px-3 py-2 rounded-2xl bg-[#141519] border border-[#24262e] text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Days / Wk</span>
            <span className="text-sm font-extrabold text-white">{plan.daysPerWeek}</span>
          </div>
          <div className="flex-1 px-3 py-2 rounded-2xl bg-[#141519] border border-[#24262e] text-center">
            <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Duration</span>
            <span className="text-sm font-extrabold text-[#2f80ed]">{plan.durationWeeks} Wks</span>
          </div>
        </div>
      </div>

      {/* Days Stack: Responsive Grid on Desktop */}
      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        {plan.days.map((day, idx) => (
          <div
            key={day.id}
            className={`rounded-3xl border transition-all overflow-hidden shadow-xl ${
              day.isRestDay ? 'bg-[#141519]/70 border-[#24262e]/60' : 'bg-[#18191e] border-[#24262e]'
            }`}
          >
            {/* Day Header: Number and Full Day Name on left with ample space, Movements & Time on right */}
            <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 border-b border-[#24262e]">
              {/* Left: Number directly next to Day Name */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <span className="w-8 h-8 rounded-xl bg-[#141519] border border-[#24262e] text-[#2f80ed] font-mono text-xs font-black flex items-center justify-center flex-shrink-0 shadow-inner">
                  {idx + 1}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                  {day.dayName}
                </h3>
              </div>

              {/* Right: Movements & Time in place of the button */}
              {day.isRestDay ? (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#141519] text-zinc-400 border border-[#24262e] flex-shrink-0">
                  Rest Day
                </span>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 whitespace-nowrap flex-shrink-0">
                  <span className="text-zinc-300 font-semibold">{day.estimatedMinutes}m</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-[#2f80ed] font-bold">{day.exercises.length} Movements</span>
                </div>
              )}
            </div>

            {/* Muscle Groups Stack (Compact Tabs in the Middle) */}
            {!day.isRestDay && day.exercises.length > 0 && (() => {
              // Group exercises by target muscle group and aggregate total sets
              const muscleSummary = day.exercises.reduce((acc, ex) => {
                const muscle = ex.targetMuscle || 'General';
                if (!acc[muscle]) {
                  acc[muscle] = {
                    muscleName: muscle,
                    totalSets: 0,
                    exerciseCount: 0
                  };
                }
                acc[muscle].totalSets += (ex.sets || 3);
                acc[muscle].exerciseCount += 1;
                return acc;
              }, {} as Record<string, { muscleName: string; totalSets: number; exerciseCount: number }>);

              const muscleGroupsList = Object.values(muscleSummary);

              return (
                <div className="p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
                  {muscleGroupsList.map((mg, mgIdx) => (
                    <div
                      key={mg.muscleName}
                      onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                        setActiveLiveDay(day);
                      }}
                      className="p-2.5 sm:p-3 px-3 sm:px-3.5 rounded-xl bg-[#141519] border border-[#24262e] hover:border-[#2f80ed]/40 hover:bg-[#18191e] transition-all cursor-pointer flex items-center justify-between gap-3 text-xs group shadow-sm"
                    >
                      {/* Left: Compact Badge + Consistent Muscle Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-[#18191e] border border-[#24262e] text-[#2f80ed] font-mono text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-inner">
                          {mgIdx + 1}
                        </span>
                        <span className="font-bold text-white text-xs sm:text-sm leading-tight truncate group-hover:text-[#2f80ed] transition-colors">
                          {mg.muscleName}
                        </span>
                      </div>

                      {/* Right: Sleek Sets Badge & Chevron */}
                      <div className="flex items-center gap-2 text-zinc-300 font-numeric text-xs flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-[#18191e] border border-[#24262e] font-mono font-semibold text-[#2f80ed] text-[11px] leading-tight flex items-center justify-center">
                          {mg.totalSets} Sets
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#2f80ed] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Bottom: Dedicated Workout Action Button */}
            {!day.isRestDay && (() => {
              const todayStr = new Date().toISOString().split('T')[0];
              const isDoneToday = userLogs.some(
                (l) => l.date === todayStr && (l.dayId === day.id || l.dayName === day.dayName)
              );
              const activeDraft = currentUser ? getActiveWorkoutDraft(currentUser.id, day.id) : null;
              const isUnfinished = currentUser ? isDayUnfinished(currentUser.id, day.id) : false;

              if (activeDraft) {
                return (
                  <div className="p-2.5 sm:p-3 pt-0">
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                        setHasManuallyExited(false);
                        setActiveLiveDay(day);
                      }}
                      className="w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#2f80ed]/25 active:scale-[0.99] transition-all btn-electric-blue"
                    >
                      <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>RESUME WORKOUT</span>
                    </button>
                  </div>
                );
              }

              if (isUnfinished && !isDoneToday) {
                return (
                  <div className="p-2.5 sm:p-3 pt-0 space-y-2">
                    <div className="px-3 py-1.5 rounded-xl bg-[#141519] border border-amber-500/30 flex items-center justify-between text-[11px]">
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Unfinished Session
                      </span>
                      <span className="text-zinc-500 font-mono text-[10px]">Did not finish</span>
                    </div>
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                        if (currentUser) clearUnfinishedStatus(currentUser.id, day.id);
                        setHasManuallyExited(false);
                        setActiveLiveDay(day);
                      }}
                      className="w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer bg-[#141519] hover:bg-[#1c1d22] text-[#2f80ed] border border-[#2f80ed]/30 active:scale-[0.99] transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restart Session</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="p-2.5 sm:p-3 pt-0">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                      setHasManuallyExited(false);
                      setActiveLiveDay(day);
                    }}
                    className={`w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99] transition-all ${
                      isDoneToday
                        ? 'bg-[#141519] hover:bg-[#1c1d22] text-[#2f80ed] border border-[#2f80ed]/30'
                        : 'btn-cyan'
                    }`}
                  >
                    {isDoneToday ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restart Session</span>
                        <span className="ml-1 text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30">
                          Done Today
                        </span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Workout</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}

            {day.isRestDay && (
              <div className="p-4 text-center">
                <p className="text-xs font-medium text-zinc-500">Scheduled Active Recovery & Muscle Repair</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
