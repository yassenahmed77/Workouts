'use client';

import React, { useState, useEffect } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { 
  SmartNotification, 
  getStoredNotifications, 
  generateSmartNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  requestPushPermission,
  triggerWebNotification
} from '@/lib/smartNotifications';
import { getUserHabits } from '@/lib/habitsEngine';
import { 
  Bell, 
  X, 
  Flame, 
  Dumbbell, 
  Droplets, 
  Pill, 
  Award, 
  Moon, 
  Zap, 
  CheckCheck, 
  ArrowRight,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const { currentUser, getUserLogs, getPlanForUser } = useGym();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const logs = getUserLogs(currentUser.id);
      const plan = getPlanForUser(currentUser.id) || null;
      const habits = getUserHabits(currentUser.id);
      const notifs = generateSmartNotifications(currentUser, logs, plan, habits);
      setNotifications(notifs);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsAsRead(currentUser.id);
    setNotifications(updated);
    showToast('All notifications marked as read! ✓', 'info');
  };

  const handleNotificationClick = (notif: SmartNotification) => {
    markNotificationAsRead(currentUser.id, notif.id);
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    if (notif.actionTab) {
      onNavigateTab(notif.actionTab);
      onClose();
    }
  };

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    setIsPushEnabled(granted);
    if (granted) {
      triggerWebNotification('⚡ Notifications Enabled!', 'You will now receive intelligent streak & workout reminders.');
      showToast('Browser notifications activated! 🔔', 'success');
    } else {
      showToast('Notification permission was not granted', 'error');
    }
  };

  const getNotifIcon = (notif: SmartNotification) => {
    switch (notif.iconKey) {
      case 'flame': return <Flame className="w-4 h-4 text-[#ff6b00] fill-current" />;
      case 'dumbbell': return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      case 'droplets': return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'award': return <Award className="w-4 h-4 text-amber-400" />;
      case 'moon': return <Moon className="w-4 h-4 text-purple-400" />;
      case 'zap': return <Zap className="w-4 h-4 text-[#ff6b00]" />;
      default: return <Sparkles className="w-4 h-4 text-zinc-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0d0e14] border-l border-[#212330] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-250 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Background Blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b00]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#1e202c] flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#171822] text-[#ff6b00] border border-[#2e303d] flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff6b00] text-white text-[9px] font-mono font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Alerts & Updates
              </h2>
              <p className="text-[11px] text-zinc-400">
                {unreadCount > 0 ? `${unreadCount} new notifications` : 'All caught up!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#181924] transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#181924] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Push Notification Activation Banner */}
        {!isPushEnabled && (
          <div className="m-4 p-3.5 rounded-2xl bg-[#14151e] border border-[#ff6b00]/30 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-extrabold text-white block">
                Enable App Alerts
              </span>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Never lose your streak or miss a workout session.
              </p>
            </div>
            <button
              onClick={handleEnablePush}
              className="px-3 py-1.5 rounded-xl btn-orange text-[11px] font-black whitespace-nowrap cursor-pointer active:scale-95 transition-all flex-shrink-0"
            >
              Enable 🔔
            </button>
          </div>
        )}

        {/* Notification List Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative group space-y-2 ${
                !notif.read
                  ? 'bg-[#14151e] border-[#ff6b00]/40 shadow-md shadow-[#ff6b00]/5'
                  : 'bg-[#09090b] border-[#1e202c] hover:border-[#303244]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#1c1d27] border border-[#2e303d] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getNotifIcon(notif)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-white tracking-tight">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-pulse flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed mt-1">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>

              {notif.actionTab && (
                <div className="pt-2 border-t border-[#1e202c] flex items-center justify-between text-[10px] font-bold text-[#ff6b00]">
                  <span>Tap to open {notif.actionTab.toUpperCase()}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-8 text-center rounded-3xl bg-[#09090b] border border-[#1e202c] my-6 space-y-2">
              <Sparkles className="w-8 h-8 text-[#ff6b00] mx-auto mb-1" />
              <h3 className="text-sm font-bold text-white">No Alerts Right Now</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                You are completely up to date with your workouts, habits, and streak targets!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
