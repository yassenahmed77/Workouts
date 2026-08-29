'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { 
  Dumbbell, 
  Users, 
  ClipboardList, 
  BookOpen, 
  Calendar, 
  History, 
  User as UserIcon, 
  ChevronDown, 
  ShieldCheck, 
  Plus, 
  Sparkles,
  Flame,
  LogOut
} from 'lucide-react';
import { UserGoal } from '@/types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewTraineeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenNewTraineeModal }) => {
  const { currentUser, users, switchUser, logout } = useGym();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  if (!currentUser) return null;

  const isCoach = currentUser.role === 'coach';

  return (
    <header className="sticky top-0 z-40 border-b border-[#22222a] bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => setActiveTab(isCoach ? 'clients' : 'today')}>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-violet-400 flex items-center justify-center text-white font-black tracking-tighter shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-transform group-hover:scale-105">
                <Dumbbell className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  WORKOUTS <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60 tracking-wider">PRO OS</span>
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">Yassen Ahmed</span>
              </div>
            </div>

            {/* Navigation tabs */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {isCoach ? (
                <>
                  <button
                    onClick={() => setActiveTab('clients')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                      activeTab === 'clients'
                        ? 'bg-purple-950/40 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'text-zinc-400 hover:text-white hover:bg-[#121218]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    Trainees
                  </button>
                  <button
                    onClick={() => setActiveTab('plans')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                      activeTab === 'plans'
                        ? 'bg-purple-950/40 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'text-zinc-400 hover:text-white hover:bg-[#121218]'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
                    Workout Plans
                  </button>
                  <button
                    onClick={() => setActiveTab('exercises')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                      activeTab === 'exercises'
                        ? 'bg-purple-950/40 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'text-zinc-400 hover:text-white hover:bg-[#121218]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                    Exercise Library
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('today')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                      activeTab === 'today'
                        ? 'bg-purple-950/40 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'text-zinc-400 hover:text-white hover:bg-[#121218]'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-purple-400" />
                    Today's Session
                  </button>
                  <button
                    onClick={() => setActiveTab('split')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                      activeTab === 'split'
                        ? 'bg-purple-950/40 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'text-zinc-400 hover:text-white hover:bg-[#121218]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Weekly Split
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                      activeTab === 'history'
                        ? 'bg-purple-950/40 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'text-zinc-400 hover:text-white hover:bg-[#121218]'
                    }`}
                  >
                    <History className="w-3.5 h-3.5 text-purple-400" />
                    History & Logs
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                      activeTab === 'profile'
                        ? 'bg-purple-950/40 text-white border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                        : 'text-zinc-400 hover:text-white hover:bg-[#121218]'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                    Athlete Profile
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right Action: Active User / Live Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wider font-semibold border border-purple-900/50 bg-[#121216]">
              {isCoach ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-purple-400">ADMIN</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-purple-300">TRAINEE</span>
                </>
              )}
            </div>

            {/* Quick Switch Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-[#272732] bg-[#14141a] hover:bg-[#1b1b24] transition-all text-left group"
              >
                <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
                  isCoach ? 'bg-gradient-to-tr from-purple-600 to-violet-500 text-white' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {currentUser.avatarText}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-white leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 capitalize">
                    {isCoach ? 'Admin' : 'Trainee'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 ml-0.5" />
              </button>

              {/* Dropdown Menu */}
              {isSwitcherOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 rounded-xl bg-[#121218] border border-[#2c2c38] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsSwitcherOpen(false)}
                >
                  <div className="px-2.5 py-1.5 mb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80 flex items-center justify-between">
                    <span>Simulate / Switch Account</span>
                    <span className="text-zinc-500">1-Click</span>
                  </div>

                  <div className="space-y-1">
                    {users.map((u) => {
                      const isActive = u.id === currentUser.id;
                      const userIsCoach = u.role === 'coach';
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setActiveTab(userIsCoach ? 'clients' : 'today');
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                            isActive
                              ? 'bg-[#1e1e28] border border-purple-500/40'
                              : 'hover:bg-[#181820]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                              userIsCoach ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-300'
                            }`}>
                              {u.avatarText}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-semibold text-zinc-200 truncate">
                                {u.name}
                              </p>
                              <p className="text-[10px] text-zinc-500 truncate">
                                {u.email}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                            userIsCoach 
                              ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50' 
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {userIsCoach ? 'ADMIN' : 'TRAINEE'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions section */}
                  <div className="mt-2 pt-2 border-t border-zinc-800/80 space-y-1">
                    {isCoach && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSwitcherOpen(false);
                          onOpenNewTraineeModal();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-purple-400" />
                        Register New Trainee
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSwitcherOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out / Switch Portal
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Top Nav Strip */}
      <div className="md:hidden border-t border-zinc-900/80 px-3 py-1.5 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none bg-[#09090d]">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider pl-1">
          {isCoach ? 'Admin Portal' : 'Athlete Portal'}
        </span>
        <span className="text-[10px] font-mono font-bold text-purple-400">
          {currentUser.name}
        </span>
      </div>

      {/* Mobile Bottom Fixed App Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c11]/95 backdrop-blur-lg border-t border-[#22222e] px-2 py-1.5 flex items-center justify-around shadow-[0_-5px_25px_rgba(0,0,0,0.6)]">
        {isCoach ? (
          <>
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                activeTab === 'clients'
                  ? 'text-purple-400 bg-purple-950/50 scale-105'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">Trainees</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                activeTab === 'plans'
                  ? 'text-purple-400 bg-purple-950/50 scale-105'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ClipboardList className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">Splits</span>
            </button>

            <button
              onClick={() => setActiveTab('exercises')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                activeTab === 'exercises'
                  ? 'text-purple-400 bg-purple-950/50 scale-105'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">Database</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('today')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                activeTab === 'today'
                  ? 'text-purple-400 bg-purple-950/50 scale-105'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Flame className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">Today</span>
            </button>

            <button
              onClick={() => setActiveTab('split')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                activeTab === 'split'
                  ? 'text-purple-400 bg-purple-950/50 scale-105'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Calendar className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">Split</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                activeTab === 'history'
                  ? 'text-purple-400 bg-purple-950/50 scale-105'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <History className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">History</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                activeTab === 'profile'
                  ? 'text-purple-400 bg-purple-950/50 scale-105'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserIcon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">Profile</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
