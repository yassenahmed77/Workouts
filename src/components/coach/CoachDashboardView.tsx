'use client';

import React, { useState, useMemo } from 'react';
import { User } from '@/types';
import { useGym } from '@/context/GymContext';
import { CoachAlert } from '@/lib/alertsEngine';
import { clientService } from '@/services/clientService';
import { KpiDrillDownDrawer, DrillDownType } from './dashboard/KpiDrillDownDrawer';
import { SearchInput, KpiCard, ProgressRing, SegmentedTabs, AvatarGroup } from '@/components/ui';

interface CoachDashboardViewProps {
  onOpenAssignModal: (user?: User) => void;
  onOpenPlanBuilder: () => void;
  onOpenNewTraineeModal: () => void;
  onSelectClient: (user: User, subTab?: 'overview' | 'checkins' | 'workout' | 'nutrition' | 'logs' | 'notes' | 'timeline') => void;
  onNavigateToClients: () => void;
  onNavigateToCompetitors?: () => void;
  onNavigateToDiet: () => void;
  onNavigateToPlans: () => void;
  onOpenAlerts: () => void;
  alerts: CoachAlert[];
}

export const CoachDashboardView: React.FC<CoachDashboardViewProps> = ({
  onOpenAssignModal,
  onOpenPlanBuilder,
  onOpenNewTraineeModal,
  onSelectClient,
  onNavigateToClients,
  onNavigateToCompetitors,
  onNavigateToDiet,
  onNavigateToPlans,
  onOpenAlerts,
  alerts
}) => {
  const { users, currentUser } = useGym();

  const trainees = useMemo(() => {
    const coachId = currentUser?.role === 'coach' ? currentUser.id : undefined;
    return clientService.getTrainees(users, coachId);
  }, [users, currentUser]);

  // Global search & hover state
  const [globalSearch, setGlobalSearch] = useState('');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(7);
  const [drillDownType, setDrillDownType] = useState<DrillDownType | null>(null);
  const [upcomingFilter, setUpcomingFilter] = useState<'ALL' | 'checkin' | 'diet' | 'training' | 'renewal'>('ALL');

  // Athlete lookup helper
  const getAthlete = (id: string, fallbackName: string, fallbackAvatar: string) => {
    const found = trainees.find((t) => t.id === id || t.name.toLowerCase().includes(fallbackName.toLowerCase()));
    return (
      found ||
      ({
        id,
        name: fallbackName,
        email: `${fallbackName.toLowerCase().replace(' ', '.')}@email.com`,
        role: 'trainee',
        avatarUrl: fallbackAvatar,
        avatarText: fallbackName.slice(0, 2).toUpperCase(),
        weightKg: 70,
        targetWeightKg: 65,
        status: 'active'
      } as unknown as User)
    );
  };

  const rawan = getAthlete('user-rawan-1', 'Rawan Ahmed', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
  const omar = getAthlete('user-omar-2', 'Omar Hassan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
  const sara = getAthlete('user-sara-3', 'Sara Mohamed', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80');
  const ahmed = getAthlete('user-ahmed-4', 'Ahmed Ali', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80');
  const laila = getAthlete('user-laila-5', 'Laila Ahmed', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80');
  const mahmoud = getAthlete('user-mahmoud-6', 'Mahmoud Khaled', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80');
  const nour = getAthlete('user-nour-7', 'Nour El Din', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80');
  const tarek = getAthlete('user-tarek-gamal-8', 'Tarek Gamal', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80');

  const rosterSnapshotAthletes = [rawan, omar, sara, ahmed, laila, mahmoud, nour, tarek];

  // Action Items / Upcoming tasks (Simple, clean athletic terminology)
  const actionItems = useMemo(() => [
    {
      athlete: rawan,
      task: 'Weekly check-in late',
      category: 'checkin' as const,
      categoryLabel: 'Check-in',
      dotColor: 'bg-rose-400',
      timeBadge: 'Due today',
      targetTab: 'checkins' as const
    },
    {
      athlete: mahmoud,
      task: '-420 kcal under target',
      category: 'diet' as const,
      categoryLabel: 'Diet',
      dotColor: 'bg-amber-400',
      timeBadge: 'Under calories',
      targetTab: 'nutrition' as const
    },
    {
      athlete: sara,
      task: 'Phase 1 split completed',
      category: 'training' as const,
      categoryLabel: 'Training',
      dotColor: 'bg-cyan-400',
      timeBadge: 'Needs plan',
      targetTab: 'workout' as const
    },
    {
      athlete: omar,
      task: 'Scheduled check-in',
      category: 'checkin' as const,
      categoryLabel: 'Check-in',
      dotColor: 'bg-slate-400',
      timeBadge: 'Tomorrow',
      targetTab: 'checkins' as const
    },
    {
      athlete: tarek,
      task: 'Monthly renewal',
      category: 'renewal' as const,
      categoryLabel: 'Renewal',
      dotColor: 'bg-emerald-400',
      timeBadge: 'Renewing',
      targetTab: 'overview' as const
    }
  ], [rawan, mahmoud, sara, omar, tarek]);

  const filteredActionItems = useMemo(() => {
    if (upcomingFilter === 'ALL') return actionItems;
    return actionItems.filter((item) => item.category === upcomingFilter);
  }, [upcomingFilter, actionItems]);

  const coachFirstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Yassen';

  return (
    <div className="space-y-2 w-full max-w-none select-none font-sans text-slate-100 pb-1">
      {/* 1. Header & Actions Strip: Zero Fluff, Clean Typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#141b26]">
        <div className="flex items-center gap-3">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
            {coachFirstName}&apos;s Workspace
          </h1>
          <span className="text-xs font-mono text-slate-500 font-medium hidden sm:inline-block">
            Wed, Sep 26
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Minimal Search Input */}
          <SearchInput
            value={globalSearch}
            onChange={setGlobalSearch}
            placeholder="Search clients..."
            showShortcut={true}
            className="w-48 sm:w-56"
          />

          {/* Alerts Pill */}
          <button
            onClick={onOpenAlerts}
            className="px-2.5 py-1 rounded-lg bg-[#18191e] hover:bg-[#1c1d22] border border-[#24262e] text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Alerts</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
              {alerts.length || 3}
            </span>
          </button>

          {/* Primary Action Button: Text Only */}
          <button
            onClick={() => onOpenNewTraineeModal()}
            className="py-1 px-3 rounded-lg btn-cyan text-white text-xs font-bold transition-all shadow-md shadow-[#2f80ed]/25 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            + Athlete
          </button>
        </div>
      </div>

      {/* 2. Top Metric Tiles: High-Density, Zero-Fluff Subtitles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <KpiCard
          title="Active Roster"
          value={13}
          subtitle="11 checked in this week"
          badgeText="+2 new"
          badgeVariant="slate"
          onClick={() => setDrillDownType('active_clients')}
        />
        <KpiCard
          title="Contest Prep"
          value={3}
          unit="athletes"
          subtitle="NPC Showdown"
          badgeText="18 days out"
          badgeVariant="slate"
          onClick={() => {
            if (onNavigateToCompetitors) onNavigateToCompetitors();
          }}
        />
        <KpiCard
          title="Capacity"
          value={13}
          unit="/ 20"
          subtitle="3 renewals due"
          badgeText="65% full"
          badgeVariant="slate"
          onClick={() => setDrillDownType('roster_engagement')}
        />
      </div>

      {/* 3. Main Dashboard Grid: Left 8-col & Right 4-col */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* ===================== LEFT COLUMN (8 cols) ===================== */}
        <div className="lg:col-span-8 space-y-2">
          {/* Card 1: Roster Health (Zero Subtitle Fluff) */}
          <div className="p-2.5 rounded-xl bg-[#18191e] border border-[#24262e] shadow-sm">
            <div className="flex items-center justify-between pb-1 border-b border-[#24262e]">
              <span className="text-xs font-bold text-white tracking-tight">Roster Health</span>
              <span className="text-[10px] font-mono text-slate-400">This Week</span>
            </div>

            {/* 5 Progress Rings: Calm Slate / Cyan Palette */}
            <div className="grid grid-cols-5 gap-1.5 pt-2 text-center">
              {[
                { title: 'Training', pct: 78, color: '#2f80ed', text: '11/13 active', drillDown: 'roster_training' as DrillDownType },
                { title: 'Nutrition', pct: 81, color: '#3897f0', text: '9/13 on target', drillDown: 'roster_nutrition' as DrillDownType },
                { title: 'Check-ins', pct: 69, color: '#2f80ed', text: '9/13 reviewed', drillDown: 'roster_checkins' as DrillDownType },
                { title: 'Engagement', pct: 84, color: '#3897f0', text: '11/13 active', drillDown: 'roster_engagement' as DrillDownType },
                { title: 'Progress', pct: 77, color: '#2f80ed', text: '10/13 advancing', drillDown: 'roster_progress' as DrillDownType }
              ].map((g) => (
                <ProgressRing
                  key={g.title}
                  title={g.title}
                  pct={g.pct}
                  color={g.color}
                  subtext={g.text}
                  onClick={() => setDrillDownType(g.drillDown)}
                />
              ))}
            </div>
          </div>

          {/* Dual Split: Progress Overview + Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Progress Overview (Clean Monochromatic Chart) */}
            <div className="p-2.5 rounded-xl bg-[#18191e] border border-[#24262e] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1 border-b border-[#24262e]">
                <span className="text-xs font-bold text-white">Progress Overview</span>
                <span className="text-[10px] font-mono text-slate-400">Last 8 weeks</span>
              </div>

              {/* Legend: Text Only */}
              <div className="flex items-center gap-3 text-[10px] font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2f80ed]" />
                  <span className="text-slate-300">Weight</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-slate-300">Body Fat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="text-slate-300">Strength</span>
                </div>
              </div>

              {/* SVG Curve Chart */}
              <div className="w-full h-24 relative mt-1 select-none">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 420 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cyanLineArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2f80ed" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#2f80ed" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {[
                    { y: 15, val: '100' },
                    { y: 40, val: '80' },
                    { y: 65, val: '60' },
                    { y: 90, val: '40' }
                  ].map((g) => (
                    <g key={g.y}>
                      <line x1="28" y1={g.y} x2="415" y2={g.y} stroke="#121824" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="22" y={g.y + 3} fill="#475569" fontSize="8" textAnchor="end" fontFamily="monospace">
                        {g.val}
                      </text>
                    </g>
                  ))}

                  <path
                    d="M 35 50 C 80 48, 130 54, 180 49 C 230 45, 280 52, 330 48 C 370 46, 395 53, 410 53 L 410 90 L 35 90 Z"
                    fill="url(#cyanLineArea)"
                  />
                  <path
                    d="M 35 50 C 80 48, 130 54, 180 49 C 230 45, 280 52, 330 48 C 370 46, 395 53, 410 53"
                    fill="none"
                    stroke="#2f80ed"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 35 70 C 80 74, 130 72, 180 73 C 230 75, 280 72, 330 74 C 370 73, 395 70, 410 69"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 35 34 C 80 37, 130 31, 180 28 C 230 27, 280 28, 330 24 C 370 22, 395 21, 410 20"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>

                {hoveredPointIndex !== null && (
                  <div className="absolute top-0 right-1 bg-[#090d14] border border-[#16202e] px-2 py-0.5 rounded text-left font-mono">
                    <span className="text-[9px] text-slate-400">Weight: <strong className="text-white">67.8 kg</strong></span>
                  </div>
                )}
              </div>

              {/* X-axis Labels */}
              <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 pt-0.5 px-1">
                <span>Jul 20</span>
                <span>Aug 03</span>
                <span>Aug 17</span>
                <span>Aug 31</span>
                <span>Sep 14</span>
              </div>
            </div>

            {/* Recent Activity (Typography-First, Zero Inline Icons) */}
            <div className="p-2.5 rounded-xl bg-[#18191e] border border-[#24262e] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1 border-b border-[#24262e]">
                <span className="text-xs font-bold text-white">Recent Activity</span>
                <button
                  onClick={onNavigateToClients}
                  className="text-[10px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-1 pt-1 flex-1 flex flex-col justify-around">
                {[
                  { athlete: rawan, action: 'Completed Upper Body', time: '2h ago' },
                  { athlete: omar, action: 'Updated weight (78.4 kg)', time: '4h ago' },
                  { athlete: sara, action: 'Uploaded check-in photos', time: '5h ago' },
                  { athlete: ahmed, action: 'Submitted check-in', time: '6h ago' },
                  { athlete: laila, action: 'Updated meal log', time: '8h ago' }
                ].map((act, i) => (
                  <div
                    key={i}
                    onClick={() => onSelectClient(act.athlete, 'overview')}
                    className="flex items-center justify-between gap-2 cursor-pointer group py-0.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/10 text-white text-[9px] font-bold flex items-center justify-center font-mono flex-shrink-0">
                        {act.athlete.avatarText}
                      </div>
                      <p className="text-[11px] truncate leading-tight">
                        <span className="font-semibold text-white group-hover:text-[#2f80ed] transition-colors">
                          {act.athlete.name}
                        </span>{' '}
                        <span className="text-slate-400">{act.action}</span>
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 flex-shrink-0">
                      {act.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Roster Snapshot Strip */}
          <div className="p-2 px-3 rounded-xl bg-[#18191e] border border-[#24262e] flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                Roster
              </span>
              <AvatarGroup
                athletes={rosterSnapshotAthletes}
                max={8}
                size="sm"
                onSelect={(a) => onSelectClient(a, 'overview')}
              />
            </div>

            <button
              onClick={onNavigateToClients}
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              All Clients &rarr;
            </button>
          </div>
        </div>

        {/* ===================== RIGHT COLUMN (4 cols) ===================== */}
        <div className="lg:col-span-4 space-y-2">
          {/* Action Items List */}
          <div className="p-2.5 rounded-xl bg-[#18191e] border border-[#24262e] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between pb-1 border-b border-[#24262e]">
              <span className="text-xs font-bold text-white leading-tight">Action Items</span>
              <span className="text-[10px] font-mono text-slate-400">
                {actionItems.length} pending
              </span>
            </div>

            {/* Filter Pills */}
            <SegmentedTabs
              items={[
                { key: 'ALL', label: 'All', count: actionItems.length },
                { key: 'checkin', label: 'Check-in', count: actionItems.filter(x => x.category === 'checkin').length },
                { key: 'diet', label: 'Diet', count: actionItems.filter(x => x.category === 'diet').length },
                { key: 'training', label: 'Training', count: actionItems.filter(x => x.category === 'training').length },
                { key: 'renewal', label: 'Renewal', count: actionItems.filter(x => x.category === 'renewal').length }
              ]}
              value={upcomingFilter}
              onChange={(key) => setUpcomingFilter(key as any)}
              variant="cyan"
              size="xs"
              noScroll
              className="mt-1"
            />

            {/* Action Items Rows */}
            <div className="h-[180px] overflow-y-auto pr-1 space-y-1 pt-1.5 custom-scrollbar">
              {filteredActionItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate-500">
                  <span className="text-xs font-medium text-slate-400">No pending items</span>
                </div>
              ) : (
                filteredActionItems.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => onSelectClient(item.athlete, item.targetTab)}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 text-white text-[9px] font-bold flex items-center justify-center font-mono flex-shrink-0">
                        {item.athlete.avatarText}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-white group-hover:text-[#2f80ed] transition-colors truncate leading-tight">
                            {item.athlete.name}
                          </p>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0" />
                          <span className="text-[9px] font-mono text-slate-400">{item.categoryLabel}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">{item.task}</p>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-400 border border-white/[0.08] flex-shrink-0">
                      {item.timeBadge}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions: Clean Text-Only Buttons */}
          <div className="p-2.5 rounded-xl bg-[#18191e] border border-[#24262e] shadow-sm">
            <div className="pb-1 border-b border-[#24262e]">
              <span className="text-xs font-bold text-white">Quick Actions</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1.5">
              <button
                onClick={() => onOpenPlanBuilder()}
                className="py-1.5 px-2.5 rounded-lg bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] hover:border-[#2f80ed]/40 text-center transition-all cursor-pointer text-xs font-medium text-zinc-300 hover:text-white"
              >
                Build Plan
              </button>
              <button
                onClick={onNavigateToDiet}
                className="py-1.5 px-2.5 rounded-lg bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] hover:border-[#2f80ed]/40 text-center transition-all cursor-pointer text-xs font-medium text-zinc-300 hover:text-white"
              >
                Diet Plan
              </button>
              <button
                onClick={onOpenNewTraineeModal}
                className="py-1.5 px-2.5 rounded-lg bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] hover:border-[#2f80ed]/40 text-center transition-all cursor-pointer text-xs font-medium text-zinc-300 hover:text-white"
              >
                New Athlete
              </button>
              <button
                onClick={onNavigateToPlans}
                className="py-1.5 px-2.5 rounded-lg bg-[#141519] hover:bg-[#1c1d22] border border-[#24262e] hover:border-[#2f80ed]/40 text-center transition-all cursor-pointer text-xs font-medium text-zinc-300 hover:text-white"
              >
                Workout Plans
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI & Roster Health Detailed Drill-Down Drawer */}
      <KpiDrillDownDrawer
        isOpen={drillDownType !== null}
        onClose={() => setDrillDownType(null)}
        type={drillDownType}
        onSelectClient={onSelectClient}
        onOpenAssignModal={onOpenAssignModal}
        onOpenPlanBuilder={onOpenPlanBuilder}
        onNavigateToDiet={onNavigateToDiet}
      />
    </div>
  );
};
