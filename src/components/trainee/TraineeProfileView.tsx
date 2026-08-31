'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { User, UserGoal } from '@/types';
import { 
  getSavedWeightLogs, 
  saveWeightLog, 
  deleteWeightLog, 
  calculateDynamicWeightChange,
  BodyWeightLog 
} from '@/lib/weightEngine';
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
  TrendingDown,
  TrendingUp,
  Plus,
  Trash2,
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
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [weightKg, setWeightKg] = useState(70);
  const [targetWeightKg, setTargetWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(175);
  const [goal, setGoal] = useState<UserGoal>('Hypertrophy / Muscle Gain');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Weekly Weight Logging State
  const [weightLogs, setWeightLogs] = useState<BodyWeightLog[]>([]);
  const [newCheckInWeight, setNewCheckInWeight] = useState<string>('');
  const [newCheckInDate, setNewCheckInDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setWeightKg(currentUser.weightKg || 70);
      setTargetWeightKg(currentUser.targetWeightKg || currentUser.weightKg || 70);
      setHeightCm(currentUser.heightCm || 175);
      setGoal(currentUser.goal || 'Hypertrophy / Muscle Gain');
      setNotes(currentUser.notes || '');

      const logs = getSavedWeightLogs(currentUser.id);
      setWeightLogs(logs);
      if (logs.length > 0) {
        const latest = logs[logs.length - 1].weightKg;
        setNewCheckInWeight(latest.toString());
      } else {
        setNewCheckInWeight((currentUser.weightKg || 70).toString());
      }
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const plan = getPlanForUser(currentUser.id);
  const logs = getUserLogs(currentUser.id);

  // 100% Dynamic Weight Progress Analysis
  const weightAnalysis = calculateDynamicWeightChange(weightLogs, currentUser.weightKg || 70);

  // BMI Calculation
  const heightM = heightCm > 0 ? heightCm / 100 : 1.75;
  const bmi = heightM > 0 ? (weightAnalysis.currentWeightKg / (heightM * heightM)).toFixed(1) : '22.0';

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
    showToast('Profile updated successfully!', 'success');
  };

  const handleAddWeightCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newCheckInWeight);
    if (!val || val <= 0) {
      showToast('Please enter a valid weight in kg', 'error');
      return;
    }

    const updated = saveWeightLog(currentUser.id, val, newCheckInDate);
    setWeightLogs(updated);
    setWeightKg(val);

    // Sync profile weightKg
    await updateUserProfile(currentUser.id, { weightKg: val });
    showToast(`Logged ${val} kg for ${newCheckInDate}! 🔥`, 'success');
  };

  const handleDeleteWeightLog = (logId: string) => {
    const updated = deleteWeightLog(currentUser.id, logId);
    setWeightLogs(updated);
    if (updated.length > 0) {
      const latest = updated[updated.length - 1].weightKg;
      setWeightKg(latest);
      updateUserProfile(currentUser.id, { weightKg: latest });
    }
    showToast('Weight log removed', 'info');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 px-1 sm:px-0 pb-12">
      {/* Profile Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#111218] border border-[#212330] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1c1d27] border border-[#2e303d] flex items-center justify-center text-[#ff6b00] font-black text-xl flex-shrink-0 shadow-inner">
            {currentUser.avatarText}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {currentUser.name}
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/20 font-bold">
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
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#09090b] border border-[#232530] text-left sm:text-right">
            <span className="block text-[9px] font-mono uppercase text-zinc-500 font-bold">Status</span>
            <span className="text-xs font-bold text-[#ff6b00] font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-pulse" />
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Biometrics Hero Row (Weight & Target Biometrics) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="p-3.5 rounded-2xl bg-[#111218] border border-[#212330] text-center shadow-md">
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1">
            <Scale className="w-3 h-3 text-[#ff6b00]" />
            <span>Weight</span>
          </div>
          <span className="text-xl font-black font-numeric text-white block">
            {weightAnalysis.currentWeightKg} <span className="text-xs text-zinc-400 font-normal">kg</span>
          </span>
          <span className="text-[9px] text-[#ff6b00] font-mono mt-0.5 block font-bold">
            {weightAnalysis.statusText}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#111218] border border-[#212330] text-center shadow-md">
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1">
            <Target className="w-3 h-3 text-cyan-400" />
            <span>Target</span>
          </div>
          <span className="text-xl font-black font-numeric text-white block">
            {targetWeightKg} <span className="text-xs text-zinc-400 font-normal">kg</span>
          </span>
          <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">Goal</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#111218] border border-[#212330] text-center shadow-md">
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-zinc-400 font-bold mb-1">
            <Activity className="w-3 h-3 text-purple-400" />
            <span>BMI</span>
          </div>
          <span className="text-xl font-black font-numeric text-white block">
            {bmi}
          </span>
          <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">Index</span>
        </div>
      </div>

      {/* Weekly Weight Check-in Tracker Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#111218] border border-[#212330] space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#232530]">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#ff6b00]" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Weekly Weight Check-In
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 font-bold px-2 py-0.5 rounded-full bg-[#1c1d27] border border-[#2e303d]">
            {weightAnalysis.totalNetDeltaKg > 0 ? `+${weightAnalysis.totalNetDeltaKg}kg` : `${weightAnalysis.totalNetDeltaKg}kg`} Total
          </span>
        </div>

        {/* Check-in Input Row */}
        <form onSubmit={handleAddWeightCheckIn} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="w-full sm:w-1/2 relative">
            <label className="block text-[9px] font-mono uppercase text-zinc-500 font-bold mb-1">Date</label>
            <input
              type="date"
              value={newCheckInDate}
              onChange={(e) => setNewCheckInDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#09090b] border border-[#232530] text-xs text-white font-mono focus:outline-none focus:border-[#ff6b00]"
            />
          </div>

          <div className="w-full sm:w-1/2 relative">
            <label className="block text-[9px] font-mono uppercase text-zinc-500 font-bold mb-1">Body Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 68.5"
              value={newCheckInWeight}
              onChange={(e) => setNewCheckInWeight(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#09090b] border border-[#232530] text-xs text-white font-numeric font-bold focus:outline-none focus:border-[#ff6b00]"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto self-end px-5 py-2.5 rounded-xl bg-[#ff6b00] text-black text-xs font-black flex items-center justify-center gap-1.5 shadow-md hover:bg-[#ff7d1a] cursor-pointer active:scale-95 transition-all mt-auto"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Log Weight</span>
          </button>
        </form>

        {/* Historical Weigh-ins List */}
        {weightAnalysis.historyChronological.length > 0 && (
          <div className="pt-2 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
              Weigh-In History ({weightAnalysis.historyChronological.length})
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
              {[...weightAnalysis.historyChronological].reverse().map((entry) => {
                const isGain = entry.deltaVsPrevKg > 0;
                const isLoss = entry.deltaVsPrevKg < 0;

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2.5 px-3 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-mono text-zinc-300 font-bold">{entry.date}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-numeric font-black text-white">{entry.weightKg} kg</span>
                      
                      {entry.deltaVsPrevKg !== 0 ? (
                        <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                          isLoss 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {isLoss ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                          <span>{isGain ? `+${entry.deltaVsPrevKg}` : entry.deltaVsPrevKg}kg</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono">Baseline</span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteWeightLog(entry.id)}
                        className="text-zinc-600 hover:text-red-400 p-1 cursor-pointer transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Editable Profile & Biometrics Form */}
      <form onSubmit={handleSaveProfile} className="space-y-5">
        <div className="p-5 sm:p-6 rounded-3xl bg-[#111218] border border-[#212330] space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#232530]">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ff6b00]" />
              Account & Biometrics Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                Athlete Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#09090b] border border-[#232530] text-xs text-white focus:outline-none focus:border-[#ff6b00]/60 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#09090b] border border-[#232530] text-xs text-white focus:outline-none focus:border-[#ff6b00]/60 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#232530] font-numeric text-xs font-bold text-white focus:outline-none focus:border-[#ff6b00]/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#232530] font-numeric text-xs font-bold text-white focus:outline-none focus:border-[#ff6b00]/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                Height (cm)
              </label>
              <input
                type="number"
                required
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#232530] font-numeric text-xs font-bold text-white focus:outline-none focus:border-[#ff6b00]/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
                Calculated BMI
              </label>
              <input
                type="text"
                disabled
                value={bmi}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#232530] font-numeric text-xs font-bold text-zinc-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
              Training Focus / Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value as UserGoal)}
              placeholder="e.g. Hypertrophy, Cutting, Strength"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#232530] text-xs text-white focus:outline-none focus:border-[#ff6b00]/60 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
              Personal Notes & Physical Directives
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Shoulder warmup before heavy pressing, focus on progressive overload..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-[#232530] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00]/60 leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black btn-orange flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Program Details Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121215] border border-zinc-800 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Target className="w-4 h-4 text-zinc-400" />
          Assigned Training Protocol Details
        </h3>

        {plan ? (
          <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{plan.title}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">{plan.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-xs">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Schedule</span>
                <span className="font-semibold text-zinc-200">{plan.daysPerWeek} Days / Week</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Duration</span>
                <span className="font-semibold text-zinc-200">{plan.durationWeeks} Weeks</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Sessions</span>
                <span className="font-semibold text-zinc-200">{logs.length} Logged</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 text-center py-6">
            <Dumbbell className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400 font-medium">No workout protocol currently assigned</p>
          </div>
        )}
      </div>
    </div>
  );
};
