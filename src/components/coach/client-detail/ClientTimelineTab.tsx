'use client';

import React, { useMemo } from 'react';
import { User, WeeklyCheckIn, WorkoutLog } from '@/types';
import { useGym } from '@/context/GymContext';

interface ClientTimelineTabProps {
  client: User;
}

interface TimelineEvent {
  id: string;
  date: string;
  type: 'checkin' | 'workout' | 'diet' | 'note' | 'joined';
  title: string;
  description: string;
  badgeText?: string;
}

export const ClientTimelineTab: React.FC<ClientTimelineTabProps> = ({ client }) => {
  const { getCheckInsForUser, getUserLogs, getPlanForUser, getDietPlanForUser } = useGym();

  const checkIns = getCheckInsForUser(client.id);
  const logs = getUserLogs(client.id);
  const plan = getPlanForUser(client.id);
  const diet = getDietPlanForUser(client.id);

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // 1. Check-ins
    checkIns.forEach((chk) => {
      events.push({
        id: `event-chk-${chk.id}`,
        date: chk.date,
        type: 'checkin',
        title: `Weekly Check-In Submitted`,
        description: `Weighed in at ${chk.weightKg} kg with ${chk.photos.length} physique angles. ${chk.traineeNotes ? `Notes: "${chk.traineeNotes}"` : ''}`,
        badgeText: chk.reviewed ? 'Reviewed' : 'Review Due'
      });
    });

    // 2. Workout session logs (NO volume load mentioned)
    logs.forEach((log) => {
      const totalSets = log.completedExercises.reduce((s, ex) => s + ex.sets.length, 0);
      events.push({
        id: `event-log-${log.id}`,
        date: log.date,
        type: 'workout',
        title: `Completed ${log.dayName || 'Workout'}`,
        description: `Executed ${log.completedExercises.length} movements across ${totalSets} working sets.`,
        badgeText: `${Math.round((log.durationSeconds || 3600) / 60)} min`
      });
    });

    // 3. Plan assignment
    if (plan) {
      events.push({
        id: `event-plan-${plan.id}`,
        date: plan.createdAt || client.joinedDate,
        type: 'workout',
        title: `Training Routine Configured: ${plan.title}`,
        description: `${plan.daysPerWeek} days per week split assigned for ${plan.durationWeeks} weeks.`
      });
    }

    // 4. Diet assignment
    if (diet) {
      events.push({
        id: `event-diet-${diet.id}`,
        date: diet.createdAt || client.joinedDate,
        type: 'diet',
        title: `Nutrition Protocol Assigned: ${diet.title}`,
        description: `Daily targets set to ${diet.targetCalories} kcal with ${diet.targetProteinG}g protein and ${diet.meals.length} meals.`
      });
    }

    // 5. Account creation / Joined
    events.push({
      id: `event-join-${client.id}`,
      date: client.joinedDate,
      type: 'joined',
      title: `Client Onboarded`,
      description: `Enrolled under ${client.goal} objective.`
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [checkIns, logs, plan, diet, client]);

  return (
    <div className="flex flex-col h-full space-y-2 select-none">
      
      {/* Header telemetry (Compact) */}
      <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/[0.07] flex items-center justify-between flex-shrink-0">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Activity Timeline
          </span>
          <h3 className="text-xs sm:text-sm font-semibold text-white mt-0.5">
            Client Coaching History &bull; {timelineEvents.length} Events
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          Reverse chronological
        </span>
      </div>

      {/* Internal scroll events list */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {timelineEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-3 rounded-xl bg-[#090d14] border border-white/[0.07] space-y-1 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">
                  {evt.title}
                </span>
                {evt.badgeText && (
                  <span className="px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] font-mono text-slate-300">
                    {evt.badgeText}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {evt.date}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {evt.description}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};
