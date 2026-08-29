'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { User, UserGoal } from '@/types';
import { User as UserIcon, Activity, Target, Shield, Check, Calendar, Dumbbell } from 'lucide-react';

export const TraineeProfileView: React.FC = () => {
  const { currentUser, getPlanForUser, getUserLogs } = useGym();

  const [weightKg, setWeightKg] = useState(currentUser?.weightKg || 70);
  const [targetWeightKg, setTargetWeightKg] = useState(currentUser?.targetWeightKg || 70);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentUser) return null;

  const plan = getPlanForUser(currentUser.id);
  const logs = getUserLogs(currentUser.id);

  // BMI Calculation
  const heightM = currentUser.heightCm / 100;
  const bmi = heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : '22.0';

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="p-6 rounded-2xl bg-[#111116] border border-[#22222d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-extrabold text-xl shadow-[0_0_20px_rgba(168,85,247,0.35)]">
            {currentUser.avatarText}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {currentUser.name}
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                ATHLETE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{currentUser.email}</p>
            <p className="text-[11px] text-zinc-500 font-mono mt-1">
              Member since {currentUser.joinedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-[#0d0d12] border border-zinc-800 text-right">
            <span className="block text-[9px] font-mono uppercase text-zinc-500">Status</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">ACTIVE PROTOCOL</span>
          </div>
        </div>
      </div>

      {/* Biometric Card */}
      <div className="p-6 rounded-2xl bg-[#111116] border border-[#22222d]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Physical Biometrics & Targets
          </h3>
          {savedSuccess && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSaveMetrics} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#0d0d12] border border-zinc-900">
              <span className="block text-[9px] font-mono uppercase text-zinc-500 mb-1">
                Current Weight
              </span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-transparent font-numeric font-bold text-lg text-white focus:outline-none"
                />
                <span className="text-xs text-zinc-500 font-mono">kg</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0d0d12] border border-zinc-900">
              <span className="block text-[9px] font-mono uppercase text-zinc-500 mb-1">
                Target Weight
              </span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-transparent font-numeric font-bold text-lg text-purple-400 focus:outline-none"
                />
                <span className="text-xs text-zinc-500 font-mono">kg</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0d0d12] border border-zinc-900">
              <span className="block text-[9px] font-mono uppercase text-zinc-500 mb-1">
                Height
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-numeric font-bold text-lg text-white">
                  {currentUser.heightCm}
                </span>
                <span className="text-xs text-zinc-500 font-mono">cm</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0d0d12] border border-zinc-900">
              <span className="block text-[9px] font-mono uppercase text-zinc-500 mb-1">
                Estimated BMI
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-numeric font-bold text-lg text-cyan-400">
                  {bmi}
                </span>
                <span className="text-xs text-zinc-500 font-mono">norm</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              Update Bodyweight
            </button>
          </div>
        </form>
      </div>

      {/* Program & Instructions */}
      <div className="p-6 rounded-2xl bg-[#111116] border border-[#22222d] space-y-4">
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
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                {plan.level}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400 font-numeric pt-2 border-t border-zinc-900">
              <span>{plan.daysPerWeek} Days / Week</span>
              <span>•</span>
              <span>{plan.durationWeeks} Weeks Duration</span>
              <span>•</span>
              <span className="text-purple-400">{logs.length} Completed Logs</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic">No workout plan assigned yet.</p>
        )}

        <div className="pt-2">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
            Directives & Technical Directives
          </span>
          <div className="p-3.5 rounded-xl bg-[#0d0d12] border border-zinc-900 text-xs text-zinc-300 leading-relaxed">
            {currentUser.notes || 'Prioritize form and consistent progressive overload.'}
          </div>
        </div>
      </div>
    </div>
  );
};
