'use client';

import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { User, UserGoal } from '@/types';
import { 
  User as UserIcon, 
  Activity, 
  Target, 
  Check, 
  Calendar, 
  Dumbbell,
  Mail,
  Scale,
  Ruler,
  FileText,
  Sparkles
} from 'lucide-react';

const GOALS: UserGoal[] = [
  'Hypertrophy / Muscle Gain',
  'Strength & Power',
  'Fat Loss & Conditioning',
  'Athletic Performance',
  'Rehabilitation & Mobility'
];

export const TraineeProfileView: React.FC = () => {
  const { currentUser, updateUserProfile, getPlanForUser, getUserLogs } = useGym();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [weightKg, setWeightKg] = useState(70);
  const [targetWeightKg, setTargetWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(175);
  const [goal, setGoal] = useState<UserGoal>('Hypertrophy / Muscle Gain');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setWeightKg(currentUser.weightKg || 70);
      setTargetWeightKg(currentUser.targetWeightKg || currentUser.weightKg || 70);
      setHeightCm(currentUser.heightCm || 175);
      setGoal(currentUser.goal || 'Hypertrophy / Muscle Gain');
      setNotes(currentUser.notes || '');
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const plan = getPlanForUser(currentUser.id);
  const logs = getUserLogs(currentUser.id);

  // BMI Calculation
  const heightM = heightCm > 0 ? heightCm / 100 : 1.75;
  const bmi = heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : '22.0';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSaving(true);
    await updateUserProfile(currentUser.id, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      weightKg: Number(weightKg),
      targetWeightKg: Number(targetWeightKg),
      heightCm: Number(heightCm),
      goal,
      notes: notes.trim()
    });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 px-1 sm:px-0">
      {/* Profile Header */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#111116] border border-[#22222d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-extrabold text-lg sm:text-xl shadow-[0_0_20px_rgba(168,85,247,0.35)] flex-shrink-0">
            {currentUser.avatarText}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {currentUser.name}
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60">
                ATHLETE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{currentUser.email}</p>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 font-mono mt-1">
              Registered on {currentUser.joinedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-[#0d0d12] border border-zinc-800 text-left sm:text-right">
            <span className="block text-[9px] font-mono uppercase text-zinc-500">Status</span>
            <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ACTIVE PROTOCOL
            </span>
          </div>
        </div>
      </div>

      {/* Editable Profile & Biometrics Form */}
      <form onSubmit={handleSaveProfile} className="space-y-5">
        <div className="p-4 sm:p-6 rounded-2xl bg-[#111116] border border-[#22222d] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Edit Account & Biometrics (Saved to Cloud)
            </h3>
            {savedSuccess && (
              <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                Updated in Supabase!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0d0d12] border border-[#242430] text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0d0d12] border border-[#242430] text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Biometrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 rounded-xl bg-[#0d0d12] border border-zinc-900">
              <span className="block text-[9px] font-mono uppercase text-zinc-500 mb-1">
                Current Weight (kg)
              </span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-numeric font-bold text-lg text-white focus:outline-none focus:text-purple-300"
                />
                <span className="text-xs text-zinc-500 font-mono">kg</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0d0d12] border border-zinc-900">
              <span className="block text-[9px] font-mono uppercase text-purple-400 mb-1">
                Target Weight (kg)
              </span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent font-numeric font-bold text-lg text-purple-300 focus:outline-none"
                />
                <span className="text-xs text-zinc-500 font-mono">kg</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0d0d12] border border-zinc-900">
              <span className="block text-[9px] font-mono uppercase text-zinc-500 mb-1">
                Height (cm)
              </span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent font-numeric font-bold text-lg text-white focus:outline-none focus:text-purple-300"
                />
                <span className="text-xs text-zinc-500 font-mono">cm</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0d0d12] border border-zinc-900 flex flex-col justify-between">
              <span className="block text-[9px] font-mono uppercase text-zinc-500 mb-1">
                Calculated BMI
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-numeric font-bold text-lg text-cyan-400">
                  {bmi}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">idx</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Primary Fitness Objective
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as UserGoal)}
              className="w-full px-3 py-2 rounded-lg bg-[#0d0d12] border border-[#242430] text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {GOALS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Personal Notes & Physical Guidelines
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on shoulder warmup before pressing, progressive overload in bench press..."
              className="w-full px-3 py-2 rounded-lg bg-[#0d0d12] border border-[#242430] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.35)] flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSaving ? 'Updating...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Program & Instructions Summary Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#111116] border border-[#22222d] space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          Assigned Training Protocol Details
        </h3>

        {plan ? (
          <div className="p-4 rounded-xl bg-[#0d0d12] border border-zinc-900 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{plan.title}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">{plan.description}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
                {plan.level}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-900 text-xs">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Schedule</span>
                <span className="font-semibold text-zinc-200">{plan.daysPerWeek} Days / Week</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Cycle Duration</span>
                <span className="font-semibold text-zinc-200">{plan.durationWeeks} Weeks</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Completed Workouts</span>
                <span className="font-semibold text-purple-400">{logs.length} Sessions Logged</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#0d0d12] border border-zinc-900 text-center py-6">
            <Dumbbell className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400 font-medium">No workout protocol currently assigned</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">Admin will assign your split soon</p>
          </div>
        )}
      </div>
    </div>
  );
};
