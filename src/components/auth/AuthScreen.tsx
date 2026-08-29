'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { 
  Dumbbell, 
  ShieldCheck, 
  User as UserIcon, 
  ArrowRight, 
  Mail, 
  Sparkles, 
  Database, 
  CheckCircle2, 
  Users, 
  Flame,
  KeyRound
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { users, login, loginWithEmail, isSupabaseActive } = useGym();
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
      setErrorMessage('No athlete account found with this email. Please check your spelling or choose from the profiles below.');
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-[#f4f4f6] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-purple-600 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-violet-400 text-white shadow-[0_0_35px_rgba(168,85,247,0.4)] border border-purple-400/40 transform hover:scale-105 transition-transform duration-300">
            <Dumbbell className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                WORKOUTS <span className="text-purple-400">PRO OS</span>
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60">
                CLOUD V3
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
              Admin & Athlete Portal • <span className="text-zinc-200 font-semibold">Yassen Ahmed</span>
            </p>
          </div>

          {/* Database Status Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] border border-[#262634] text-[11px] font-mono text-zinc-400">
            <Database className={`w-3.5 h-3.5 ${isSupabaseActive ? 'text-emerald-400' : 'text-purple-400'}`} />
            <span>
              {isSupabaseActive ? 'Supabase Database Active ⚡' : 'Local & Cloud Ready 🟢'}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="p-1 rounded-xl bg-[#111117] border border-[#232330] flex items-center gap-1">
          <button
            onClick={() => {
              setActiveTab('quick');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quick'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1-Click Portal Access</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('email');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'email'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Sign In</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 rounded-2xl bg-[#0f0f15]/90 border border-[#262636] backdrop-blur-xl shadow-2xl space-y-5">
          {activeTab === 'quick' ? (
            <div className="space-y-4">
              
              {/* 1. Admin Profile Card */}
              {coachUser && (
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold mb-2">
                    🛡️ Admin Portal (Yassen Ahmed)
                  </span>
                  <button
                    onClick={() => login(coachUser.id)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-950/50 via-[#181824] to-[#12121a] border border-purple-600/40 hover:border-purple-400 hover:scale-[1.01] transition-all text-left group shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                        {coachUser.avatarText || 'YA'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                            {coachUser.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-900/80 text-purple-200 border border-purple-700/60">
                            ADMIN
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Manage athletes, design workout splits & assign protocols
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-300 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              )}

              {/* 2. Trainees Profiles List */}
              <div className="pt-2">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-2">
                  ⚡ Athlete Portals (Trainees)
                </span>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {trainees.map((trainee) => (
                    <button
                      key={trainee.id}
                      onClick={() => login(trainee.id)}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#14141d] border border-[#232330] hover:border-purple-500/50 hover:bg-[#1a1a26] transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/60 text-zinc-200 flex items-center justify-center font-bold text-xs group-hover:border-purple-500/50 group-hover:text-white">
                          {trainee.avatarText}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                              {trainee.name}
                            </h4>
                            {trainee.name.toLowerCase().includes('rawan') && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                                ACTIVE PROTOCOL
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 truncate max-w-[200px]">
                            {trainee.email} • {trainee.goal}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          <span>Enter</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  ))}

                  {trainees.length === 0 && (
                    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center text-xs text-zinc-400">
                      No athletes found. Log in as Head Coach to register your first trainee!
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
                  Your Account Email
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
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#0a0a0f] border border-[#272738] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(168,85,247,0.35)] flex items-center justify-center gap-2"
              >
                <span>Access Workout Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-zinc-500">
                  Tip: Quick try with <button type="button" onClick={() => setEmailInput('rawan.ahmed@fitness.io')} className="text-purple-400 underline font-mono">rawan.ahmed@fitness.io</button> or <button type="button" onClick={() => setEmailInput('yassen.ahmed@fitness.io')} className="text-purple-400 underline font-mono">yassen.ahmed@fitness.io</button>
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-zinc-500">
            Direct Athlete Link: Trainees can also access directly via their personalized URL link.
          </p>
        </div>
      </div>
    </div>
  );
};
