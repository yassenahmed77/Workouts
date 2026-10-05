'use client';

import React, { useState, useMemo } from 'react';
import { User, WorkoutPlan, DietPlan } from '@/types';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import {
  X,
  Dumbbell,
  Utensils,
  Clock,
  Activity,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Send,
  User as UserIcon,
  Flame,
  Calendar,
  ExternalLink,
  Edit3
} from 'lucide-react';

export type DrillDownType =
  | 'training_today'
  | 'nutrition_today'
  | 'checkins_status'
  | 'roster_training'
  | 'roster_nutrition'
  | 'roster_checkins'
  | 'roster_engagement'
  | 'roster_progress'
  | 'active_clients';

interface KpiDrillDownDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: DrillDownType | null;
  onSelectClient: (user: User, subTab?: 'overview' | 'checkins' | 'workout' | 'nutrition' | 'logs' | 'notes') => void;
  onOpenAssignModal?: (user: User) => void;
  onOpenPlanBuilder?: () => void;
  onNavigateToDiet?: () => void;
}

export const KpiDrillDownDrawer: React.FC<KpiDrillDownDrawerProps> = ({
  isOpen,
  onClose,
  type,
  onSelectClient,
  onOpenAssignModal,
  onOpenPlanBuilder,
  onNavigateToDiet
}) => {
  const { users, plans, dietPlans, checkIns, logs } = useGym();
  const { showToast } = useToast();

  const trainees = useMemo(() => users.filter((u) => u.role === 'trainee'), [users]);

  // Active sub-filter inside drawer
  const [activeSubTab, setActiveSubTab] = useState<string>('default');

  // Sync default tab when drawer opens or type changes
  React.useEffect(() => {
    if (type === 'training_today') setActiveSubTab('completed');
    else if (type === 'nutrition_today') setActiveSubTab('on_target');
    else if (type === 'checkins_status') setActiveSubTab('overdue');
    else if (type === 'roster_training') setActiveSubTab('completed');
    else if (type === 'roster_nutrition') setActiveSubTab('on_target');
    else if (type === 'roster_checkins') setActiveSubTab('submitted');
    else if (type === 'roster_engagement') setActiveSubTab('engaged');
    else if (type === 'roster_progress') setActiveSubTab('progressing');
    else setActiveSubTab('all');
  }, [type, isOpen]);

  // Mock mapped data tailored to exact numbers in dashboard:
  // 13 Trainees:
  // 8 logged today, 3 not logged today, 2 plans need review
  // 7 nutrition on target, 2 need adjustment, 2 need plan
  // 9 check-ins submitted, 2 overdue, 2 upcoming
  // Roster Training: 11 active, 2 inactive
  // Roster Nutrition: 9 active, 4 off-track
  // Roster Engagement: 11 active, 2 at risk
  // Roster Progress: 10 progressing, 3 stalled

  const trainingLoggedToday = useMemo(() => {
    return [
      {
        user: trainees.find((t) => t.id === 'user-rawan-1') || trainees[0],
        workoutName: 'Upper Body A - Power',
        time: 'Today • 09:30 AM',
        duration: '58 min',
        sets: 16,
        status: 'Completed'
      },
      {
        user: trainees.find((t) => t.id === 'user-omar-2') || trainees[1],
        workoutName: 'Push Hypertrophy Day',
        time: 'Today • 11:15 AM',
        duration: '65 min',
        sets: 18,
        status: 'Completed'
      },
      {
        user: trainees.find((t) => t.id === 'user-sara-3') || trainees[2],
        workoutName: 'Full Body Conditioning',
        time: 'Today • 12:40 PM',
        duration: '48 min',
        sets: 14,
        status: 'Completed'
      },
      {
        user: trainees.find((t) => t.id === 'user-mahmoud-6') || trainees[3],
        workoutName: 'Deadlift & Pull Power',
        time: 'Today • 02:10 PM',
        duration: '70 min',
        sets: 17,
        status: 'Completed'
      },
      {
        user: trainees.find((t) => t.id === 'user-nour-7') || trainees[4],
        workoutName: 'Full Body Tone & Core',
        time: 'Today • 03:25 PM',
        duration: '52 min',
        sets: 15,
        status: 'Completed'
      },
      {
        user: trainees.find((t) => t.id === 'user-tarek-1') || trainees[5],
        workoutName: 'Leg Day Quad Sweep',
        time: 'Today • 04:15 PM',
        duration: '75 min',
        sets: 20,
        status: 'Completed (PR Squat)'
      },
      {
        user: trainees.find((t) => t.id === 'user-karim-2') || trainees[6],
        workoutName: 'Upper Body V-Taper',
        time: 'Today • 05:00 PM',
        duration: '60 min',
        sets: 18,
        status: 'Completed'
      },
      {
        user: trainees.find((t) => t.id === 'user-mostafa-3') || trainees[7],
        workoutName: 'Heavy Back & Biceps',
        time: 'Today • 06:20 PM',
        duration: '68 min',
        sets: 19,
        status: 'Completed'
      }
    ].filter((item) => Boolean(item.user));
  }, [trainees]);

  const trainingNotLoggedToday = useMemo(() => {
    return [
      {
        user: trainees.find((t) => t.id === 'user-ahmed-4') || trainees[3],
        scheduledWorkout: 'Upper Body Hypertrophy',
        lastTrained: '2 days ago',
        reason: 'Rest day or pending evening log'
      },
      {
        user: trainees.find((t) => t.id === 'user-laila-5') || trainees[4],
        scheduledWorkout: 'Glute Specialization A',
        lastTrained: 'Yesterday',
        reason: 'Scheduled for 08:00 PM tonight'
      },
      {
        user: trainees.find((t) => t.id === 'user-tarek-gamal-8') || trainees[7],
        scheduledWorkout: 'Upper/Lower Split Day 1',
        lastTrained: '5 days ago',
        reason: 'Work travel - athlete currently on hold'
      }
    ].filter((item) => Boolean(item.user));
  }, [trainees]);

  const trainingPlansNeedReview = useMemo(() => {
    return [
      {
        user: trainees.find((t) => t.id === 'user-laila-5') || trainees[4],
        issue: 'Program Ending in 3 days',
        currentPlan: 'Glutes Specialization (Week 3 of 3)',
        actionRequired: 'Progress to Week 4-8 block or assign new split'
      },
      {
        user: trainees.find((t) => t.id === 'user-tarek-gamal-8') || trainees[7],
        issue: 'Stalled Progression / On Hold',
        currentPlan: 'Upper / Lower (Week 1 of 8)',
        actionRequired: 'Recalibrate training volume upon return'
      }
    ].filter((item) => Boolean(item.user));
  }, [trainees]);

  const nutritionOnTarget = useMemo(() => {
    return [
      {
        user: trainees.find((t) => t.id === 'user-rawan-1') || trainees[0],
        intake: '2,120 / 2,150 kcal',
        protein: '142g Protein',
        adherence: 92,
        planName: 'Fat Loss Recomp'
      },
      {
        user: trainees.find((t) => t.id === 'user-omar-2') || trainees[1],
        intake: '2,880 / 2,900 kcal',
        protein: '198g Protein',
        adherence: 95,
        planName: 'Hypertrophy Surplus'
      },
      {
        user: trainees.find((t) => t.id === 'user-mahmoud-6') || trainees[5],
        intake: '3,220 / 3,250 kcal',
        protein: '215g Protein',
        adherence: 94,
        planName: 'Powerbuilding Performance'
      },
      {
        user: trainees.find((t) => t.id === 'user-nour-7') || trainees[6],
        intake: '1,840 / 1,850 kcal',
        protein: '135g Protein',
        adherence: 98,
        planName: 'High Protein Tone'
      },
      {
        user: trainees.find((t) => t.id === 'user-tarek-1') || trainees[8],
        intake: '3,100 / 3,100 kcal',
        protein: '240g Protein',
        adherence: 99,
        planName: 'Peak Week Carb Protocol'
      },
      {
        user: trainees.find((t) => t.id === 'user-karim-2') || trainees[9],
        intake: '2,620 / 2,650 kcal',
        protein: '192g Protein',
        adherence: 96,
        planName: 'Cutting Phase (8w)'
      },
      {
        user: trainees.find((t) => t.id === 'user-mostafa-3') || trainees[10],
        intake: '3,450 / 3,500 kcal',
        protein: '255g Protein',
        adherence: 93,
        planName: 'Open Bodybuilding Prep'
      }
    ].filter((item) => Boolean(item.user));
  }, [trainees]);

  const nutritionNeedsAdjustment = useMemo(() => {
    return [
      {
        user: trainees.find((t) => t.id === 'user-sara-3') || trainees[2],
        intake: '1,420 / 2,100 kcal',
        protein: '95g Protein',
        adherence: 63,
        issue: 'Missed Meal 3 and post-workout shake (-680 kcal gap)',
        planName: 'Fat Loss Recomp'
      },
      {
        user: trainees.find((t) => t.id === 'user-ahmed-4') || trainees[3],
        intake: '1,580 / 2,400 kcal',
        protein: '105g Protein',
        adherence: 56,
        issue: 'High deficit gap (-820 kcal below recovery target)',
        planName: 'High Protein Athletic'
      }
    ].filter((item) => Boolean(item.user));
  }, [trainees]);

  const checkinsOverdue = useMemo(() => {
    return [
      {
        user: trainees.find((t) => t.id === 'user-rawan-1') || trainees[0],
        dueDate: 'Due 2 days ago (Sep 15)',
        status: '2 days late',
        lastCheckIn: 'Sep 08 • 68.4 kg'
      },
      {
        user: trainees.find((t) => t.id === 'user-ahmed-4') || trainees[3],
        dueDate: 'Due 4 days ago (Sep 13)',
        status: '4 days late',
        lastCheckIn: 'Baseline pending'
      }
    ].filter((item) => Boolean(item.user));
  }, [trainees]);

  const checkinsSubmitted = useMemo(() => {
    return [
      {
        user: trainees.find((t) => t.id === 'user-omar-2') || trainees[1],
        date: 'Yesterday at 08:30 PM',
        weight: '78.4 kg (-0.6 kg)',
        photos: 3,
        adherence: 92
      },
      {
        user: trainees.find((t) => t.id === 'user-sara-3') || trainees[2],
        date: 'Yesterday at 02:15 PM',
        weight: '62.1 kg (-0.3 kg)',
        photos: 4,
        adherence: 63
      },
      {
        user: trainees.find((t) => t.id === 'user-laila-5') || trainees[4],
        date: 'Sep 16 at 09:00 AM',
        weight: '59.3 kg (-0.5 kg)',
        photos: 3,
        adherence: 90
      },
      {
        user: trainees.find((t) => t.id === 'user-mahmoud-6') || trainees[5],
        date: 'Sep 15 at 11:30 PM',
        weight: '92.6 kg (+0.2 kg)',
        photos: 4,
        adherence: 88
      },
      {
        user: trainees.find((t) => t.id === 'user-nour-7') || trainees[6],
        date: 'Sep 15 at 07:45 PM',
        weight: '56.8 kg (-0.4 kg)',
        photos: 3,
        adherence: 91
      },
      {
        user: trainees.find((t) => t.id === 'user-tarek-1') || trainees[8],
        date: 'Sep 16 at 06:30 AM',
        weight: '84.8 kg (-0.2 kg)',
        photos: 4,
        adherence: 99
      },
      {
        user: trainees.find((t) => t.id === 'user-karim-2') || trainees[9],
        date: 'Sep 15 at 08:00 AM',
        weight: '76.2 kg (-0.5 kg)',
        photos: 4,
        adherence: 94
      },
      {
        user: trainees.find((t) => t.id === 'user-mostafa-3') || trainees[10],
        date: 'Sep 14 at 10:00 PM',
        weight: '97.5 kg (-0.6 kg)',
        photos: 4,
        adherence: 93
      },
      {
        user: trainees.find((t) => t.id === 'user-tarek-gamal-8') || trainees[7],
        date: 'Sep 10 at 04:00 PM',
        weight: '81.2 kg (0.0 kg)',
        photos: 2,
        adherence: 48
      }
    ].filter((item) => Boolean(item.user));
  }, [trainees]);

  const handleRemindAthlete = (userName: string, context: string) => {
    showToast(`Reminder sent to ${userName} for ${context}`, 'info');
  };

  if (!isOpen || !type) return null;

  // Header configuration based on type
  const getHeaderConfig = () => {
    switch (type) {
      case 'training_today':
      case 'roster_training':
        return {
          icon: Dumbbell,
          title: 'Training Activity & Compliance',
          subtitle: 'Workouts logged today, pending sessions, and split adherence',
          badge: '11 / 13 Active'
        };
      case 'nutrition_today':
      case 'roster_nutrition':
        return {
          icon: Utensils,
          title: 'Nutrition Adherence & Macros',
          subtitle: 'Daily caloric compliance, off-track alerts, and diet plans',
          badge: '9 / 13 on target'
        };
      case 'checkins_status':
      case 'roster_checkins':
        return {
          icon: Clock,
          title: 'Check-in Submissions & Review Queue',
          subtitle: 'Weekly updates, late check-ins, and progress photos',
          badge: '9 / 13 submitted'
        };
      case 'roster_engagement':
        return {
          icon: Activity,
          title: 'Athlete Engagement & App Activity',
          subtitle: 'Active roster engagement, last session times, and at-risk athletes',
          badge: '84% Engagement'
        };
      case 'roster_progress':
        return {
          icon: TrendingUp,
          title: 'Client Progression & Plateaus',
          subtitle: 'Goal pacing, strength curves, and plateaued athletes',
          badge: '10 / 13 progressing'
        };
      default:
        return {
          icon: UserIcon,
          title: 'Client Roster Directory',
          subtitle: 'Comprehensive breakdown of active coaching clients',
          badge: '13 Athletes'
        };
    }
  };

  const header = getHeaderConfig();
  const Icon = header.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#090d15] border-l border-[#16202e] flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300 select-none text-[#f8fafc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <div className="p-4 sm:p-5 border-b border-[#141b26] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#0e1624] border border-[#1d2a3e] flex items-center justify-center text-[#00c5ff] flex-shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {header.title}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#111827] text-[#00c5ff] border border-[#1f293d] font-bold flex-shrink-0">
                  {header.badge}
                </span>
              </div>
              <p className="text-[11px] text-[#64748b] truncate mt-0.5">
                {header.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#0e1624] hover:bg-[#152033] border border-[#1b2637] text-[#8896aa] hover:text-white transition-colors cursor-pointer flex-shrink-0"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Sub-Tab Filter Pills */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-[#141b26] flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {(type === 'training_today' || type === 'roster_training') && (
            <>
              <button
                onClick={() => setActiveSubTab('completed')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'completed'
                    ? 'bg-white text-[#080c14] font-bold shadow-sm'
                    : 'bg-[#0d131f] text-[#8896aa] hover:text-white border border-[#162130]'
                }`}
              >
                Logged Today ({trainingLoggedToday.length})
              </button>
              <button
                onClick={() => setActiveSubTab('not_logged')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'not_logged'
                    ? 'bg-white text-[#080c14] font-bold shadow-sm'
                    : 'bg-[#0d131f] text-[#8896aa] hover:text-white border border-[#162130]'
                }`}
              >
                Not Logged Today ({trainingNotLoggedToday.length})
              </button>
              <button
                onClick={() => setActiveSubTab('review')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'review'
                    ? 'bg-white text-[#080c14] font-bold shadow-sm'
                    : 'bg-[#0d131f] text-[#8896aa] hover:text-white border border-[#162130]'
                }`}
              >
                Needs Review ({trainingPlansNeedReview.length})
              </button>
            </>
          )}

          {(type === 'nutrition_today' || type === 'roster_nutrition') && (
            <>
              <button
                onClick={() => setActiveSubTab('on_target')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'on_target'
                    ? 'bg-white text-[#080c14] font-bold shadow-sm'
                    : 'bg-[#0d131f] text-[#8896aa] hover:text-white border border-[#162130]'
                }`}
              >
                On Target ({nutritionOnTarget.length})
              </button>
              <button
                onClick={() => setActiveSubTab('needs_adjustment')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'needs_adjustment'
                    ? 'bg-white text-[#080c14] font-bold shadow-sm'
                    : 'bg-[#0d131f] text-[#8896aa] hover:text-white border border-[#162130]'
                }`}
              >
                Needs Adjustment ({nutritionNeedsAdjustment.length})
              </button>
            </>
          )}

          {(type === 'checkins_status' || type === 'roster_checkins') && (
            <>
              <button
                onClick={() => setActiveSubTab('overdue')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'overdue'
                    ? 'bg-white text-[#080c14] font-bold shadow-sm'
                    : 'bg-[#0d131f] text-[#8896aa] hover:text-white border border-[#162130]'
                }`}
              >
                Late ({checkinsOverdue.length})
              </button>
              <button
                onClick={() => setActiveSubTab('submitted')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'submitted'
                    ? 'bg-white text-[#080c14] font-bold shadow-sm'
                    : 'bg-[#0d131f] text-[#8896aa] hover:text-white border border-[#162130]'
                }`}
              >
                Submitted ({checkinsSubmitted.length})
              </button>
            </>
          )}

          {type === 'roster_engagement' && (
            <>
              <button
                onClick={() => setActiveSubTab('engaged')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'engaged'
                    ? 'bg-white text-[#080c14] font-bold shadow-sm'
                    : 'bg-[#0d131f] text-[#8896aa] hover:text-white border border-[#162130]'
                }`}
              >
                Engaged (11)
              </button>
              <button
                onClick={() => setActiveSubTab('at_risk')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'at_risk'
                    ? 'bg-white text-[#080c14] font-bold shadow-sm'
                    : 'bg-[#0d131f] text-[#8896aa] hover:text-white border border-[#162130]'
                }`}
              >
                At Risk (2)
              </button>
            </>
          )}

          {type === 'roster_progress' && (
            <>
              <button
                onClick={() => setActiveSubTab('progressing')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'progressing'
                    ? 'bg-white text-[#080c14] font-bold shadow-sm'
                    : 'bg-[#0d131f] text-[#8896aa] hover:text-white border border-[#162130]'
                }`}
              >
                Showing Progress (10)
              </button>
              <button
                onClick={() => setActiveSubTab('stalled')}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'stalled'
                    ? 'bg-white text-[#080c14] font-bold shadow-sm'
                    : 'bg-[#0d131f] text-[#8896aa] hover:text-white border border-[#162130]'
                }`}
              >
                Plateaued (3)
              </button>
            </>
          )}
        </div>

        {/* 3. Dynamic Athlete Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 custom-scrollbar">
          {/* TRAINING: Logged Today */}
          {(type === 'training_today' || type === 'roster_training') && (activeSubTab === 'completed' || activeSubTab === 'active') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] pb-1 font-mono">
                <span>8 ATHLETES COMPLETED SESSIONS TODAY</span>
                <span>STATUS: VERIFIED</span>
              </div>
              {trainingLoggedToday.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectClient(item.user, 'workout');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-[#0d131f] hover:bg-[#121a2a] border border-[#16202e] hover:border-[#223046] transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.user.avatarUrl}
                      alt={item.user.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#1d2a3d] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-[#00c5ff] transition-colors truncate">
                          {item.user.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0e2118] text-emerald-400 border border-emerald-500/20">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8896aa] truncate mt-0.5">
                        <strong className="text-zinc-300 font-semibold">{item.workoutName}</strong> • {item.sets} sets • {item.duration}
                      </p>
                      <p className="text-[9px] font-mono text-[#526075] mt-0.5">{item.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClient(item.user, 'logs');
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#141c2a] hover:bg-[#1d273a] text-[#00c5ff] text-[10px] font-mono font-medium border border-[#1e2a3c] transition-colors"
                    >
                      View Log
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-[#526075] group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TRAINING: Not Logged Today */}
          {(type === 'training_today' || type === 'roster_training') && activeSubTab === 'not_logged' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] pb-1 font-mono">
                <span>3 ATHLETES PENDING TODAY&apos;S WORKOUT</span>
                <span>ACTION REQUIRED</span>
              </div>
              {trainingNotLoggedToday.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0d131f] border border-[#16202e] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.user.avatarUrl}
                      alt={item.user.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#1d2a3d] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{item.user.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#201811] text-[#94a3b8] border border-[#2d251d]">
                          Pending
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8896aa] truncate mt-0.5">
                        Scheduled: <strong className="text-zinc-300 font-medium">{item.scheduledWorkout}</strong>
                      </p>
                      <p className="text-[9px] font-mono text-[#526075] mt-0.5">
                        Last trained: {item.lastTrained} • {item.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRemindAthlete(item.user.name, 'workout log')}
                      className="px-2.5 py-1 rounded-lg bg-[#141c2a] hover:bg-[#1d273a] text-white hover:text-[#00c5ff] text-[10px] font-mono font-medium border border-[#1e2a3c] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Send className="w-2.5 h-2.5" />
                      <span>Remind</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectClient(item.user, 'overview');
                        onClose();
                      }}
                      className="p-1 text-[#526075] hover:text-white transition-colors"
                      title="View Profile"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TRAINING: Needs Review */}
          {(type === 'training_today' || type === 'roster_training') && activeSubTab === 'review' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] pb-1 font-mono">
                <span>2 TRAINING PLANS NEED COACH REVISION</span>
                <span>EXPIRING / STALLED</span>
              </div>
              {trainingPlansNeedReview.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0d131f] border border-[#16202e] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.user.avatarUrl}
                      alt={item.user.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#1d2a3d] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{item.user.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#25131a] text-rose-400 border border-rose-500/20 font-bold">
                          {item.issue}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8896aa] truncate mt-0.5">
                        Current: <span className="text-zinc-300">{item.currentPlan}</span>
                      </p>
                      <p className="text-[9px] font-mono text-[#526075] mt-0.5">{item.actionRequired}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenAssignModal) onOpenAssignModal(item.user);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#00c5ff] hover:bg-[#38bdf8] text-[#070a0f] text-[10px] font-bold font-mono transition-colors flex-shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-2.5 h-2.5 stroke-[2.5]" />
                    <span>Update Plan</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* NUTRITION: On Target */}
          {(type === 'nutrition_today' || type === 'roster_nutrition') && activeSubTab === 'on_target' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] pb-1 font-mono">
                <span>7 ATHLETES HITTING MACRO & CALORIE TARGETS</span>
                <span>ON TRACK</span>
              </div>
              {nutritionOnTarget.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectClient(item.user, 'nutrition');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-[#0d131f] hover:bg-[#121a2a] border border-[#16202e] hover:border-[#223046] transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.user.avatarUrl}
                      alt={item.user.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#1d2a3d] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-[#00c5ff] transition-colors truncate">
                          {item.user.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0d2218] text-emerald-400 border border-emerald-500/20">
                          {item.adherence}% On Target
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8896aa] truncate mt-0.5">
                        <strong className="text-zinc-300 font-medium">{item.intake}</strong> • {item.protein}
                      </p>
                      <p className="text-[9px] font-mono text-[#526075] mt-0.5">Protocol: {item.planName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClient(item.user, 'nutrition');
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#141c2a] hover:bg-[#1d273a] text-[#00c5ff] text-[10px] font-mono font-medium border border-[#1e2a3c] transition-colors"
                    >
                      View Diet
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-[#526075] group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NUTRITION: Needs Adjustment */}
          {(type === 'nutrition_today' || type === 'roster_nutrition') && activeSubTab === 'needs_adjustment' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] pb-1 font-mono">
                <span>2 ATHLETES OFF TRACK / LOW ADHERENCE</span>
                <span>LOW CALORIES / UNDER TARGET</span>
              </div>
              {nutritionNeedsAdjustment.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0d131f] border border-[#16202e] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.user.avatarUrl}
                      alt={item.user.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#1d2a3d] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{item.user.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#281615] text-[#cbd5e1] border border-[#3d2422]">
                          {item.adherence}% Adherence
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-300 font-medium truncate mt-0.5">
                        Intake: {item.intake} • {item.protein}
                      </p>
                      <p className="text-[9px] font-mono text-[#94a3b8] mt-0.5">{item.issue}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRemindAthlete(item.user.name, 'diet compliance')}
                      className="px-2 py-1 rounded-lg bg-[#141c2a] hover:bg-[#1d273a] text-white hover:text-[#00c5ff] text-[10px] font-mono font-medium border border-[#1e2a3c] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Send className="w-2.5 h-2.5" />
                      <span>Remind</span>
                    </button>
                    <button
                      onClick={() => {
                        if (onNavigateToDiet) onNavigateToDiet();
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#00c5ff] hover:bg-[#38bdf8] text-[#070a0f] text-[10px] font-bold font-mono transition-colors cursor-pointer"
                    >
                      Adjust
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CHECKINS: Overdue */}
          {(type === 'checkins_status' || type === 'roster_checkins') && activeSubTab === 'overdue' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] pb-1 font-mono">
                <span>2 ATHLETES WITH LATE CHECK-INS</span>
                <span>MISSING SUBMISSIONS</span>
              </div>
              {checkinsOverdue.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0d131f] border border-[#16202e] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.user.avatarUrl}
                      alt={item.user.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#1d2a3d] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{item.user.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#2a111a] text-rose-400 border border-rose-500/25 font-bold">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-300 font-medium truncate mt-0.5">
                        {item.dueDate}
                      </p>
                      <p className="text-[9px] font-mono text-[#526075] mt-0.5">Last entry: {item.lastCheckIn}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRemindAthlete(item.user.name, 'check-in prompt')}
                      className="px-2.5 py-1 rounded-lg bg-[#141c2a] hover:bg-[#1d273a] text-white hover:text-[#00c5ff] text-[10px] font-mono font-medium border border-[#1e2a3c] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Send className="w-2.5 h-2.5" />
                      <span>Prompt</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectClient(item.user, 'checkins');
                        onClose();
                      }}
                      className="p-1 text-[#526075] hover:text-white transition-colors"
                      title="View Check-ins"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CHECKINS: Submitted */}
          {(type === 'checkins_status' || type === 'roster_checkins') && activeSubTab === 'submitted' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] pb-1 font-mono">
                <span>9 CHECK-IN SUBMISSIONS RECEIVED</span>
                <span>READY FOR REVIEW</span>
              </div>
              {checkinsSubmitted.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectClient(item.user, 'checkins');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-[#0d131f] hover:bg-[#121a2a] border border-[#16202e] hover:border-[#223046] transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.user.avatarUrl}
                      alt={item.user.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#1d2a3d] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-[#00c5ff] transition-colors truncate">
                          {item.user.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0e2118] text-emerald-400 border border-emerald-500/20">
                          {item.weight}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8896aa] truncate mt-0.5">
                        Submitted: {item.date} • {item.photos} photos
                      </p>
                      <p className="text-[9px] font-mono text-[#526075] mt-0.5">Adherence score: {item.adherence}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClient(item.user, 'checkins');
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#141c2a] hover:bg-[#1d273a] text-[#00c5ff] text-[10px] font-mono font-medium border border-[#1e2a3c] transition-colors"
                    >
                      Review
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-[#526075] group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ENGAGEMENT & PROGRESS VIEWS */}
          {type === 'roster_engagement' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] pb-1 font-mono">
                <span>{activeSubTab === 'engaged' ? '11 ENGAGED ATHLETES (ACTIVE <48H)' : '2 AT-RISK ATHLETES (>4 DAYS INACTIVE)'}</span>
                <span>RETENTION STATUS</span>
              </div>
              {(activeSubTab === 'engaged' ? trainees.slice(0, 11) : trainees.slice(11)).map((user, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectClient(user, 'overview');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-[#0d131f] hover:bg-[#121a2a] border border-[#16202e] hover:border-[#223046] transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#1d2a3d] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white group-hover:text-[#00c5ff] transition-colors truncate block">
                        {user.name}
                      </span>
                      <p className="text-[10px] text-[#8896aa] truncate mt-0.5">{user.goal}</p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                    activeSubTab === 'engaged'
                      ? 'bg-[#0e2118] text-emerald-400 border border-emerald-500/20'
                      : 'bg-[#25121b] text-rose-400 border border-rose-500/25 font-bold'
                  }`}>
                    {activeSubTab === 'engaged' ? 'Active App User' : 'At Risk'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {type === 'roster_progress' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] pb-1 font-mono">
                <span>{activeSubTab === 'progressing' ? '10 ATHLETES PROGRESSING TOWARDS GOAL' : '3 PLATEAUED ATHLETES'}</span>
                <span>METABOLIC ADAPTATION</span>
              </div>
              {(activeSubTab === 'progressing' ? trainees.slice(0, 10) : trainees.slice(10)).map((user, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectClient(user, 'overview');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-[#0d131f] hover:bg-[#121a2a] border border-[#16202e] hover:border-[#223046] transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#1d2a3d] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white group-hover:text-[#00c5ff] transition-colors truncate block">
                        {user.name}
                      </span>
                      <p className="text-[10px] text-[#8896aa] truncate mt-0.5">
                        Current: {user.weightKg} kg &rarr; Target: {user.targetWeightKg} kg
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                    activeSubTab === 'progressing'
                      ? 'bg-[#0e2118] text-emerald-400 border border-emerald-500/20'
                      : 'bg-[#181a24] text-[#cbd5e1] border border-[#232738]'
                  }`}>
                    {activeSubTab === 'progressing' ? 'Progressing' : 'Plateaued'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ACTIVE CLIENTS FULL ROSTER */}
          {type === 'active_clients' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#64748b] pb-1 font-mono">
                <span>ALL 13 ACTIVE CLIENTS</span>
                <span>COACHING ROSTER</span>
              </div>
              {trainees.map((user, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSelectClient(user, 'overview');
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-[#0d131f] hover:bg-[#121a2a] border border-[#16202e] hover:border-[#223046] transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#1d2a3d] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white group-hover:text-[#00c5ff] transition-colors truncate block">
                        {user.name}
                      </span>
                      <p className="text-[10px] text-[#8896aa] truncate mt-0.5">
                        {user.goal} • {user.weightKg} kg
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#0d1726] text-[#00c5ff] border border-[#162940]">
                      Active
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#526075] group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
