/**
 * @file ClientActionMenu.jsx
 * @description القائمة العائمة لإجراءات المتدرب السريعة (Quick Actions Menu)
 * تتيح للكوتش: تعديل الخطة، إسناد دايت، التبديل لحساب المتدرب، نسخ الرابط، وتعديل الملف الشخصي.
 */

import React from 'react';
import { useEscapeKey } from '@/hooks/useEscapeKey';

export function ClientActionMenu({
  isOpen,
  coords,
  onClose,
  trainee,
  hasPlan,
  onOpenAssignPlan,
  onOpenAssignDiet,
  onSwitchToTrainee,
  onCopyAthleteLink,
  onEditProfile
}) {
  useEscapeKey(isOpen, onClose);

  if (!isOpen || !coords || !trainee) return null;

  return (
    <>
      {/* خلفية شفافة لالتقاط النقرات بالخارج */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      {/* القائمة العائمة المحددة بإحداثيات الزر */}
      <div 
        style={{
          position: 'fixed',
          top: coords.top !== undefined ? `${coords.top}px` : 'auto',
          bottom: coords.bottom !== undefined ? `${coords.bottom}px` : 'auto',
          right: `${coords.right}px`,
        }}
        className={`min-w-[190px] w-auto whitespace-nowrap rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 text-left ${
          coords.openUpwards ? 'origin-bottom-right' : 'origin-top-right'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenAssignPlan(trainee);
          }}
          className="w-full px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left block"
        >
          {hasPlan ? 'Edit Workout Routine' : 'Build Workout Routine'}
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenAssignDiet(trainee);
          }}
          className="w-full px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left block"
        >
          Assign Diet Plan
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onSwitchToTrainee(trainee.id);
          }}
          className="w-full px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left block"
        >
          Switch to Athlete View
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onCopyAthleteLink(trainee.id, trainee.name);
          }}
          className="w-full px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left block"
        >
          Copy Portal Link
        </button>

        <div className="my-1 border-t border-[var(--card-border)]" />

        <button
          type="button"
          onClick={() => {
            onClose();
            onEditProfile(trainee);
          }}
          className="w-full px-4 py-2 text-xs font-medium text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left block"
        >
          Edit Profile
        </button>
      </div>
    </>
  );
}
