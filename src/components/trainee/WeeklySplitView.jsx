import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { LiveWorkoutSession } from './LiveWorkoutSession';
import { getUserActiveDraft, getActiveWorkoutDraft, isDayUnfinished, clearUnfinishedStatus } from '@/lib/activeWorkoutEngine';
import { ShieldAlert, Play, ChevronRight, RotateCcw } from 'lucide-react';
export const WeeklySplitView = () => {
    const { currentUser, getPlanForUser, getUserLogs } = useGym();
    const plan = currentUser ? getPlanForUser(currentUser.id) : null;
    const userLogs = currentUser ? getUserLogs(currentUser.id) : [];
    const [hasManuallyExited, setHasManuallyExited] = useState(false);
    const [activeLiveDay, setActiveLiveDay] = useState(() => {
        if (!currentUser || !plan)
            return null;
        const draft = getUserActiveDraft(currentUser.id);
        if (draft && plan.days) {
            const matched = plan.days.find((d) => d.id === draft.dayId);
            if (matched)
                return matched;
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
    if (!currentUser)
        return null;
    // If currently tracking a live workout session
    if (activeLiveDay && plan) {
        return (<LiveWorkoutSession plan={plan} day={activeLiveDay} onExit={() => {
                setHasManuallyExited(true);
                setActiveLiveDay(null);
            }} onSessionCompleted={() => {
                setHasManuallyExited(false);
                setActiveLiveDay(null);
            }}/>);
    }
    if (!plan) {
        return (<div className="p-12 text-center rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] max-w-2xl mx-auto">
        <ShieldAlert className="w-10 h-10 mx-auto text-amber-400 mb-3"/>
        <h3 className="text-base font-bold text-white">No Program Assigned</h3>
        <p className="text-xs text-zinc-400 mt-1">
          A customized workout split has not been assigned yet. Coach Yassen Ahmed will assign your training split shortly.
        </p>
      </div>);
    }
    return (<div className="w-full max-w-md md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto space-y-3 pb-28 md:pb-12">
      {/* Top Program Banner */}
      <div className="gym-card flex flex-col justify-between gap-2.5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--main-color)]/10 rounded-full blur-3xl pointer-events-none"/>
        
        <div>
          <h1 className="gym-heading-page">
            {plan.title}
          </h1>
          <p className="gym-subtext mt-0.5">
            {plan.description || 'Targeted hypertrophy & progressive overload protocol.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-numeric text-zinc-300 pt-2 border-t border-white/[0.06]">
          <div className="gym-card-subtle flex-1 text-center py-1.5">
            <span className="gym-label-mono block text-slate-400">Days / Wk</span>
            <span className="gym-num text-sm text-white">{plan.daysPerWeek}</span>
          </div>
          <div className="gym-card-subtle flex-1 text-center py-1.5">
            <span className="gym-label-mono block text-slate-400">Duration</span>
            <span className="gym-num text-sm text-[var(--main-color)]">{plan.durationWeeks} Wks</span>
          </div>
        </div>
      </div>

      {/* Days Stack: Responsive Grid on Desktop */}
      <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
        {plan.days.map((day, idx) => (<div key={day.id} className={`gym-card transition-all overflow-hidden ${day.isRestDay ? 'opacity-90' : ''}`}>
            {/* Day Header: Number and Full Day Name on left with ample space, Movements & Time on right */}
            <div className="pb-2.5 flex items-center justify-between gap-2.5 border-b border-white/[0.06]">
              {/* Left: Number directly next to Day Name */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-[var(--main-color)] font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <h3 className="gym-heading-card truncate">
                  {day.dayName}
                </h3>
              </div>

              {/* Right: Movements & Time in place of the button */}
              {day.isRestDay ? (<span className="gym-delta-neutral text-[10px] flex-shrink-0">
                  Rest Day
                </span>) : (<div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 whitespace-nowrap flex-shrink-0">
                  <span className="text-slate-300 font-semibold">{day.estimatedMinutes}m</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[var(--main-color)] font-bold">{day.exercises.length} Movements</span>
                </div>)}
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
                }, {});
                const muscleGroupsList = Object.values(muscleSummary);
                return (<div className="py-2 space-y-1.5">
                  {muscleGroupsList.map((mg, mgIdx) => (<div key={mg.muscleName} onClick={() => {
                            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                            setActiveLiveDay(day);
                        }} className="gym-card-subtle hover:border-[var(--main-color)]/40 transition-all cursor-pointer flex items-center justify-between gap-2.5 text-xs group">
                      {/* Left: Compact Badge + Consistent Muscle Name */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--main-color)] font-mono text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                          {mgIdx + 1}
                        </span>
                        <span className="gym-heading-card text-xs group-hover:text-[var(--main-color)] transition-colors truncate">
                          {mg.muscleName}
                        </span>
                      </div>

                      {/* Right: Sleek Sets Badge & Chevron */}
                      <div className="flex items-center gap-1.5 text-slate-300 font-numeric text-xs flex-shrink-0">
                        <span className="gym-delta-blue text-[10px]">
                          {mg.totalSets} Sets
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[var(--main-color)] transition-colors"/>
                      </div>
                    </div>))}
                </div>);
            })()}

            {/* Bottom: Dedicated Workout Action Button */}
            {!day.isRestDay && (() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const isDoneToday = userLogs.some((l) => l.date === todayStr && (l.dayId === day.id || l.dayName === day.dayName));
                const activeDraft = currentUser ? getActiveWorkoutDraft(currentUser.id, day.id) : null;
                const isUnfinished = currentUser ? isDayUnfinished(currentUser.id, day.id) : false;
                if (activeDraft) {
                    return (<div className="pt-2">
                    <button onClick={() => {
                            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                            setHasManuallyExited(false);
                            setActiveLiveDay(day);
                        }} className="gym-btn-primary w-full text-xs font-bold flex items-center justify-center gap-2">
                      <span className="relative flex h-2 w-2 mr-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <Play className="w-3.5 h-3.5 fill-current"/>
                      <span>RESUME WORKOUT</span>
                    </button>
                  </div>);
                }
                if (isUnfinished && !isDoneToday) {
                    return (<div className="pt-2 space-y-1.5">
                    <div className="px-2.5 py-1 rounded-lg bg-[var(--card-subtle-bg)] border border-amber-500/30 flex items-center justify-between text-[11px]">
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"/>
                        Unfinished Session
                      </span>
                      <span className="gym-subtext font-mono text-[10px]">Did not finish</span>
                    </div>
                    <button onClick={() => {
                            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                            if (currentUser)
                                clearUnfinishedStatus(currentUser.id, day.id);
                            setHasManuallyExited(false);
                            setActiveLiveDay(day);
                        }} className="gym-btn-secondary w-full text-xs font-bold flex items-center justify-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5"/>
                      <span>Restart Session</span>
                    </button>
                  </div>);
                }
                return (<div className="pt-2">
                  <button onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                        setHasManuallyExited(false);
                        setActiveLiveDay(day);
                    }} className={`w-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${isDoneToday
                        ? 'gym-btn-secondary'
                        : 'gym-btn-primary'}`}>
                    {isDoneToday ? (<>
                        <RotateCcw className="w-3.5 h-3.5"/>
                        <span>Restart Session</span>
                        <span className="gym-delta-pos text-[9px] ml-1">
                          Done Today
                        </span>
                      </>) : (<>
                        <Play className="w-3.5 h-3.5 fill-current"/>
                        <span>Start Workout</span>
                      </>)}
                  </button>
                </div>);
            })()}

            {day.isRestDay && (<div className="py-3 text-center">
                <p className="gym-subtext">Scheduled Active Recovery &amp; Muscle Repair</p>
              </div>)}
          </div>))}
      </div>
    </div>);
};
