'use client';

import React, { useState, useMemo } from 'react';
import { CoachAlert, AlertPriority } from '@/lib/alertsEngine';
import { User } from '@/types';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { PanelLeft } from 'lucide-react';

interface CoachAlertsViewProps {
  alerts: CoachAlert[];
  onNavigateToClient: (clientId: string, subTab?: 'overview' | 'checkins' | 'workout' | 'nutrition' | 'logs') => void;
  onOpenAssignModal?: (user: User) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const CoachAlertsView: React.FC<CoachAlertsViewProps> = ({
  alerts,
  onNavigateToClient,
  onOpenAssignModal,
  isSidebarOpen,
  onToggleSidebar
}) => {
  const { users } = useGym();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'checkin' | 'diet' | 'training'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Trainees map for quick lookup
  const traineesMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((u) => {
      if (u.role === 'trainee') map.set(u.id, u);
    });
    return map;
  }, [users]);

  // Priority counts
  const criticalCount = alerts.filter((a) => a.priority === 'CRITICAL').length;
  const warningCount = alerts.filter((a) => a.priority === 'WARNING').length;

  // Category counts
  const checkinAlertsCount = alerts.filter(
    (a) => a.type === 'CHECK_IN_OVERDUE' || a.type === 'UNREVIEWED_CHECK_IN' || a.targetSubTab === 'checkins'
  ).length;

  const dietAlertsCount = alerts.filter(
    (a) => a.type === 'NO_DIET_PLAN' || a.targetSubTab === 'nutrition'
  ).length;

  const trainingAlertsCount = alerts.filter(
    (a) => a.type === 'NO_WORKOUT_PLAN' || a.type === 'LOW_WORKOUT_ADHERENCE' || a.targetSubTab === 'workout'
  ).length;

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = alert.clientName.toLowerCase().includes(q);
        const matchesTitle = alert.title.toLowerCase().includes(q);
        const matchesReason = alert.reason.toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesReason) return false;
      }

      // Filter matching
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'CRITICAL') return alert.priority === 'CRITICAL';
      if (activeFilter === 'checkin') {
        return alert.type === 'CHECK_IN_OVERDUE' || alert.type === 'UNREVIEWED_CHECK_IN' || alert.targetSubTab === 'checkins';
      }
      if (activeFilter === 'diet') {
        return alert.type === 'NO_DIET_PLAN' || alert.targetSubTab === 'nutrition';
      }
      if (activeFilter === 'training') {
        return alert.type === 'NO_WORKOUT_PLAN' || alert.type === 'LOW_WORKOUT_ADHERENCE' || alert.targetSubTab === 'workout';
      }
      return true;
    });
  }, [alerts, activeFilter, searchQuery]);

  const handlePrimaryAction = (alert: CoachAlert) => {
    const athlete = traineesMap.get(alert.clientId);
    if (!athlete) {
      onNavigateToClient(alert.clientId, alert.targetSubTab);
      return;
    }

    if (alert.type === 'NO_WORKOUT_PLAN' && onOpenAssignModal) {
      onOpenAssignModal(athlete);
      return;
    }

    onNavigateToClient(alert.clientId, alert.targetSubTab);
  };

  return (
    <div className="space-y-2.5 sm:space-y-3.5 w-full max-w-none pb-4 select-none font-sans text-[#f8fafc]">
      {/* 1. Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[var(--card-border)]">
        <div>
          <div className="flex items-center gap-2.5">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors flex items-center justify-center cursor-pointer shrink-0 min-[1025px]:hidden"
                title={isSidebarOpen ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
                aria-label="Toggle Navigation Sidebar"
              >
                <PanelLeft className="w-4 h-4 text-slate-300" />
              </button>
            )}
            <h1 className="gym-heading-page">
              Action Alerts
            </h1>
            <span className="gym-delta-blue">
              {alerts.length} pending
            </span>
          </div>
          <p className="gym-subtext mt-0.5">
            Automated coaching queue requiring your review or intervention.
          </p>
        </div>

        {/* Search input */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client or issue..."
            className="w-full px-3 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[var(--main-color)] transition-colors"
          />
        </div>
      </div>

      {/* 2. Top Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
        {/* Metric 1: Critical Attention */}
        <div className="gym-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gym-text-secondary)]">Critical Attention</span>
            <span className="gym-delta-neg">
              Needs action
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="gym-delta-value">
              {criticalCount}
            </span>
            <span className="gym-subtext">
              Unreviewed or late updates
            </span>
          </div>
        </div>

        {/* Metric 2: Pending Guidance */}
        <div className="gym-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gym-text-secondary)]">Pending Guidance</span>
            <span className="gym-delta-warn">
              Secondary
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="gym-delta-value">
              {warningCount}
            </span>
            <span className="gym-subtext">
              Missing splits & diet gaps
            </span>
          </div>
        </div>

        {/* Metric 3: Total Trainees Covered */}
        <div className="gym-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--gym-text-secondary)]">Active Roster</span>
            <span className="gym-delta-pos">
              Coverage
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="gym-delta-value flex items-baseline">
              <span>{traineesMap.size}</span>
              <span className="text-[var(--gym-text-muted)] text-xs font-normal ml-1">athletes</span>
            </div>
            <span className="gym-subtext">
              {Math.max(0, traineesMap.size - alerts.length)} completely clear
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Pills Bar */}
      <div className="flex items-center gap-1.5 py-0.5 overflow-x-auto custom-scrollbar">
        {[
          { key: 'ALL', label: 'All Alerts', count: alerts.length },
          { key: 'CRITICAL', label: 'Critical Only', count: criticalCount },
          { key: 'checkin', label: 'Check-ins', count: checkinAlertsCount },
          { key: 'diet', label: 'Nutrition', count: dietAlertsCount },
          { key: 'training', label: 'Training', count: trainingAlertsCount }
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key as any)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === f.key
                ? 'gym-btn-primary shadow-sm'
                : 'gym-btn-secondary'
            }`}
          >
            <span>{f.label}</span>
            <span className="ml-1 text-[10px] opacity-75">({f.count})</span>
          </button>
        ))}
      </div>

      {/* 4. Main Full-Width Alerts List */}
      <div className="space-y-2">
        {filteredAlerts.length === 0 ? (
          <div className="gym-card p-8 sm:p-12 text-center space-y-2">
            <h3 className="gym-heading-card">All Clear</h3>
            <p className="gym-subtext max-w-sm mx-auto">
              No pending alerts or required actions match this filter. Everything across your roster is running smoothly.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const athlete = traineesMap.get(alert.clientId);
            const isCritical = alert.priority === 'CRITICAL';

            return (
              <div
                key={alert.id}
                className="gym-card gym-card-interactive flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                {/* Left Side: Avatar, Name, Title, Reason */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Athlete Avatar */}
                  <img
                    src={athlete?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                    alt={alert.clientName}
                    onClick={() => onNavigateToClient(alert.clientId, 'overview')}
                    className="w-9 h-9 rounded-full object-cover border border-[var(--card-border)] flex-shrink-0 cursor-pointer hover:border-[var(--main-color)] transition-colors"
                    title={`Open ${alert.clientName}'s profile`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        onClick={() => onNavigateToClient(alert.clientId, 'overview')}
                        className="text-xs font-bold text-white hover:text-[var(--main-color)] transition-colors cursor-pointer"
                      >
                        {alert.clientName}
                      </span>

                      {/* Status Badges */}
                      <span className={isCritical ? 'gym-delta-neg' : 'gym-delta-warn'}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-rose-400' : 'bg-amber-400'}`} />
                        <span>{isCritical ? 'Critical' : 'Warning'}</span>
                      </span>

                      <span className="gym-label-mono text-[var(--gym-text-muted)]">
                        {alert.timestamp}
                      </span>
                    </div>

                    {/* Alert Title */}
                    <h3 className="gym-heading-card mt-1 leading-tight">
                      {alert.title}
                    </h3>

                    {/* Alert Reason */}
                    <p className="gym-subtext mt-0.5 leading-relaxed">
                      {alert.reason}
                    </p>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onNavigateToClient(alert.clientId, 'overview')}
                    className="gym-btn-secondary text-xs"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => handlePrimaryAction(alert)}
                    className="gym-btn-primary text-xs"
                  >
                    {alert.actionLabel || 'Review Status'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
