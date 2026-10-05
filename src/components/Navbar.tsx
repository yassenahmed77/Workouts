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
        className={`sticky top-0 z-40 border-b ${isCoach ? 'border-[#24262e] bg-[#0a0a0c]/95' : 'border-[#24262e] bg-[#121316]/95'} backdrop-blur-md safe-header-top`}
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
                <div className="w-9 h-9 rounded-xl bg-[#18191e] border border-[#24262e] flex items-center justify-center text-[#2f80ed] transition-all duration-200 group-hover:border-[#2f80ed]/60 shadow-[0_0_12px_rgba(47,128,237,0.15)] flex-shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 3L2 21h20L12 3zm0 4.5l6.5 11.5H5.5L12 7.5z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black tracking-wider text-white">
                      {isCoach ? 'TitanFit' : 'ATHLETE'}
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#2f80ed]/10 text-[#2f80ed] border border-[#2f80ed]/20 tracking-wider">
                      {isCoach ? 'OS' : 'PRO'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Navigation Tabs (Hidden on mobile where bottom dock takes over) */}
              <nav className="hidden md:flex items-center gap-1 ml-4 p-1 rounded-2xl bg-[#141519] border border-[#24262e]">
                {isCoach ? (
                  <>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'dashboard'
                          ? 'bg-[#18191e] text-[#2f80ed] shadow-sm border border-[#2f80ed]/30 font-bold'
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
                          ? 'bg-[#18191e] text-[#2f80ed] shadow-sm border border-[#2f80ed]/30 font-bold'
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
                          ? 'bg-[#18191e] text-[#2f80ed] shadow-sm border border-[#2f80ed]/30 font-bold'
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
                          ? 'bg-[#18191e] text-[#2f80ed] shadow-sm border border-[#2f80ed]/30 font-bold'
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
                          ? 'bg-[#18191e] text-[#2f80ed] shadow-sm border border-[#2f80ed]/30 font-bold'
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
                          ? 'bg-[#18191e] text-[#2f80ed] shadow-sm border border-[#2f80ed]/30 font-bold'
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
                          ? 'bg-[#18191e] text-[#2f80ed] shadow-sm border border-[#2f80ed]/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                      }`}
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                      Workouts
                    </button>
                    <button
                      onClick={() => setActiveTab('habits')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        activeTab === 'habits'
                          ? 'bg-[#18191e] text-[#2f80ed] shadow-sm border border-[#2f80ed]/30 font-bold'
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
                          ? 'bg-[#18191e] text-[#2f80ed] shadow-sm border border-[#2f80ed]/30 font-bold'
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
                          ? 'bg-[#18191e] text-[#2f80ed] shadow-sm border border-[#2f80ed]/30 font-bold'
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
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#2f80ed] text-white text-[8px] font-mono font-black flex items-center justify-center animate-pulse shadow-[0_0_8px_#2f80ed]">
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
                <div className="w-8 h-8 rounded-full bg-[#18191e] border border-[#24262e] text-[#2f80ed] flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-[#2f80ed]/30">
                  {currentUser.avatarText}
                </div>
                {/* Active circle indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#121316]" />
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
            className="w-full max-w-md bg-[#18191e] border-t sm:border border-[#24262e] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-250 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator Bar */}
            <div className="w-12 h-1.5 rounded-full bg-zinc-700 mx-auto sm:hidden -mt-1 mb-1" />

            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#24262e]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                  CURRENT ACCOUNT
                </span>
                <h3 className="text-base font-extrabold text-white truncate max-w-[200px]">
                  {currentUser.name}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase px-2.5 py-1 rounded-full bg-[#2f80ed]/10 text-[#2f80ed] border border-[#2f80ed]/20 font-bold">
                  {isCoach ? 'COACH' : 'ATHLETE'}
                </span>
                <button
                  onClick={() => setIsSwitcherOpen(false)}
                  className="w-8 h-8 rounded-xl bg-[#141519] border border-[#24262e] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
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
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                      isCurrent 
                        ? 'bg-[#141519] border border-[#2f80ed]/40 text-white shadow-sm' 
                        : 'bg-[#0a0a0c] border border-[#24262e] hover:bg-[#141519] text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#18191e] border border-[#24262e] flex items-center justify-center font-black text-xs text-[#2f80ed] flex-shrink-0">
                        {u.avatarText}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-tight">{u.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">{u.role === 'coach' ? 'Head Coach' : 'Athlete'}</p>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2f80ed] shadow-[0_0_8px_#2f80ed] flex-shrink-0 mr-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#24262e] space-y-2">
              {isCoach && (
                <button
                  onClick={() => {
                    setIsSwitcherOpen(false);
                    onOpenNewTraineeModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-zinc-100 bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#2f80ed]" />
                  <span>Register New Athlete</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsSwitcherOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Facebook-Style Smart Auto-Hide Bottom Fixed Navigation Bar (Mobile only, hidden on desktop) */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-40 ${isCoach ? 'bg-[#0a0a0c]/95 border-[#24262e]' : 'bg-[#121316]/95 border-[#24262e]'} backdrop-blur-xl border-t px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] flex items-center justify-around shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isNavVisible ? 'translate-y-0' : 'translate-y-28 pointer-events-none'
        }`}
      >
        {isCoach ? (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                activeTab === 'dashboard'
                  ? 'text-[#2f80ed] font-bold'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Dashboard</span>
              {activeTab === 'dashboard' && (
                <span className="absolute bottom-0 w-4 h-0.5 rounded-full bg-[#2f80ed] shadow-[0_0_10px_#2f80ed]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('splits-studio')}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                activeTab === 'splits-studio'
                  ? 'text-[#2f80ed] font-bold'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              <Layers className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Splits</span>
              {activeTab === 'splits-studio' && (
                <span className="absolute bottom-0 w-4 h-0.5 rounded-full bg-[#2f80ed] shadow-[0_0_10px_#2f80ed]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('diet')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                activeTab === 'diet'
                  ? 'text-[#2f80ed] font-bold'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              <Utensils className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Nutrition</span>
              {activeTab === 'diet' && (
                <span className="absolute bottom-0 w-4 h-0.5 rounded-full bg-[#2f80ed] shadow-[0_0_10px_#2f80ed]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                activeTab === 'clients'
                  ? 'text-[#2f80ed] font-bold'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Clients</span>
              {activeTab === 'clients' && (
                <span className="absolute bottom-0 w-4 h-0.5 rounded-full bg-[#2f80ed] shadow-[0_0_10px_#2f80ed]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('exercises')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                activeTab === 'exercises'
                  ? 'text-[#2f80ed] font-bold'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              <BookOpen className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Library</span>
              {activeTab === 'exercises' && (
                <span className="absolute bottom-0 w-4 h-0.5 rounded-full bg-[#2f80ed] shadow-[0_0_10px_#2f80ed]" />
              )}
            </button>
          </>
        ) : (
          <>
            {/* 1. Home Tab */}
            <button
              onClick={() => setActiveTab('today')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative group cursor-pointer active:scale-95 ${
                activeTab === 'today'
                  ? 'text-[#2f80ed] font-bold'
                  : 'text-[#8e8e93] hover:text-zinc-200'
              }`}
            >
              <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'today' ? 'fill-current' : ''}`} />
              <span className="text-[10px] tracking-tight font-medium">Home</span>
              {activeTab === 'today' && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-[#2f80ed] shadow-[0_0_10px_#2f80ed]" />
              )}
            </button>

            {/* 2. Workouts Tab */}
            <button
              onClick={() => setActiveTab('split')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative group cursor-pointer active:scale-95 ${
                activeTab === 'split'
                  ? 'text-[#2f80ed] font-bold'
                  : 'text-[#8e8e93] hover:text-zinc-200'
              }`}
            >
              <Dumbbell className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight font-medium">Workouts</span>
              {activeTab === 'split' && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-[#2f80ed] shadow-[0_0_10px_#2f80ed]" />
              )}
            </button>

            {/* 3. Habits Tab */}
            <button
              onClick={() => setActiveTab('habits')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative group cursor-pointer active:scale-95 ${
                activeTab === 'habits'
                  ? 'text-[#2f80ed] font-bold'
                  : 'text-[#8e8e93] hover:text-zinc-200'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight font-medium">Habits</span>
              {activeTab === 'habits' && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-[#2f80ed] shadow-[0_0_10px_#2f80ed]" />
              )}
            </button>

            {/* 4. Progress Tab */}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative group cursor-pointer active:scale-95 ${
                activeTab === 'history'
                  ? 'text-[#2f80ed] font-bold'
                  : 'text-[#8e8e93] hover:text-zinc-200'
              }`}
            >
              <Activity className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight font-medium">Progress</span>
              {activeTab === 'history' && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-[#2f80ed] shadow-[0_0_10px_#2f80ed]" />
              )}
            </button>

            {/* 5. Profile Tab */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative group cursor-pointer active:scale-95 ${
                activeTab === 'profile'
                  ? 'text-[#2f80ed] font-bold'
                  : 'text-[#8e8e93] hover:text-zinc-200'
              }`}
            >
              <UserIcon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight font-medium">Profile</span>
              {activeTab === 'profile' && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-[#2f80ed] shadow-[0_0_10px_#2f80ed]" />
              )}
            </button>
          </>
        )}
      </div>

      {/* 3. Smart Notifications & Contextual Alerts Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        onNavigateTab={setActiveTab}
      />
    </>
  );
};
