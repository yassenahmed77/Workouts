'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useGym } from '@/context/GymContext';
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer';
import { getStoredNotifications } from '@/lib/smartNotifications';
import { X } from 'lucide-react';
export const CoachSidebar = ({ activeTab, setActiveTab, onOpenNewTraineeModal, onOpenPlanBuilder, onSwitchToTrainee, onOpenAlerts, alertsCount = 5, isOpen = false, onClose }) => {
    const { currentUser, users, plans, dietPlans, switchUser, logout } = useGym();
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [switcherSearch, setSwitcherSearch] = useState('');
    const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const sidebarRef = useRef(null);
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
    useEffect(() => {
        const checkViewport = () => {
            setIsMobileOrTablet(window.innerWidth <= 1024);
        };
        checkViewport();
        window.addEventListener('resize', checkViewport);
        return () => window.removeEventListener('resize', checkViewport);
    }, []);
    const trainees = users.filter((u) => u.role === 'trainee');
    const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(switcherSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(switcherSearch.toLowerCase()));
    useEffect(() => {
        if (currentUser) {
            const notifs = getStoredNotifications(currentUser.id);
            setUnreadCount(notifs.filter((n) => !n.read).length);
        }
    }, [currentUser, isNotifDrawerOpen]);
    // Close on Escape key when drawer is open
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isMobileOrTablet && isOpen && onClose) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, isMobileOrTablet]);
    // Close when clicking outside on screens <= 1024px
    useEffect(() => {
        const handlePointerDown = (e) => {
            if (isMobileOrTablet && isOpen && onClose) {
                if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                    onClose();
                }
            }
        };
        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, [isOpen, onClose, isMobileOrTablet]);
    if (!currentUser)
        return null;
    const handleNavClick = (tabId) => {
        setActiveTab(tabId);
        if (typeof window !== 'undefined' && window.innerWidth <= 1024 && onClose) {
            onClose();
        }
    };
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
    return (<>
      {/* Backdrop for mobile & tablet (<= 1024px) when sidebar is open */}
      {isMobileOrTablet && isOpen && (<div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200" onClick={onClose} aria-hidden="true"/>)}

      {/* Sidebar: Slide-over drawer on <=1024px, fixed persistent flex on desktop (> 1024px) */}
      <aside ref={sidebarRef} className={isMobileOrTablet
            ? `fixed top-0 bottom-0 left-0 w-64 z-50 bg-[var(--card-bg)] border-r border-[var(--card-border)] p-3 flex flex-col justify-between shadow-2xl select-none font-sans transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'}`
            : 'relative top-0 w-56 h-screen z-30 bg-[var(--card-bg)] border-r border-[var(--card-border)] p-3 flex flex-col justify-between select-none font-sans shrink-0'}>
        {/* Top: Brand Header & Navigation List */}
        <div className="space-y-3">
          {/* Brand Header: Clean Minimal Typography */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="cursor-pointer group flex-1" onClick={() => handleNavClick('dashboard')}>
              <span className="text-xs font-black tracking-wider text-white block leading-tight">
                WORKOUTS
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[var(--main-color)] font-bold block uppercase mt-0.5">
                COACH OS
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="gym-badge-blue text-[9px] px-1.5 py-0.2">
                PRO
              </span>
              {isMobileOrTablet && onClose && (<button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer" title="Close sidebar (Esc)" aria-label="Close sidebar">
                  <X className="w-3.5 h-3.5"/>
                </button>)}
            </div>
          </div>

          {/* Navigation Menu: Typography-First, Zero Decorative Icons */}
          <nav className="space-y-0.5 pt-1">
            {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (<button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${isActive
                    ? 'bg-[var(--main-color-muted)] text-white font-semibold border-l-2 border-[var(--main-color)] shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
                  <span className="truncate">{item.label}</span>
                  {item.count !== undefined && (<span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${item.isAlertBadge
                        ? 'gym-delta-neg'
                        : isActive
                            ? 'gym-delta-blue'
                            : 'gym-delta-neutral'}`}>
                      {item.count}
                    </span>)}
                </button>);
        })}
          </nav>
        </div>

        {/* Bottom Section: Coach Profile */}
        <div className="pt-2 border-t border-white/[0.07]">
          <div onClick={() => setIsSwitcherOpen(true)} className="gym-card-interactive flex items-center justify-between p-2 rounded-xl group">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-[var(--card-subtle-bg)] border border-white/[0.08] text-[var(--main-color)] text-[10px] font-bold flex items-center justify-center font-mono flex-shrink-0">
                {currentUser.avatarText || (currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'CO')}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate leading-tight">
                  {currentUser.name || 'Yassen Ahmed'}
                </span>
                <span className="text-[9px] text-slate-500 font-mono block truncate mt-0.5">
                  Coach
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300">
              Switch
            </span>
          </div>
        </div>
      </aside>

      {/* Account Switcher Modal */}
      {isSwitcherOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150" onClick={() => setIsSwitcherOpen(false)}>
          <div className="w-full max-w-md gym-card-elevated p-4 sm:p-5 shadow-2xl space-y-3 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col font-sans" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div>
                <span className="gym-label-mono block">
                  Current Account
                </span>
                <h3 className="gym-heading-section truncate max-w-[200px]">
                  {currentUser.name}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="gym-badge-blue text-[9px]">
                  Coach
                </span>
                <button onClick={() => setIsSwitcherOpen(false)} className="gym-btn-secondary gym-btn-sm">
                  Close
                </button>
              </div>
            </div>

            {/* Search Filter */}
            <div>
              <input type="text" placeholder="Search profiles..." value={switcherSearch} onChange={(e) => setSwitcherSearch(e.target.value)} className="w-full gym-input rounded-xl"/>
            </div>

            {/* Accounts List */}
            <div className="overflow-y-auto space-y-1 max-h-56 pr-1 custom-scrollbar">
              {filteredUsers.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (<button key={u.id} onClick={() => {
                        switchUser(u.id);
                        setIsSwitcherOpen(false);
                    }} className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${isCurrent
                        ? 'bg-[var(--main-color-muted)] border border-[var(--main-color-border)] text-white'
                        : 'bg-[var(--card-subtle-bg)] border border-[var(--card-border)] hover:bg-[var(--card-border)] text-slate-300'}`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[var(--card-bg)] border border-white/[0.08] flex items-center justify-center font-bold text-xs text-white flex-shrink-0 font-mono">
                        {u.avatarText || u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate leading-tight">
                          {u.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">
                          {u.role}
                        </span>
                      </div>
                    </div>
                    {isCurrent && (<span className="gym-badge-blue text-[10px]">
                        Active
                      </span>)}
                  </button>);
            })}
            </div>

            {/* Switch to Athlete Shortcut */}
            {trainees.length > 0 && onSwitchToTrainee && (<div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Quick athlete view:
                </span>
                <button onClick={() => {
                    onSwitchToTrainee(trainees[0].id);
                    setIsSwitcherOpen(false);
                }} className="gym-btn-primary gym-btn-sm">
                  {trainees[0].name.split(' ')[0]}
                </button>
              </div>)}
          </div>
        </div>)}

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={isNotifDrawerOpen} onClose={() => setIsNotifDrawerOpen(false)} onNavigateTab={(tab) => {
            setActiveTab(tab);
            setIsNotifDrawerOpen(false);
        }}/>
    </>);
};
