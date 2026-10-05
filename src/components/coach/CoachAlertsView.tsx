'use client';

import React, { useState, useMemo } from 'react';
import { CoachAlert, AlertPriority } from '@/lib/alertsEngine';
import { User } from '@/types';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';

interface CoachAlertsViewProps {
  alerts: CoachAlert[];
  onNavigateToClient: (clientId: string, subTab?: 'overview' | 'checkins' | 'workout' | 'nutrition' | 'logs') => void;
  onOpenAssignModal?: (user: User) => void;
}

export const CoachAlertsView: React.FC<CoachAlertsViewProps> = ({
  alerts,
  onNavigateToClient,
  onOpenAssignModal
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-[#141a24]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
              Action Alerts
            </h1>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#111827] text-cyan-400 border border-[#1f293d]">
              {alerts.length} pending
            </span>
          </div>
          <p className="text-[11px] text-[#8896aa] mt-0.5">
            Automated coaching queue requiring your review or intervention.
          </p>
        </div>

        {/* Search input - clean minimal typography */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client or issue..."
            className="w-full px-3 py-1.5 rounded-xl bg-[#090d14] border border-[#161f2e] text-xs text-white placeholder-[#526075] focus:outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>
      </div>

      {/* 2. Top Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
        {/* Metric 1: Critical Attention */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#080c14] border border-[#141b26] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#cbd5e1]">Critical Attention</span>
            <span className="text-[10px] font-mono text-rose-400 font-medium px-2 py-0.5 rounded-full bg-[#201117] border border-rose-500/20">
              Needs action
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-white font-numeric tracking-tight block leading-none">
              {criticalCount}
            </span>
            <span className="text-[11px] text-[#8896aa]">
              Unreviewed or late updates
            </span>
          </div>
        </div>

        {/* Metric 2: Pending Guidance */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#080c14] border border-[#141b26] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#cbd5e1]">Pending Guidance</span>
            <span className="text-[10px] font-mono text-amber-400 font-medium px-2 py-0.5 rounded-full bg-[#1c1710] border border-amber-500/20">
              Secondary
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-white font-numeric tracking-tight block leading-none">
              {warningCount}
            </span>
            <span className="text-[11px] text-[#8896aa]">
              Missing splits & diet gaps
            </span>
          </div>
        </div>

        {/* Metric 3: Total Trainees Covered */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#080c14] border border-[#141b26] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#cbd5e1]">Active Roster</span>
            <span className="text-[10px] font-mono text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-[#0a1f18] border border-emerald-500/20">
              Coverage
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-bold text-white font-numeric tracking-tight block leading-none">
              <span>{traineesMap.size}</span>
              <span className="text-[#64748b] text-sm font-normal ml-1">athletes</span>
            </div>
            <span className="text-[11px] text-[#8896aa]">
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
            className={`px-3 py-1 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === f.key
                ? 'bg-white text-[#080c14] font-semibold shadow-sm'
                : 'bg-[#090d14] text-[#8896aa] hover:text-white border border-[#16202e]'
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
          <div className="p-8 sm:p-12 text-center rounded-xl bg-[#080c14] border border-[#141b26] space-y-2">
            <h3 className="text-sm font-bold text-white">All Clear</h3>
            <p className="text-xs text-[#8896aa] max-w-sm mx-auto">
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
                className="p-3 sm:p-3.5 rounded-xl bg-[#080c14] hover:bg-[#0c121c] border border-[#141b26] hover:border-[#1e293b] transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                {/* Left Side: Avatar, Name, Title, Reason */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Athlete Avatar */}
                  <img
                    src={athlete?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                    alt={alert.clientName}
                    onClick={() => onNavigateToClient(alert.clientId, 'overview')}
                    className="w-9 h-9 rounded-full object-cover border border-[#1d2a3d] flex-shrink-0 cursor-pointer hover:border-cyan-400 transition-colors"
                    title={`Open ${alert.clientName}'s profile`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        onClick={() => onNavigateToClient(alert.clientId, 'overview')}
                        className="text-xs font-bold text-white hover:text-cyan-400 transition-colors cursor-pointer"
                      >
                        {alert.clientName}
                      </span>

                      {/* Status Badges */}
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                          isCritical
                            ? 'bg-[#201117] text-rose-300 border border-rose-500/25'
                            : 'bg-[#1c1710] text-amber-300 border border-amber-500/25'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-rose-400' : 'bg-amber-400'}`} />
                        <span>{isCritical ? 'Critical' : 'Warning'}</span>
                      </span>

                      <span className="text-[10px] font-mono text-[#64748b]">
                        {alert.timestamp}
                      </span>
                    </div>

                    {/* Alert Title */}
                    <h3 className="text-xs font-bold text-white mt-1 leading-tight">
                      {alert.title}
                    </h3>

                    {/* Alert Reason */}
                    <p className="text-[11px] text-[#8896aa] mt-0.5 leading-relaxed">
                      {alert.reason}
                    </p>
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onNavigateToClient(alert.clientId, 'overview')}
                    className="py-1.5 px-3 rounded-lg bg-[#090d14] hover:bg-[#111722] border border-[#16202e] hover:border-[#1e293b] text-xs font-medium text-[#94a3b8] hover:text-white transition-all cursor-pointer"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => handlePrimaryAction(alert)}
                    className="py-1.5 px-3.5 rounded-lg bg-white hover:bg-slate-100 text-[#080c14] text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
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
