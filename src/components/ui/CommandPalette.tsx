'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGym } from '@/context/GymContext';
import { User } from '@/types';
import { Search, User as UserIcon, Dumbbell, Utensils, Calendar, Settings, X, Plus } from 'lucide-react';
import { clientService } from '@/services/clientService';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient: (user: User) => void;
  onNavigateTab: (tab: string) => void;
  onOpenNewTraineeModal: () => void;
}

/**
 * CommandPalette (Pillar 7 - Power-User Navigation)
 * 
 * Instant spotlight search triggered by `Cmd + K` (Mac) or `Ctrl + K` (Windows) or `/`.
 * Enables coaches to jump to any athlete profile or platform tool in milliseconds.
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectClient,
  onNavigateTab,
  onOpenNewTraineeModal
}) => {
  const { users, currentUser } = useGym();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Athletes list scoped to coach
  const athletes = useMemo(() => {
    const coachId = currentUser?.role === 'coach' ? currentUser.id : undefined;
    return clientService.getTrainees(users, coachId);
  }, [users, currentUser]);

  // Quick Action items
  const quickActions = useMemo(() => [
    { id: 'act-new-athlete', label: 'Register New Athlete', category: 'Action', icon: Plus, handler: onOpenNewTraineeModal },
    { id: 'act-splits', label: 'Splits Studio & Routines', category: 'Navigation', icon: Dumbbell, handler: () => onNavigateTab('splits-studio') },
    { id: 'act-diet', label: 'Nutrition & Diet Plans', category: 'Navigation', icon: Utensils, handler: () => onNavigateTab('diet') },
    { id: 'act-calendar', label: 'Schedule & Calendar', category: 'Navigation', icon: Calendar, handler: () => onNavigateTab('calendar') },
    { id: 'act-settings', label: 'Coach Business Settings', category: 'Navigation', icon: Settings, handler: () => onNavigateTab('settings') },
  ], [onOpenNewTraineeModal, onNavigateTab]);

  // Filtered results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        ...quickActions.map(a => ({ type: 'action' as const, item: a })),
        ...athletes.slice(0, 5).map(u => ({ type: 'athlete' as const, item: u }))
      ];
    }

    const matchedAthletes = athletes
      .filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.goal && u.goal.toLowerCase().includes(q))
      )
      .map(u => ({ type: 'athlete' as const, item: u }));

    const matchedActions = quickActions
      .filter(a => a.label.toLowerCase().includes(q))
      .map(a => ({ type: 'action' as const, item: a }));

    return [...matchedAthletes, ...matchedActions];
  }, [query, athletes, quickActions]);

  // Keyboard navigation (Arrow keys + Enter + Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredResults.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredResults[selectedIndex];
        if (selected) {
          if (selected.type === 'athlete') {
            onSelectClient(selected.item);
          } else {
            selected.item.handler();
          }
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredResults, onClose, onSelectClient]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center pt-16 sm:pt-24 p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl bg-[#090d14] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-[#0b101b]">
          <Search className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search athletes, routines, diet, settings..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No athletes or actions match &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredResults.map((result, idx) => {
              const isSelected = idx === selectedIndex;

              if (result.type === 'athlete') {
                const athlete = result.item;
                return (
                  <div
                    key={`athlete-${athlete.id}`}
                    onClick={() => {
                      onSelectClient(athlete);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border border-cyan-500/35 text-white'
                        : 'hover:bg-white/[0.04] text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center font-bold text-xs text-white font-mono flex-shrink-0">
                        {clientService.getInitials(athlete.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate">
                            {athlete.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {athlete.weightKg}kg
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {athlete.goal || athlete.email}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                      Athlete 360
                    </span>
                  </div>
                );
              }

              // Action Item
              const action = result.item;
              const ActionIcon = action.icon;
              return (
                <div
                  key={action.id}
                  onClick={() => {
                    action.handler();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-500/35 text-white'
                      : 'hover:bg-white/[0.04] text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-300">
                      <ActionIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-white">
                      {action.label}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                    {action.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#05080e] border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>&uarr;&darr; to navigate</span>
            <span>&crarr; to select</span>
          </div>
          <span>Workouts Pro Spotlight</span>
        </div>
      </div>
    </div>
  );
};
