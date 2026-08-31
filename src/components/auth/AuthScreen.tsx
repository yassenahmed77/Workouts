'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { 
  Dumbbell, 
  ShieldCheck, 
  User as UserIcon, 
  ArrowRight, 
  Mail, 
  CheckCircle2, 
  Users, 
  Flame
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { users, login, loginWithEmail } = useGym();
  const { showToast } = useToast();
  const [emailInput, setEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'email'>('quick');

  const coachUser = users.find((u) => u.role === 'coach') || users[0];
  const trainees = users.filter((u) => u.role === 'trainee');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!emailInput.trim()) return;

    const loggedUser = loginWithEmail(emailInput.trim());
    if (!loggedUser) {
      setErrorMessage('No athlete account found with this email. Please check spelling or select below.');
    } else {
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
    }
  };

  const handleQuickLogin = (userId: string, name: string) => {
    login(userId);
    showToast(`Logged in as ${name}`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-zinc-700 selection:text-white">
      {/* Main Container Card */}
      <div className="w-full max-w-lg space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#14151e] border border-[#2e303d] text-[#ccff00] shadow-sm">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M12 3L2 21h20L12 3zm0 4.5l6.5 11.5H5.5L12 7.5z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white">
                WORKOUTS <span className="text-[#ccff00]">PRO</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
              Athlete Training Platform • <span className="text-zinc-200 font-semibold">Coach Yassen Ahmed</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="p-1 rounded-2xl bg-[#12131a] border border-[#232530] flex items-center gap-1">
          <button
            onClick={() => {
              setActiveTab('quick');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'quick'
                ? 'bg-[#1c1d27] text-[#ccff00] shadow-sm border border-[#ccff00]/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Select Account</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('email');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'email'
                ? 'bg-[#1c1d27] text-[#ccff00] shadow-sm border border-[#ccff00]/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Sign In</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#121215] border border-zinc-800 shadow-xl space-y-5">
          {activeTab === 'quick' ? (
            <div className="space-y-4">
              
              {/* 1. Admin Profile Card */}
              {coachUser && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                      Head Coach Portal
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Admin</span>
                  </div>
                  <button
                    onClick={() => handleQuickLogin(coachUser.id, coachUser.name)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#18181c] border border-zinc-700/80 hover:border-zinc-500 hover:bg-[#202026] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {coachUser.avatarText || 'YA'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-zinc-200 transition-colors">
                            {coachUser.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                            COACH
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Architect workout splits, manage athletes & assign protocols
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center group-hover:bg-zinc-700 group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              )}

              {/* 2. Trainees Profiles List */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-zinc-400" />
                    Athlete Portals ({trainees.length})
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">1-Click</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {trainees.map((trainee) => (
                    <button
                      key={trainee.id}
                      onClick={() => handleQuickLogin(trainee.id, trainee.name)}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#16161a] border border-zinc-800 hover:border-zinc-600 hover:bg-[#1c1c22] transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-xs">
                          {trainee.avatarText}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors">
                              {trainee.name}
                            </h4>
                            {trainee.assignedPlanId && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-400 truncate max-w-[220px] mt-0.5">
                            {trainee.email} • {trainee.goal}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-400 font-semibold group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all flex items-center gap-1">
                          <span>Enter</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  ))}

                  {trainees.length === 0 && (
                    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center text-xs text-zinc-400">
                      No athletes found. Log in as Coach to register athletes.
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* Email Sign In Form */
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="e.g. rawan.ahmed@fitness.io or yassen.ahmed@fitness.io"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#09090b] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-bold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Access Workout Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-zinc-400">
                  Quick demo: <button type="button" onClick={() => setEmailInput('rawan.ahmed@fitness.io')} className="text-zinc-200 underline font-mono">rawan.ahmed@fitness.io</button> or <button type="button" onClick={() => setEmailInput('yassen.ahmed@fitness.io')} className="text-zinc-200 underline font-mono">yassen.ahmed@fitness.io</button>
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-[11px] text-zinc-500">
            Athletes can bookmark their direct URL link (<code className="font-mono text-zinc-400">/?user=athlete-id</code>) for quick access.
          </p>
        </div>
      </div>
    </div>
  );
};
