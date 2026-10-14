/**
 * @file ClientMobileAccordion.jsx
 * @description كارت المتدرب القابل للطي والتوسيع لشاشات الهواتف الصغيرة جداً (< 375px).
 */

import React from 'react';
import { ChevronDown, MessageCircle, MoreVertical } from 'lucide-react';

export function ClientMobileAccordion({
  trainee,
  isExpanded,
  onToggleExpand,
  assignedPlan,
  assignedDiet,
  workoutProg,
  statusBadge,
  attention,
  onSelectDetails,
  onOpenActionSheet
}) {
  return (
    <div
      data-expanded-client={isExpanded ? 'true' : undefined}
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isExpanded
          ? 'bg-[var(--card-bg)] border-[var(--main-color)]/50 shadow-md'
          : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-white/20'
      }`}
    >
      {/* رأس الكارت المضغوط */}
      <div
        data-accordion-header="true"
        onClick={onToggleExpand}
        className="flex items-center justify-between px-2.5 py-1.5 cursor-pointer gap-2"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="relative shrink-0">
            {trainee.avatarUrl ? (
              <img
                src={trainee.avatarUrl}
                alt={trainee.name}
                className="w-8 h-8 rounded-full object-cover border border-[var(--card-border)]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--card-subtle-bg)] text-slate-300 border border-[var(--card-border)] font-mono text-[11px] font-semibold flex items-center justify-center">
                {trainee.avatarText}
              </div>
            )}
            <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-[var(--card-bg)] ${statusBadge.dot}`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[11.5px] font-bold text-white truncate leading-tight">
                {trainee.name}
              </h3>
              {attention.dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${attention.dot} shrink-0`} />
              )}
            </div>
            <p className="text-[9.5px] text-slate-400 font-mono mt-0.5 truncate leading-none">
              {trainee.weightKg} kg
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const cleanPhone = (trainee.phone || '+201012345678').replace(/[^0-9]/g, '');
              window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer');
            }}
            className="p-1 rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 cursor-pointer"
            title="WhatsApp"
          >
            <MessageCircle className="w-3 h-3" />
          </button>
          <div className={`p-0.5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[var(--main-color)]' : ''}`}>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* الجسم الممتد عند النقر */}
      {isExpanded && (
        <div className="px-2.5 pb-2.5 pt-1 border-t border-[var(--card-border)] bg-[var(--card-subtle-bg)]/60 space-y-2 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div 
              onClick={() => onSelectDetails(trainee, 'workout')}
              className="p-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] cursor-pointer hover:border-white/20 transition-colors"
            >
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mb-0.5">
                <span>Workout Split</span>
                <span className="text-[var(--main-color)]">{workoutProg.workoutPct}%</span>
              </div>
              <p className="font-semibold text-white text-[10.5px] truncate">
                {assignedPlan ? assignedPlan.title : 'Build Routine'}
              </p>
              <div className="w-full h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--main-color)]"
                  style={{ width: `${workoutProg.workoutPct}%` }}
                />
              </div>
            </div>

            <div 
              onClick={() => onSelectDetails(trainee, 'nutrition')}
              className="p-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] cursor-pointer hover:border-white/20 transition-colors"
            >
              <div className="text-[9px] text-slate-400 font-mono mb-0.5">
                <span>Diet Calories</span>
              </div>
              <p className="font-semibold text-white text-[10.5px] truncate">
                {assignedDiet?.targetCalories ? `${assignedDiet.targetCalories.toLocaleString()} kcal/d` : 'Assign Diet'}
              </p>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">
                {assignedDiet ? assignedDiet.title : 'No diet assigned'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => onSelectDetails(trainee, 'overview')}
              className="gym-btn-primary flex-1 py-1 text-[11px] text-center justify-center font-medium rounded-lg"
            >
              Full Profile
            </button>
            <button
              type="button"
              onClick={() => onOpenActionSheet(trainee)}
              className="p-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white cursor-pointer"
              title="More Options"
            >
              <MoreVertical className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
