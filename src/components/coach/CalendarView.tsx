'use client';

import React, { useState, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { User, ClientSubscription } from '@/types';
import { clientService } from '@/services/clientService';

interface CalendarViewProps {
  onSelectClient?: (client: User) => void;
  onOpenNewTraineeModal?: () => void;
}

type CalendarFilter = 'all' | 'starts' | 'expirations' | 'checkins';

interface DayEvent {
  id: string;
  type: 'start' | 'expiration' | 'checkin';
  user: User;
  subscription?: ClientSubscription;
  label: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onSelectClient,
  onOpenNewTraineeModal
}) => {
  const { users, currentUser, coachSettings } = useGym();

  // Active viewing month (defaults to September 2026 to match workspace timeline)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 is September (0-indexed)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-24');
  const [activeFilter, setActiveFilter] = useState<CalendarFilter>('all');

  const currency = coachSettings?.currency || 'EGP';
  const trainees = useMemo(() => {
    const coachId = currentUser?.role === 'coach' ? currentUser.id : undefined;
    return clientService.getTrainees(users, coachId);
  }, [users, currentUser]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8);
    setSelectedDateStr('2026-09-24');
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Map trainees into subscription events by date string (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, DayEvent[]>();

    trainees.forEach((trainee) => {
      // 1. Subscription Start Date
      const startDate = trainee.subscription?.startDate || trainee.joinedDate;
      if (startDate) {
        const events = map.get(startDate) || [];
        events.push({
          id: `start-${trainee.id}-${startDate}`,
          type: 'start',
          user: trainee,
          subscription: trainee.subscription,
          label: `${trainee.name} Joined`
        });
        map.set(startDate, events);
      }

      // 2. Subscription End / Expiration Date
      if (trainee.subscription?.endDate) {
        const endDate = trainee.subscription.endDate;
        const events = map.get(endDate) || [];
        events.push({
          id: `exp-${trainee.id}-${endDate}`,
          type: 'expiration',
          user: trainee,
          subscription: trainee.subscription,
          label: `${trainee.name} Expires`
        });
        map.set(endDate, events);
      }
    });

    // 3. Weekly Check-In Days from Coach Settings (e.g. Friday, Sunday)
    const configuredCheckInDays = coachSettings?.checkInDays || ['Friday', 'Sunday'];
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      if (configuredCheckInDays.includes(dayName)) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const events = map.get(dateStr) || [];
        events.push({
          id: `checkin-${dateStr}`,
          type: 'checkin',
          user: trainees[0] || ({} as User),
          label: `Check-Ins Due`
        });
        map.set(dateStr, events);
      }
    }

    return map;
  }, [trainees, coachSettings, currentYear, currentMonth]);

  // Month Statistics / KPI Metrics
  const monthMetrics = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    let newStartsCount = 0;
    let expirationsCount = 0;
    let estimatedRevenue = 0;

    trainees.forEach((trainee) => {
      const sub = trainee.subscription;
      if (sub?.startDate?.startsWith(monthPrefix) || trainee.joinedDate?.startsWith(monthPrefix)) {
        newStartsCount++;
      }
      if (sub?.endDate?.startsWith(monthPrefix)) {
        expirationsCount++;
      }
      if (sub?.price) {
        estimatedRevenue += sub.price;
      }
    });

    return {
      newStartsCount,
      expirationsCount,
      totalActiveTrainees: trainees.filter((t) => t.status === 'active').length,
      estimatedRevenue
    };
  }, [trainees, currentYear, currentMonth]);

  // Generate calendar grid cells (Monday-based)
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const mondayOffset = (firstDayIndex + 6) % 7;
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: DayEvent[];
    }[] = [];

    // Previous month filler days
    for (let i = mondayOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === '2026-09-24',
        events: eventsByDate.get(dateStr) || []
      });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === '2026-09-24',
        events: eventsByDate.get(dateStr) || []
      });
    }

    // Next month filler days (fill up to 35 or 42)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === '2026-09-24',
        events: eventsByDate.get(dateStr) || []
      });
    }

    return cells;
  }, [currentYear, currentMonth, eventsByDate]);

  // Selected Date Events
  const selectedDateEvents = useMemo(() => {
    const rawEvents = eventsByDate.get(selectedDateStr) || [];
    if (activeFilter === 'all') return rawEvents;
    if (activeFilter === 'starts') return rawEvents.filter((e) => e.type === 'start');
    if (activeFilter === 'expirations') return rawEvents.filter((e) => e.type === 'expiration');
    if (activeFilter === 'checkins') return rawEvents.filter((e) => e.type === 'checkin');
    return rawEvents;
  }, [eventsByDate, selectedDateStr, activeFilter]);

  // Selected date formatted title
  const formattedSelectedDate = useMemo(() => {
    try {
      const parts = selectedDateStr.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  const getWhatsAppRenewalLink = (user: User, sub?: ClientSubscription): string => {
    const phone = user.phone ? user.phone.replace(/[^0-9]/g, '') : '';
    const coach = coachSettings?.coachName || 'Coach Yassen';
    const brand = coachSettings?.brandName || 'Iron Forge';
    const plan = sub?.planType || 'VIP Coaching';
    const end = sub?.endDate || selectedDateStr;
    const text = encodeURIComponent(
      `Hi ${user.name}, this is ${coach} from ${brand}. Your ${plan} coaching membership expires on ${end}. Would you like to renew for the upcoming cycle to keep your training progress uninterrupted? Let me know!`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 w-full space-y-2.5 pb-2 font-sans text-slate-100 select-none overflow-hidden">
      
      {/* 1. Ultra-Clean Executive Header */}
      <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2 border-b border-[#141b26]">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
              Subscription &amp; Schedule Calendar
            </h1>
            <span className="px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/10 text-[9.5px] font-mono text-slate-300 font-bold hidden sm:inline">
              Schedule OS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            Monitor client subscription start dates, expiration pipelines, and weekly check-in audits.
          </p>
        </div>

        {/* Action Controls & Month Switcher */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
          {/* Month Switcher Controls */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#05080e] border border-[#16202e]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="px-2.5 py-1 rounded-md text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              Prev
            </button>
            <span className="px-2 text-xs font-bold text-white font-mono min-w-[125px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="px-2.5 py-1 rounded-md text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              Next
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoToToday}
            className="px-3 py-1.5 rounded-lg bg-[#05080e] hover:bg-white/[0.06] border border-[#16202e] text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            Today
          </button>

          {onOpenNewTraineeModal && (
            <button
              type="button"
              onClick={onOpenNewTraineeModal}
              className="py-1.5 px-3.5 rounded-lg bg-white hover:bg-slate-100 active:scale-95 text-[#080c14] text-xs font-bold cursor-pointer shadow-xs transition-all whitespace-nowrap"
            >
              + Add Athlete
            </button>
          )}
        </div>
      </div>

      {/* 2. Top KPI Metric Cards Strip (Pure Obsidian Monochrome) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-shrink-0">
        <div className="p-2.5 rounded-xl bg-[#090e17] border border-[#141b26] flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              New Starts ({monthNames[currentMonth].slice(0, 3)})
            </span>
            <span className="text-base sm:text-lg font-bold text-white font-numeric tracking-tight mt-0.5 block">
              {monthMetrics.newStartsCount} <span className="text-xs text-slate-400 font-normal">Athletes</span>
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-300 border border-white/10 font-bold">
            Joined
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#090e17] border border-[#141b26] flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              Expiring Renewals
            </span>
            <span className="text-base sm:text-lg font-bold text-white font-numeric tracking-tight mt-0.5 block">
              {monthMetrics.expirationsCount} <span className="text-xs text-slate-400 font-normal">Pending</span>
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-300 border border-white/10 font-bold">
            Expiring
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#090e17] border border-[#141b26] flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              Active Roster
            </span>
            <span className="text-base sm:text-lg font-bold text-white font-numeric tracking-tight mt-0.5 block">
              {monthMetrics.totalActiveTrainees} <span className="text-xs text-slate-400 font-normal">Athletes</span>
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-300 border border-white/10 font-bold">
            Active
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#090e17] border border-[#141b26] flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              Active Volume Value
            </span>
            <span className="text-base sm:text-lg font-bold text-white font-numeric tracking-tight mt-0.5 block">
              {monthMetrics.estimatedRevenue.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{currency}</span>
            </span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-300 border border-white/10 font-bold">
            MRR
          </span>
        </div>
      </div>

      {/* 3. Main Workspace: Calendar Grid (Left) + Selected Day Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0 overflow-hidden items-stretch">
        
        {/* Left Column: Calendar Grid (Col span 8) */}
        <div className="lg:col-span-8 flex flex-col min-h-0 rounded-xl bg-[#090e17] border border-[#141b26] overflow-hidden shadow-xs">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 border-b border-[#141b26] bg-[#070a0f] py-2 text-center text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Month Cells Grid */}
          <div className="grid grid-cols-7 flex-1 min-h-0 divide-x divide-y divide-[#141b26] overflow-y-auto custom-scrollbar">
            {calendarCells.map((cell) => {
              const isSelected = cell.dateStr === selectedDateStr;
              const starts = cell.events.filter((e) => e.type === 'start');
              const expirations = cell.events.filter((e) => e.type === 'expiration');
              const checkins = cell.events.filter((e) => e.type === 'checkin');

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[76px] p-1.5 flex flex-col justify-between transition-colors cursor-pointer relative group ${
                    isSelected
                      ? 'bg-white/[0.06] ring-1 ring-inset ring-white/20'
                      : cell.isCurrentMonth
                        ? 'bg-[#090e17] hover:bg-white/[0.02]'
                        : 'bg-[#05080e]/50 opacity-40 hover:bg-[#070a0f]'
                  }`}
                >
                  {/* Cell Header: Day Number + Today Indicator */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${
                      cell.isToday
                        ? 'w-5 h-5 rounded-full bg-white text-[#080c14] flex items-center justify-center font-black shadow-xs'
                        : isSelected
                          ? 'text-white'
                          : cell.isCurrentMonth
                            ? 'text-slate-300 group-hover:text-white'
                            : 'text-slate-600'
                    }`}>
                      {cell.dayNumber}
                    </span>

                    {/* Quick Count Pill if multiple events */}
                    {cell.events.length > 0 && (
                      <span className="text-[9px] font-mono text-slate-400">
                        {cell.events.length}
                      </span>
                    )}
                  </div>

                  {/* Event Badges Strip */}
                  <div className="space-y-1 mt-1">
                    {/* Starts (Joined) */}
                    {starts.slice(0, 2).map((st) => (
                      <div
                        key={st.id}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-white/[0.04] border border-white/10 text-slate-300 truncate"
                        title={`${st.user.name} - ${st.subscription?.planType || 'Subscription'}`}
                      >
                        + {st.user.name.split(' ')[0]}
                      </div>
                    ))}

                    {/* Expirations */}
                    {expirations.slice(0, 2).map((exp) => (
                      <div
                        key={exp.id}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white/[0.08] border border-white/20 text-white truncate"
                        title={`Renewal Due: ${exp.user.name}`}
                      >
                        ! {exp.user.name.split(' ')[0]} (Exp)
                      </div>
                    ))}

                    {/* Check-ins tag */}
                    {checkins.length > 0 && starts.length === 0 && expirations.length === 0 && (
                      <div className="px-1 py-0.5 rounded text-[8px] font-mono bg-white/[0.02] border border-white/[0.06] text-slate-400 truncate text-center">
                        Audits Due
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Day Inspector Drawer (Col span 4) */}
        <div className="lg:col-span-4 flex flex-col min-h-0 rounded-xl bg-[#090e17] border border-[#141b26] overflow-hidden shadow-xs">
          {/* Day Inspector Header */}
          <div className="px-3.5 py-2 bg-[#070a0f] border-b border-[#141b26] flex items-center justify-between flex-shrink-0">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Day Inspector
              </span>
              <h3 className="text-xs font-bold text-white tracking-tight leading-tight mt-0.5">
                {formattedSelectedDate}
              </h3>
            </div>

            <span className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/10 text-[10px] font-mono font-bold">
              {selectedDateEvents.length} Events
            </span>
          </div>

          {/* Filter Pills */}
          <div className="p-2 border-b border-[#141b26] bg-[#090e17] flex-shrink-0">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#05080e] border border-[#16202e]">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('starts')}
                className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                  activeFilter === 'starts'
                    ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                Joined
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('expirations')}
                className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                  activeFilter === 'expirations'
                    ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                Expiring
              </button>
            </div>
          </div>

          {/* Events List Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
            {selectedDateEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <span className="text-xs font-mono text-slate-400 font-medium">
                  No subscription events scheduled
                </span>
                <p className="text-[11px] text-slate-500 max-w-[220px]">
                  No athlete registrations or membership expirations on this calendar date.
                </p>
                {onOpenNewTraineeModal && (
                  <button
                    type="button"
                    onClick={onOpenNewTraineeModal}
                    className="mt-2 px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 border border-white/10 transition-all cursor-pointer"
                  >
                    Register Trainee Today
                  </button>
                )}
              </div>
            ) : (
              selectedDateEvents.map((evt) => {
                const isExpiration = evt.type === 'expiration';
                const isStart = evt.type === 'start';
                const sub = evt.subscription;

                if (evt.type === 'checkin') {
                  return (
                    <div
                      key={evt.id}
                      className="p-3 rounded-xl bg-[#05080e] border border-[#16202e] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                          Operational Milestone
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">Weekly Audit</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">
                        Standard Athlete Check-In Day
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Athletes scheduled for regular photo &amp; measurement check-in uploads today.
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-[#05080e] border border-[#16202e] hover:border-[#1e293b] transition-all space-y-2.5"
                  >
                    {/* Athlete Info Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {evt.user.avatarUrl ? (
                          <img
                            src={evt.user.avatarUrl}
                            alt={evt.user.name}
                            className="w-8 h-8 rounded-lg object-cover border border-white/10 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-slate-300 flex items-center justify-center flex-shrink-0">
                            {evt.user.avatarText || 'TR'}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 
                            onClick={() => onSelectClient && onSelectClient(evt.user)}
                            className="text-xs font-bold text-white hover:text-slate-200 transition-colors cursor-pointer truncate"
                          >
                            {evt.user.name}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 truncate block">
                            {sub?.planType || evt.user.goal}
                          </span>
                        </div>
                      </div>

                      {/* Event Type Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex-shrink-0 ${
                        isExpiration
                          ? 'bg-white/[0.1] border-white/20 text-white'
                          : 'bg-white/[0.04] border-white/10 text-slate-300'
                      }`}>
                        {isExpiration ? 'Expiring' : 'New Join'}
                      </span>
                    </div>

                    {/* Subscription Details Strip */}
                    <div className="p-2 rounded-lg bg-[#090e17] border border-[#141b26] flex items-center justify-between text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-semibold">Duration</span>
                        <span className="text-white font-bold font-numeric">{sub?.durationMonths || 1} Months</span>
                      </div>
                      <div className="text-center">
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-semibold">Period</span>
                        <span className="text-slate-300 font-numeric">
                          {sub?.startDate?.slice(5)} &rarr; {sub?.endDate?.slice(5)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-semibold">Fee</span>
                        <span className="text-white font-bold font-numeric">
                          {sub?.price ? `${sub.price} ${sub.currency || currency}` : 'Standard'}
                        </span>
                      </div>
                    </div>

                    {/* Expiration Direct Action: WhatsApp Renewal Reminder */}
                    {isExpiration && evt.user.phone && (
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Renewal Due
                        </span>
                        <a
                          href={getWhatsAppRenewalLink(evt.user, sub)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#080c14] text-xs font-bold transition-all cursor-pointer active:scale-95 text-center shadow-xs"
                        >
                          Send WhatsApp Reminder
                        </a>
                      </div>
                    )}

                    {/* View Profile Action */}
                    {onSelectClient && (
                      <button
                        type="button"
                        onClick={() => onSelectClient(evt.user)}
                        className="w-full py-1 text-center text-xs text-slate-400 hover:text-white transition-colors cursor-pointer block border-t border-[#141b26] pt-1.5 font-medium"
                      >
                        View Athlete Profile &bull; 360
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
