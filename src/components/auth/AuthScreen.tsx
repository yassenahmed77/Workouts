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
  Flame,
  Sparkles,
  Zap,
  ChevronRight
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
      showToast(`Welcome back, ${loggedUser.name}! ⚡`, 'success');
    }
  };

  const handleQuickLogin = (userId: string, name: string) => {
    login(userId);
    showToast(`Logged in as ${name} ⚡`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#08080b] text-[#f4f4f6] flex flex-col justify-center items-center p-3.5 sm:p-6 relative overflow-hidden selection:bg-[#ff6b00]/30 selection:text-white">
      
      {/* Glowing Cyber Sunset Radial Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-[#ff6b00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Mobile Frame Card */}
      <div className="w-full max-w-md space-y-5 relative z-10 py-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-[#14151e] border border-[#2e303d] text-[#ff6b00] shadow-xl shadow-[#ff6b00]/10 mx-auto">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M12 3L2 21h20L12 3zm0 4.5l6.5 11.5H5.5L12 7.5z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#ff6b00] font-bold px-2.5 py-0.5 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/20">
                <Flame className="w-3 h-3 fill-current animate-pulse" />
                HYPERTROPHY OS • ATHLETE PORTAL
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1.5">
              WORKOUTS <span className="text-[#ff6b00]">PRO</span>
            </h1>

            <p className="text-xs text-zinc-400 font-medium mt-1">
              High-Performance Coaching & Athlete Training Platform
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="p-1 rounded-2xl bg-[#111218] border border-[#212330] flex items-center gap-1 shadow-md">
          <button
            onClick={() => {
              setActiveTab('quick');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-[#1c1d27] text-white shadow-sm border border-[#2e303d]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#ff6b00]" />
            <span>Select Account</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('email');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'email'
                ? 'bg-[#1c1d27] text-white shadow-sm border border-[#2e303d]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#ff6b00]" />
            <span>Email Sign In</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#111218] border border-[#212330] shadow-xl space-y-4">
          {activeTab === 'quick' ? (
            <div className="space-y-4">
              
              {/* 1. Admin / Coach Profile Card */}
              {coachUser && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#ff6b00]" />
                      Head Coach Portal
                    </span>
                    <span className="text-[9px] font-mono font-bold text-[#ff6b00]">ADMIN</span>
                  </div>

                  <button
                    onClick={() => handleQuickLogin(coachUser.id, coachUser.name)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#09090b] border border-[#1e202c] hover:border-[#ff6b00]/40 hover:bg-[#14151e] transition-all text-left group shadow-sm cursor-pointer active:scale-95"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#2e303d] flex items-center justify-center font-mono font-black text-sm shadow-inner flex-shrink-0">
                        {coachUser.avatarText || 'YA'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-white tracking-tight group-hover:text-[#ff6b00] transition-colors truncate">
                            {coachUser.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#18151f] text-[#ff6b00] border border-[#ff6b00]/20 flex-shrink-0">
                            COACH
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                          Architect splits, customize routines & track athletes
                        </p>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-[#171822] text-zinc-400 flex items-center justify-center group-hover:bg-[#ff6b00] group-hover:text-white transition-all flex-shrink-0 ml-2">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              )}

              {/* 2. Trainees Profiles List */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#ff6b00]" />
                    Athlete Roster ({trainees.length})
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 font-bold">1-CLICK LOGIN</span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {trainees.map((trainee) => (
                    <button
                      key={trainee.id}
                      onClick={() => handleQuickLogin(trainee.id, trainee.name)}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#09090b] border border-[#1e202c] hover:border-[#ff6b00]/40 hover:bg-[#14151e] transition-all text-left group shadow-sm cursor-pointer active:scale-95"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#2e303d] flex items-center justify-center font-mono font-black text-xs flex-shrink-0 shadow-inner">
                          {trainee.avatarText}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-white group-hover:text-[#ff6b00] transition-colors truncate">
                              {trainee.name}
                            </h4>
                            {trainee.assignedPlanId && (
                              <span className="text-[9px] font-mono font-bold px-2 py-0.2 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex-shrink-0">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {trainee.weightKg} kg • {trainee.goal || 'Hypertrophy'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <span className="text-[11px] font-mono font-bold text-zinc-400 group-hover:text-[#ff6b00] group-hover:translate-x-0.5 transition-all flex items-center gap-1">
                          <span>Enter</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  ))}

                  {trainees.length === 0 && (
                    <div className="p-6 rounded-2xl bg-[#09090b] border border-[#1e202c] text-center text-xs text-zinc-400 space-y-1">
                      <p className="font-bold text-white">No Athletes Registered Yet</p>
                      <p className="text-[11px] text-zinc-500">Log in as Head Coach to create athlete accounts & workout splits.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* Email Sign In Form */
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-bold">
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
                    placeholder="e.g. rawan.ahmed@fitness.io or coach@workouts.io"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#09090b] border border-[#1e202c] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00]/60 transition-colors font-medium"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl btn-orange text-xs font-black tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Access Workout Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-zinc-500">
                  Quick demo: <button type="button" onClick={() => setEmailInput('rawanahmed@gmail.com')} className="text-zinc-300 underline font-mono">rawanahmed@gmail.com</button>
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-[11px] text-zinc-500">
            Athletes can bookmark their direct link (<code className="font-mono text-[#ff6b00]">/?user=athlete-id</code>) for 1-tap entry.
          </p>
        </div>
      </div>
    </div>
  );
};
