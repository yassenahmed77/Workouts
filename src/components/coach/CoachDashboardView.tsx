'use client';

import React, { useState, useMemo } from 'react';
import { User } from '@/types';
import { useGym } from '@/context/GymContext';
import { CoachAlert } from '@/lib/alertsEngine';
import { clientService } from '@/services/clientService';
import { KpiDrillDownDrawer, DrillDownType } from './dashboard/KpiDrillDownDrawer';
import { SearchInput, KpiCard, ProgressRing, SegmentedTabs, AvatarGroup } from '@/components/ui';
import { PanelLeft, Search, Bell, Plus, X } from 'lucide-react';

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
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
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
  alerts,
  isSidebarOpen = true,
  onToggleSidebar
}) => {
  const { users, currentUser } = useGym();

  const trainees = useMemo(() => {
    const coachId = currentUser?.role === 'coach' ? currentUser.id : undefined;
    return clientService.getTrainees(users, coachId);
  }, [users, currentUser]);

  // Global search & hover state
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(7);
  const [drillDownType, setDrillDownType] = useState<DrillDownType | null>(null);
  const [upcomingFilter, setUpcomingFilter] = useState<'ALL' | 'checkin' | 'diet' | 'training' | 'renewal'>('ALL');
  const [isMobileActionExpanded, setIsMobileActionExpanded] = useState(false);

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
      dotColor: 'bg-[var(--main-color)]',
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

  const displayedMobileActionItems = useMemo(() => {
    if (isMobileActionExpanded) {
      return filteredActionItems;
    }
    return filteredActionItems.slice(0, 4);
  }, [filteredActionItems, isMobileActionExpanded]);

  const rosterMetrics = useMemo(() => [
    { title: 'Training', pct: 78, color: 'var(--main-color)', text: '11/13 active', drillDown: 'roster_training' as DrillDownType },
    { title: 'Nutrition', pct: 81, color: 'var(--main-color-hover)', text: '9/13 on target', drillDown: 'roster_nutrition' as DrillDownType },
    { title: 'Check-ins', pct: 69, color: 'var(--main-color)', text: '9/13 reviewed', drillDown: 'roster_checkins' as DrillDownType },
    { title: 'Engagement', pct: 84, color: 'var(--main-color-hover)', text: '11/13 active', drillDown: 'roster_engagement' as DrillDownType },
    { title: 'Progress', pct: 77, color: 'var(--main-color)', text: '10/13 advancing', drillDown: 'roster_progress' as DrillDownType }
  ], []);

  const coachFirstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Yassen';

  return (
    <div className="space-y-2.5 w-full max-w-none select-none font-sans text-slate-100 pb-3 sm:pb-4">
      {/* 1. Header & Actions Strip */}
      {/* Desktop & Tablet Header (>= 768px): Zero Fluff, Clean Typography */}
      <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors flex items-center justify-center cursor-pointer shrink-0 min-[1025px]:hidden"
              title={isSidebarOpen ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
              aria-label="Toggle Navigation Sidebar"
            >
              <PanelLeft className="w-4 h-4 text-slate-300" />
            </button>
          )}
          <h1 className="gym-heading-page">
            {coachFirstName}&apos;s Workspace
          </h1>
          <span className="gym-label-mono text-slate-500 hidden sm:inline-block max-lg:hidden">
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
            className="w-40 sm:w-44 lg:w-56"
          />

          {/* Alerts Pill */}
          <button
            onClick={onOpenAlerts}
            className="gym-btn-secondary gym-btn-sm"
          >
            <span>Alerts</span>
            <span className="gym-delta-neg text-[9.5px] px-1 py-0">
              {alerts.length || 3}
            </span>
          </button>

          {/* Primary Action Button: Text Only */}
          <button
            onClick={() => onOpenNewTraineeModal()}
            className="gym-btn-primary gym-btn-sm"
          >
            + Athlete
          </button>
        </div>
      </div>

      {/* Mobile-Only Header (< 768px) */}
      <div className="md:hidden space-y-2 pb-2 border-b border-white/[0.07]">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Sidebar Toggle + Alerts Button */}
          <div className="flex items-center gap-2 shrink-0">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 h-[34px] w-[34px] rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.08] transition-colors flex items-center justify-center cursor-pointer shrink-0"
                aria-label="Toggle Navigation Sidebar"
              >
                <PanelLeft className="w-4 h-4 text-slate-300" />
              </button>
            )}

            {/* Alerts Button with word 'Alerts' and circular numeric badge */}
            <button
              onClick={onOpenAlerts}
              className="gym-btn-secondary h-[34px] text-xs px-2.5 py-1 flex items-center gap-1.5 rounded-lg cursor-pointer shrink-0"
            >
              <span>Alerts</span>
              <span className="min-w-[17px] h-[17px] px-1 bg-rose-500 text-white text-[9.5px] font-bold rounded-full flex items-center justify-center">
                {alerts.length || 3}
              </span>
            </button>
          </div>

          {/* Right: Search Icon + '+ Athlete' Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search Icon Button */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className={`p-2 h-[34px] w-[34px] rounded-lg border transition-colors flex items-center justify-center cursor-pointer ${
                isMobileSearchOpen || globalSearch
                  ? 'text-white bg-white/[0.1] border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border-white/[0.08]'
              }`}
              aria-label="Search clients"
              title="Search clients"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* + Athlete Button */}
            <button
              onClick={() => onOpenNewTraineeModal()}
              className="gym-btn-primary text-xs px-2.5 py-1.5 h-[34px] font-semibold flex items-center gap-1 rounded-lg shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Athlete</span>
            </button>
          </div>
        </div>

        {/* Expandable Mobile Search Row */}
        {isMobileSearchOpen && (
          <div className="relative pt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search clients..."
                autoFocus
                className="w-full bg-[var(--card-subtle-bg)] border border-white/[0.12] rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[var(--main-color)] transition-colors"
              />
              {globalSearch ? (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-2.5 p-0.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="absolute right-2.5 p-0.5 text-slate-500 hover:text-slate-300 text-[10px] uppercase font-mono cursor-pointer"
                >
                  Esc
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Metric Tiles: Desktop & Tablet (>= 768px) */}
      <div className="hidden md:grid md:grid-cols-3 gap-2">
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

      {/* Mobile-Only 2-in-1 KPI Card (< 768px) */}
      <div className="md:hidden gym-card p-3">
        <div className="grid grid-cols-2 divide-x divide-white/[0.08]">
          {/* Half 1: Active Clients (Centered number + label, zero clutter) */}
          <div
            onClick={() => setDrillDownType('active_clients')}
            className="relative pr-3 py-1 flex flex-col items-center justify-center text-center cursor-pointer active:scale-[0.98] transition-transform min-h-[96px]"
          >
            {/* Subtle badge tucked in top right of Active Clients */}
            <span className="absolute top-0.5 right-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 pointer-events-none">
              +2 new
            </span>

            <span className="text-3xl font-black tracking-tight text-white font-mono leading-none">
              13
            </span>
            <p className="text-xs font-semibold text-slate-200 mt-2">
              Active Clients
            </p>
          </div>

          {/* Half 2: Capacity (Centered circle progress meter + '13 / 20' below) */}
          <div
            onClick={() => setDrillDownType('roster_engagement')}
            className="pl-3 py-1 flex flex-col items-center justify-center text-center cursor-pointer active:scale-[0.98] transition-transform min-h-[96px]"
          >
            {/* Circular progress meter */}
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--card-border)"
                  strokeWidth="3.6"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--main-color)"
                  strokeWidth="3.6"
                  strokeDasharray="65, 100"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10.5px] font-bold font-mono text-white">
                65%
              </span>
            </div>

            <div className="mt-1.5 text-center">
              <p className="text-xs font-semibold text-slate-200 leading-tight">
                Capacity
              </p>
              <p className="text-[11px] font-mono text-slate-400 leading-tight mt-0.5">
                13 / 20
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Left 7-8 cols & Right 4-5 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* ===================== LEFT COLUMN (7 cols on lg, 8 on 2xl) ===================== */}
        <div className="lg:col-span-7 2xl:col-span-8 space-y-2">
          {/* Card 1: Roster Health (Zero Subtitle Fluff) */}
          <div className="gym-card">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <span className="gym-heading-card">Roster Health</span>
              <span className="gym-label-mono text-slate-400">This Week</span>
            </div>

            {/* 5 Progress Rings: Desktop & Tablet (>= 768px) */}
            <div className="hidden md:grid md:grid-cols-5 gap-1.5 pt-2 text-center">
              {rosterMetrics.map((g) => (
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

            {/* Mobile-Only Sleek Linear Health Bars (< 768px) */}
            <div className="md:hidden space-y-2.5 pt-2.5">
              {rosterMetrics.map((g) => (
                <div
                  key={g.title}
                  onClick={() => setDrillDownType(g.drillDown)}
                  className="cursor-pointer active:scale-[0.99] transition-transform select-none"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">
                      {g.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        {g.text}
                      </span>
                      <span className="font-mono font-bold text-white text-xs min-w-[32px] text-right">
                        {g.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--card-subtle-bg)] rounded-full overflow-hidden border border-white/[0.04]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${g.pct}%`,
                        backgroundColor: g.color || 'var(--main-color)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dual Split: Progress Overview + Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Progress Overview (Clean Monochromatic Chart) */}
            <div className="gym-card flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                <span className="gym-heading-card">Progress Overview</span>
                <span className="gym-label-mono text-slate-400">Last 8 weeks</span>
              </div>

              {/* Legend: Text Only */}
              <div className="flex items-center gap-3 text-[10px] font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--main-color)]" />
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
              <div className="w-full h-36 relative mt-1 select-none">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 420 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="blueLineArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--main-color)" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="var(--main-color)" stopOpacity="0.0" />
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
                      <line x1="28" y1={g.y} x2="415" y2={g.y} stroke="var(--card-border)" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="22" y={g.y + 3} fill="#475569" fontSize="8" textAnchor="end" fontFamily="monospace">
                        {g.val}
                      </text>
                    </g>
                  ))}

                  <path
                    d="M 35 50 C 80 48, 130 54, 180 49 C 230 45, 280 52, 330 48 C 370 46, 395 53, 410 53 L 410 90 L 35 90 Z"
                    fill="url(#blueLineArea)"
                  />
                  <path
                    d="M 35 50 C 80 48, 130 54, 180 49 C 230 45, 280 52, 330 48 C 370 46, 395 53, 410 53"
                    fill="none"
                    stroke="var(--main-color)"
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
                  <div className="absolute top-0 right-1 bg-[var(--card-bg)] border border-[var(--card-border)] px-2 py-0.5 rounded text-left font-mono">
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
            <div className="gym-card flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                <span className="gym-heading-card">Recent Activity</span>
                <button
                  onClick={onNavigateToClients}
                  className="gym-label-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-1.5 pt-2 flex-1 flex flex-col justify-around">
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
                        <span className="font-semibold text-white group-hover:text-[var(--main-color)] transition-colors">
                          {act.athlete.name}
                        </span>{' '}
                        <span className="text-slate-400">{act.action}</span>
                      </p>
                    </div>
                    <span className="gym-label-mono text-slate-500 flex-shrink-0">
                      {act.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Roster Snapshot Strip (Desktop only inside Left Column) */}
          <div className="hidden lg:flex gym-card items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="gym-heading-card whitespace-nowrap">
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

        {/* ===================== RIGHT COLUMN (5 cols on lg, 4 on 2xl) ===================== */}
        <div className="lg:col-span-5 2xl:col-span-4 space-y-2">
          {/* Action Items: Desktop & Tablet (>= 768px) */}
          <div className="hidden md:flex gym-card flex-col justify-between">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <span className="gym-heading-card">Action Items</span>
              <span className="gym-label-mono text-slate-400">
                {actionItems.length} pending
              </span>
            </div>

            {/* Filter Pills - Horizontal smooth scroll, zero collision */}
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
              variant="blue"
              size="xs"
              className="mt-1"
            />

            {/* Action Items Rows */}
            <div className="h-[240px] overflow-y-auto pr-1 space-y-1.5 pt-1.5 custom-scrollbar">
              {filteredActionItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate-500">
                  <span className="gym-subtext">No pending items</span>
                </div>
              ) : (
                filteredActionItems.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => onSelectClient(item.athlete, item.targetTab)}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--card-subtle-bg)] hover:bg-[var(--card-border)] border border-white/[0.06] transition-colors cursor-pointer group gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 text-white text-[9px] font-bold flex items-center justify-center font-mono flex-shrink-0">
                        {item.athlete.avatarText}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-xs font-semibold text-white group-hover:text-[var(--main-color)] transition-colors truncate leading-tight">
                            {item.athlete.name}
                          </p>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor} flex-shrink-0`} />
                          <span className="gym-label-mono text-slate-400 text-[8.5px] uppercase flex-shrink-0 whitespace-nowrap">
                            {item.categoryLabel}
                          </span>
                        </div>
                        <p className="text-[10px] max-lg:text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                          {item.task}
                        </p>
                      </div>
                    </div>

                    <span className="gym-delta-neutral text-[9px] px-1.5 py-0.5 flex-shrink-0 whitespace-nowrap self-center">
                      {item.timeBadge}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Items: Mobile-Only Dedicated Design (< 768px) */}
          <div className="md:hidden gym-card flex flex-col justify-between">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <span className="gym-heading-card">Action Items</span>
              <span className="gym-label-mono text-slate-400">
                {filteredActionItems.length} pending
              </span>
            </div>

            {/* Filter Pills: Horizontal Smooth Scroll, Zero Squish */}
            <div className="overflow-x-auto no-scrollbar py-1">
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
                variant="blue"
                size="xs"
                className="min-w-max"
              />
            </div>

            {/* Mobile Action Rows: Zero-Scroll-Trap Clean Cards */}
            <div className="space-y-1.5 pt-1">
              {displayedMobileActionItems.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center text-center text-slate-500">
                  <span className="gym-subtext">No pending items in this category</span>
                </div>
              ) : (
                displayedMobileActionItems.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => onSelectClient(item.athlete, item.targetTab)}
                    className={`p-2.5 rounded-lg bg-[var(--card-subtle-bg)] hover:bg-[var(--card-border)] border border-white/[0.06] border-l-[3px] transition-all cursor-pointer active:scale-[0.98] ${
                      item.category === 'checkin'
                        ? 'border-l-rose-500'
                        : item.category === 'diet'
                        ? 'border-l-amber-500'
                        : item.category === 'training'
                        ? 'border-l-[var(--main-color)]'
                        : 'border-l-emerald-500'
                    }`}
                  >
                    {/* Line 1: Avatar + Name (Left) & Time Badge (Right) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5.5 h-5.5 rounded-md bg-white/[0.08] border border-white/10 text-white text-[9px] font-bold flex items-center justify-center font-mono shrink-0">
                          {item.athlete.avatarText}
                        </div>
                        <p className="text-xs font-semibold text-white truncate">
                          {item.athlete.name}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/[0.08] shrink-0">
                        {item.timeBadge}
                      </span>
                    </div>

                    {/* Line 2: Category Pill + Task Description */}
                    <div className="flex items-center gap-2 mt-1.5 pl-0.5">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0 ${
                          item.category === 'checkin'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                            : item.category === 'diet'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                            : item.category === 'training'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${item.dotColor}`} />
                        {item.categoryLabel}
                      </span>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.task}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Expand / Collapse Button for Top 4 tasks */}
            {filteredActionItems.length > 4 && (
              <button
                onClick={() => setIsMobileActionExpanded(!isMobileActionExpanded)}
                className="w-full py-2 mt-2 text-center text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] active:bg-white/[0.1] rounded-lg border border-white/[0.07] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isMobileActionExpanded ? (
                  <>
                    <span>Show Less</span>
                    <span className="text-[10px] text-slate-400">↑</span>
                  </>
                ) : (
                  <>
                    <span>View All {filteredActionItems.length} Tasks</span>
                    <span className="text-[10px] font-mono text-[var(--main-color)]">
                      (+{filteredActionItems.length - 4} more) ↓
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Quick Actions: Ultra-Compact Slim Header (2 cols on Desktop, 4 cols on Tablet) */}
          <div className="gym-card py-2 px-2.5 sm:px-3">
            <div className="pb-0.5 border-b border-white/[0.06] flex items-center justify-between">
              <span className="gym-heading-card text-[10.5px]">Quick Actions</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-1.5 pt-1.5">
              <button
                onClick={() => onOpenPlanBuilder()}
                className="gym-btn-secondary text-[11px] sm:text-xs h-8 sm:h-7.5 justify-center font-medium"
              >
                Build Plan
              </button>
              <button
                onClick={onNavigateToDiet}
                className="gym-btn-secondary text-[11px] sm:text-xs h-8 sm:h-7.5 justify-center font-medium"
              >
                Diet Plan
              </button>
              <button
                onClick={onOpenNewTraineeModal}
                className="gym-btn-secondary text-[11px] sm:text-xs h-8 sm:h-7.5 justify-center font-medium"
              >
                New Athlete
              </button>
              <button
                onClick={onNavigateToPlans}
                className="gym-btn-secondary text-[11px] sm:text-xs h-8 sm:h-7.5 justify-center font-medium"
              >
                Workout Plans
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Client Roster Snapshot Strip (Tablet & Mobile only at the very bottom!) */}
      <div className="flex lg:hidden gym-card items-center justify-between gap-2 sm:gap-3 py-2 px-2.5 sm:px-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="gym-heading-card whitespace-nowrap text-xs sm:text-sm">
            Roster
          </span>
          <AvatarGroup
            athletes={rosterSnapshotAthletes}
            max={5}
            size="sm"
            onSelect={(a) => onSelectClient(a, 'overview')}
            className="sm:hidden"
          />
          <AvatarGroup
            athletes={rosterSnapshotAthletes}
            max={8}
            size="sm"
            onSelect={(a) => onSelectClient(a, 'overview')}
            className="hidden sm:flex"
          />
        </div>

        <button
          onClick={onNavigateToClients}
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          All Clients &rarr;
        </button>
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
