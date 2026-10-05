'use client';

import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer';
import { getStoredNotifications } from '@/lib/smartNotifications';

interface CoachSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewTraineeModal: () => void;
  onOpenPlanBuilder: () => void;
  onSwitchToTrainee?: (traineeId: string) => void;
  onOpenAlerts?: () => void;
  alertsCount?: number;
}

export const CoachSidebar: React.FC<CoachSidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTraineeModal,
  onOpenPlanBuilder,
  onSwitchToTrainee,
  onOpenAlerts,
  alertsCount = 5
}) => {
  const { currentUser, users, plans, dietPlans, switchUser, logout } = useGym();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const trainees = users.filter((u) => u.role === 'trainee');
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(switcherSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(switcherSearch.toLowerCase())
  );

  useEffect(() => {
    if (currentUser) {
      const notifs = getStoredNotifications(currentUser.id);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    }
  }, [currentUser, isNotifDrawerOpen]);

  if (!currentUser) return null;

  // Typography-First navigation items without decorative icons
  const navItems = [
    {
      id: 'dashboard',
      label: 'Home'
    },
    {
      id: 'splits-studio',
      label: 'Workout Plans',
      count: plans.length || undefined
    },
    {
      id: 'diet',
      label: 'Diet Plans',
      count: dietPlans.length || undefined
    },
    {
      id: 'clients',
      label: 'Clients',
      count: trainees.length || undefined
    },
    {
      id: 'competitors',
      label: 'Competitors',
      count: trainees.filter((t) => t.isCompetitor || !!t.competitionProfile).length || undefined
    },
    {
      id: 'exercises',
      label: 'Exercise Library'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      count: alertsCount || undefined,
      isAlertBadge: true
    },
    {
      id: 'messages',
      label: 'Messages'
    },
    {
      id: 'calendar',
      label: 'Calendar'
    },
    {
      id: 'settings',
      label: 'Settings'
    }
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-56 h-screen sticky top-0 bg-[#0a0a0c] border-r border-[#24262e] p-3 flex-shrink-0 justify-between select-none z-30 font-sans">
        {/* Top: Brand Header & Navigation List */}
        <div className="space-y-4">
          {/* Brand Header: Clean Minimal Typography */}
          <div 
            className="flex items-center justify-between px-2 pt-1 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div>
              <span className="text-xs font-black tracking-wider text-white block leading-tight">
                WORKOUTS
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#2f80ed] font-semibold block uppercase mt-0.5">
                COACH OS
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#2f80ed]/10 text-[#2f80ed] border border-[#2f80ed]/20">
              PRO
            </span>
          </div>

          {/* Navigation Menu: Typography-First, Zero Decorative Icons */}
          <nav className="space-y-0.5 pt-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2f80ed]/10 text-white font-semibold border-l-2 border-[#2f80ed] shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.count !== undefined && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      item.isAlertBadge
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        : isActive 
                          ? 'bg-[#2f80ed]/20 text-[#2f80ed]' 
                          : 'text-zinc-500'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Coach Profile */}
        <div className="pt-2 border-t border-[#24262e]">
          <div 
            onClick={() => setIsSwitcherOpen(true)}
            className="flex items-center justify-between p-2 rounded-xl bg-[#18191e] hover:bg-[#1c1d22] border border-[#24262e] cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-[#141519] border border-[#24262e] text-[#2f80ed] text-[10px] font-bold flex items-center justify-center font-mono flex-shrink-0">
                {currentUser.avatarText || (currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'CO')}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate leading-tight">
                  {currentUser.name || 'Yassen Ahmed'}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono block truncate mt-0.5">
                  Coach
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
              Switch
            </span>
          </div>
        </div>
      </aside>

      {/* Account Switcher Modal */}
      {isSwitcherOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsSwitcherOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-[#18191e] border border-[#24262e] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#24262e]">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                  Current Account
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
                  {currentUser.name}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[#141519] text-zinc-300 border border-[#24262e]">
                  Coach
                </span>
                <button
                  onClick={() => setIsSwitcherOpen(false)}
                  className="px-2 py-1 rounded-lg bg-[#141519] hover:bg-[#1c1d22] text-zinc-400 hover:text-white text-xs font-medium transition-colors cursor-pointer border border-[#24262e]"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <div>
              <input
                type="text"
                placeholder="Search profiles..."
                value={switcherSearch}
                onChange={(e) => setSwitcherSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#141519] border border-[#24262e] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#2f80ed]"
              />
            </div>

            {/* Accounts List */}
            <div className="overflow-y-auto space-y-1 max-h-56 pr-1 custom-scrollbar">
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
                        ? 'bg-[#2f80ed]/15 border border-[#2f80ed]/40 text-white' 
                        : 'bg-[#141519] border border-[#24262e] hover:bg-[#1c1d22] text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#18191e] border border-[#24262e] flex items-center justify-center font-bold text-xs text-white flex-shrink-0 font-mono">
                        {u.avatarText || u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate leading-tight">
                          {u.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono block truncate">
                          {u.role}
                        </span>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-[#2f80ed] font-semibold">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Switch to Athlete Shortcut */}
            {trainees.length > 0 && onSwitchToTrainee && (
              <div className="pt-2 border-t border-[#24262e] flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-mono">
                  Quick athlete view:
                </span>
                <button
                  onClick={() => {
                    onSwitchToTrainee(trainees[0].id);
                    setIsSwitcherOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#2f80ed]/15 hover:bg-[#2f80ed]/25 border border-[#2f80ed]/30 text-xs font-medium text-[#2f80ed] transition-colors cursor-pointer"
                >
                  {trainees[0].name.split(' ')[0]}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsNotifDrawerOpen(false);
        }}
      />
    </>
  );
};
