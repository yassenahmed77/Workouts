/**
 * @file ClientMobileRow.jsx
 * @description كارت المتدرب المدمج لشاشات الموبايل القياسية (375px - 767px).
 */

import React from 'react';
import { MessageCircle, MoreVertical } from 'lucide-react';

export function ClientMobileRow({
  trainee,
  assignedPlan,
  assignedDiet,
  workoutProg,
  statusBadge,
  membershipBadge,
  attention,
  onSelectDetails,
  onOpenActionSheet
}) {
  return (
    <div
      onClick={() => onSelectDetails(trainee, 'overview')}
      className="flex items-center justify-between p-2 min-[380px]:p-2.5 rounded-2xl bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border border-[var(--card-border)] hover:border-white/20 transition-all cursor-pointer shadow-sm active:scale-[0.99] gap-2 min-[380px]:gap-2.5"
    >
      {/* الصورة الرمزية */}
      <div className="relative shrink-0">
        {trainee.avatarUrl ? (
          <img
            src={trainee.avatarUrl}
            alt={trainee.name}
            className="w-9 h-9 min-[380px]:w-10 min-[380px]:h-10 rounded-full object-cover border border-[var(--card-border)]"
          />
        ) : (
          <div className="w-9 h-9 min-[380px]:w-10 min-[380px]:h-10 rounded-full bg-[var(--card-subtle-bg)] text-slate-300 border border-[var(--card-border)] font-mono text-xs font-semibold flex items-center justify-center">
            {trainee.avatarText}
          </div>
        )}
      </div>

      {/* اسم المتدرب ومقاييس الحالة */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className="text-xs font-bold text-white truncate leading-tight">
            {trainee.name}
          </h3>
          {attention.dot && (
            <span 
              className={`w-1.5 h-1.5 rounded-full ${attention.dot} shrink-0`} 
              title={`${attention.label}${attention.timeframe ? ` • ${attention.timeframe}` : ''}`}
            />
          )}
          {membershipBadge?.label && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9.5px] font-mono font-medium border leading-none shrink-0 ${
                membershipBadge.pillClass || 'bg-white/[0.06] text-slate-300 border-white/10'
              }`}
            >
              {membershipBadge.label}
            </span>
          )}
        </div>

        {/* سطر الإحصائيات المصغرة */}
        <div className="flex items-center gap-1.5 mt-1 text-[10.5px] text-slate-400 font-mono truncate">
          <span className="text-white font-medium">{trainee.weightKg} kg</span>
          <span className="text-slate-600">&bull;</span>
          <span className="truncate max-w-[85px] text-slate-300">
            {assignedPlan ? assignedPlan.title : 'No Split'}
          </span>
          {assignedPlan && (
            <span className="text-[9.5px] text-[var(--main-color)]">
              ({workoutProg.workoutPct}%)
            </span>
          )}
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300 truncate">
            {assignedDiet?.targetCalories ? `${assignedDiet.targetCalories} kcal` : 'No diet'}
          </span>
        </div>
      </div>

      {/* أزرار الإجراءات السريعة */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const cleanPhone = (trainee.phone || '+201012345678').replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer');
          }}
          className="p-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40 text-emerald-400 transition-colors cursor-pointer"
          title="WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenActionSheet(trainee);
          }}
          className="p-1.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Options"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
