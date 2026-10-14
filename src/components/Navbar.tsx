'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Flame, 
  LogOut, 
  Search, 
  Bell, 
  Sparkles, 
  LayoutDashboard, 
  Home, 
  TrendingUp, 
  CheckCircle2, 
  Menu, 
  Activity,
  X,
  Utensils,
  Layers,
  ChevronRight
} from 'lucide-react';
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer';
import { getStoredNotifications } from '@/lib/smartNotifications';
import { SearchInput } from '@/components/ui';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewTraineeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenNewTraineeModal }) => {
  const { currentUser, users, switchUser, logout } = useGym();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const notifs = getStoredNotifications(currentUser.id);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    }
  }, [currentUser, isNotifDrawerOpen]);

  // Facebook-style auto-hide bottom navigation on scroll
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If close to top, always show navbar
      if (currentScrollY < 15) {
        setIsNavVisible(true);
      } 
      // If scrolling down by more than 8px and past 50px threshold, hide navbar
      else if (currentScrollY > lastScrollY + 8 && currentScrollY > 50) {
        setIsNavVisible(false);
      } 
      // If scrolling up by more than 4px, show navbar immediately
      else if (currentScrollY < lastScrollY - 4) {
        setIsNavVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  if (!currentUser) return null;

  const isCoach = currentUser.role === 'coach';
  const trainees = users.filter((u) => u.role === 'trainee');
  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(switcherSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(switcherSearch.toLowerCase())
  );

  return (
    <>
      {/* 1. Top Header App Bar (Dynamic Island & Notch Safe) */}
      <header 
        className="sticky top-0 z-40 border-b border-[var(--card-border)] bg-[var(--bg-main)]/95 backdrop-blur-md safe-header-top"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)'
        }}
      >
        <div className="max-w-md md:max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            
            {/* Left: Mobile Menu Hamburger / Brand */}
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Button (Opens Profile Drawer) - Three lines without circle */}
              <button
                onClick={() => setIsSwitcherOpen(true)}
                className="p-1 -ml-1 text-zinc-300 hover:text-white transition-colors md:hidden cursor-pointer active:scale-95"
                title="Open Account Menu"
              >
                <Menu className="w-6 h-6 stroke-[2]" />
              </button>

              {/* Desktop Logo & Brand */}
              <div 
                className="hidden md:flex items-center gap-2.5 group cursor-pointer" 
                onClick={() => setActiveTab(isCoach ? 'dashboard' : 'today')}
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--main-color)] transition-all duration-200 group-hover:border-[var(--main-color)]/60 shadow-[0_0_12px_rgba(47,128,237,0.15)] flex-shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 3L2 21h20L12 3zm0 4.5l6.5 11.5H5.5L12 7.5z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black tracking-wider text-white">
                      {isCoach ? 'Workouts' : 'ATHLETE'}
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[var(--main-color)]/10 text-[var(--main-color)] border border-[var(--main-color)]/20 tracking-wider">
                      {isCoach ? 'OS' : 'PRO'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Navigation Tabs (Hidden on mobile where bottom dock takes over) */}
              <nav className="hidden md:flex items-center gap-1 ml-4 p-1 rounded-2xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)]">
                {isCoach ? (
                  <>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'dashboard'
                          ? 'bg-[var(--card-bg)] text-[var(--main-color)] shadow-sm border border-[var(--main-color)]/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => setActiveTab('splits-studio')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'splits-studio'
                          ? 'bg-[var(--card-bg)] text-[var(--main-color)] shadow-sm border border-[var(--main-color)]/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Splits Studio
                    </button>
                    <button
                      onClick={() => setActiveTab('diet')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'diet'
                          ? 'bg-[var(--card-bg)] text-[var(--main-color)] shadow-sm border border-[var(--main-color)]/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      Nutrition Studio
                    </button>
                    <button
                      onClick={() => setActiveTab('clients')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'clients'
                          ? 'bg-[var(--card-bg)] text-[var(--main-color)] shadow-sm border border-[var(--main-color)]/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Clients ({trainees.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('exercises')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'exercises'
                          ? 'bg-[var(--card-bg)] text-[var(--main-color)] shadow-sm border border-[var(--main-color)]/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Exercises
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveTab('today')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'today'
                          ? 'bg-[var(--card-bg)] text-[var(--main-color)] shadow-sm border border-[var(--main-color)]/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                      Home
                    </button>
                    <button
                      onClick={() => setActiveTab('split')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'split'
                          ? 'bg-[var(--card-bg)] text-[var(--main-color)] shadow-sm border border-[var(--main-color)]/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                      Workouts
                    </button>
                    <button
                      onClick={() => setActiveTab('diet')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'diet'
                          ? 'bg-[var(--card-bg)] text-[var(--main-color)] shadow-sm border border-[var(--main-color)]/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      Diet
                    </button>
                    <button
                      onClick={() => setActiveTab('habits')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'habits'
                          ? 'bg-[var(--card-bg)] text-[var(--main-color)] shadow-sm border border-[var(--main-color)]/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Habits
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'history'
                          ? 'bg-[var(--card-bg)] text-[var(--main-color)] shadow-sm border border-[var(--main-color)]/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      Progress
                    </button>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'profile'
                          ? 'bg-[var(--card-bg)] text-[var(--main-color)] shadow-sm border border-[var(--main-color)]/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      Profile
                    </button>
                  </>
                )}
              </nav>
            </div>

            {/* Right: Notifications & Profile Avatar */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Notification Bell */}
              <button
                onClick={() => setIsNotifDrawerOpen(true)}
                className="relative p-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer flex-shrink-0 active:scale-95"
                title="Notifications & Smart Alerts"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--main-color)] text-white text-[8px] font-mono font-black flex items-center justify-center animate-pulse shadow-[0_0_8px_var(--main-color)]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Avatar Circle with Active Indicator */}
              <button
                onClick={() => setIsSwitcherOpen(true)}
                className="relative flex items-center cursor-pointer active:scale-95 group flex-shrink-0"
                title="Open Account Menu"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--main-color)] flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-[var(--main-color)]/30">
                  {currentUser.avatarText}
                </div>
                {/* Active circle indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-main)]" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. Responsive Bottom Sheet / Account Switcher Drawer (Never Clips on Mobile) */}
      {isSwitcherOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsSwitcherOpen(false)}
        >
          <div 
            className="w-full max-w-md gym-card-elevated rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5 animate-in slide-in-from-bottom duration-250 max-h-[85vh] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator Bar */}
            <div className="w-12 h-1 rounded-full bg-slate-700 mx-auto sm:hidden -mt-1 mb-1" />

            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
              <div>
                <span className="gym-label-mono block">
                  CURRENT ACCOUNT
                </span>
                <h3 className="gym-heading-section truncate max-w-[200px]">
                  {currentUser.name}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="gym-badge-blue text-[9px]">
                  {isCoach ? 'COACH' : 'ATHLETE'}
                </span>
                <button
                  onClick={() => setIsSwitcherOpen(false)}
                  className="gym-btn-ghost gym-btn-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <SearchInput
              value={switcherSearch}
              onChange={setSwitcherSearch}
              placeholder="Search profiles..."
            />

            {/* Accounts Scrollable List */}
            <div className="overflow-y-auto space-y-1.5 max-h-56 pr-1 custom-scrollbar">
              {filteredUsers.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setIsSwitcherOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isCurrent 
                        ? 'bg-[var(--main-color)]/15 border border-[var(--main-color)]/40 text-white shadow-xs' 
                        : 'bg-[var(--card-subtle-bg)] border border-white/[0.06] hover:bg-[var(--card-bg)] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] border border-white/[0.08] flex items-center justify-center font-bold text-xs text-[var(--main-color)] flex-shrink-0 font-mono">
                        {u.avatarText || u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-tight">{u.name}</p>
                        <p className="gym-subtext mt-0.5 truncate">{u.role === 'coach' ? 'Head Coach' : 'Athlete'}</p>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-[var(--main-color)] shadow-[0_0_8px_var(--main-color)] flex-shrink-0 mr-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-2.5 border-t border-white/[0.08] space-y-2">
              {isCoach && (
                <button
                  onClick={() => {
                    setIsSwitcherOpen(false);
                    onOpenNewTraineeModal();
                  }}
                  className="w-full gym-btn-secondary h-9 justify-center"
                >
                  <Plus className="w-4 h-4 text-[var(--main-color)]" />
                  <span>Register New Athlete</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsSwitcherOpen(false);
                  logout();
                }}
                className="w-full gym-btn-danger h-9 justify-center"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Bottom Fixed Navigation Bar (Trainee only, completely removed for Coach view) */}
      {!isCoach && (
        <div 
          className={`fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-main)]/95 border-[var(--card-border)] backdrop-blur-xl border-t px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
            isNavVisible ? 'translate-y-0' : 'translate-y-28 pointer-events-none'
          }`}
        >
            {/* 1. Home Tab */}
            <button
              onClick={() => setActiveTab('today')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative group cursor-pointer active:scale-95 ${
                activeTab === 'today'
                  ? 'text-[var(--main-color)] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'today' ? 'fill-current' : ''}`} />
              <span className="text-[10px] tracking-tight font-medium">Home</span>
              {activeTab === 'today' && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-[var(--main-color)] shadow-[0_0_10px_var(--main-color)]" />
              )}
            </button>

            {/* 2. Workouts Tab */}
            <button
              onClick={() => setActiveTab('split')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative group cursor-pointer active:scale-95 ${
                activeTab === 'split'
                  ? 'text-[var(--main-color)] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Dumbbell className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight font-medium">Workouts</span>
              {activeTab === 'split' && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-[var(--main-color)] shadow-[0_0_10px_var(--main-color)]" />
              )}
            </button>

            {/* 3. Diet Tab */}
            <button
              onClick={() => setActiveTab('diet')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative group cursor-pointer active:scale-95 ${
                activeTab === 'diet'
                  ? 'text-[var(--main-color)] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Utensils className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight font-medium">Diet</span>
              {activeTab === 'diet' && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-[var(--main-color)] shadow-[0_0_10px_var(--main-color)]" />
              )}
            </button>

            {/* 3. Habits Tab */}
            <button
              onClick={() => setActiveTab('habits')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative group cursor-pointer active:scale-95 ${
                activeTab === 'habits'
                  ? 'text-[var(--main-color)] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight font-medium">Habits</span>
              {activeTab === 'habits' && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-[var(--main-color)] shadow-[0_0_10px_var(--main-color)]" />
              )}
            </button>

            {/* 4. Progress Tab */}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative group cursor-pointer active:scale-95 ${
                activeTab === 'history'
                  ? 'text-[var(--main-color)] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight font-medium">Progress</span>
              {activeTab === 'history' && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-[var(--main-color)] shadow-[0_0_10px_var(--main-color)]" />
              )}
            </button>

            {/* 5. Profile Tab */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative group cursor-pointer active:scale-95 ${
                activeTab === 'profile'
                  ? 'text-[var(--main-color)] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserIcon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight font-medium">Profile</span>
              {activeTab === 'profile' && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-[var(--main-color)] shadow-[0_0_10px_var(--main-color)]" />
              )}
            </button>
        </div>
      )}

      {/* 3. Smart Notifications & Contextual Alerts Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        onNavigateTab={setActiveTab}
      />
    </>
  );
};
