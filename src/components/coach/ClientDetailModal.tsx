'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { User, WorkoutPlan } from '@/types';
import { sanitizeNotes } from '@/lib/sanitizer';
import { 
  X, 
  User as UserIcon, 
  Activity, 
  History, 
  Dumbbell, 
  Calendar, 
  Edit3, 
  Check, 
  Clock, 
  ArrowRight
} from 'lucide-react';

interface ClientDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAssignPlan: (user: User) => void;
  onOpenPlanBuilderForUser: (userId: string) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onOpenAssignPlan,
  onOpenPlanBuilderForUser
}) => {
  const { plans, logs, updateUserNotes } = useGym();
  const { showToast } = useToast();
  const [notes, setNotes] = useState(user?.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    if (user) {
      setNotes(user.notes || '');
    }
  }, [user]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const assignedPlan = plans.find((p) => p.id === user.assignedPlanId);
  const traineeLogs = logs.filter((l) => l.userId === user.id);
  const totalVolume = traineeLogs.reduce((acc, l) => acc + l.totalVolumeKg, 0);

  const handleSaveNotes = () => {
    updateUserNotes(user.id, sanitizeNotes(notes));
    setIsSaved(true);
    showToast('Coach notes saved', 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-3xl bg-[#18191e] border border-[#24262e] rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-white p-1.5 rounded-xl hover:bg-[#141519] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Athlete Header */}
        <div className="flex items-center gap-4 pb-5 border-b border-[#24262e]">
          <div className="w-12 h-12 rounded-2xl bg-[#141519] border border-[#24262e] flex items-center justify-center text-base font-bold text-[#2f80ed]">
            {user.avatarText}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                {user.name}
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#141519] text-zinc-300 border border-[#24262e]">
                {user.goal}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {/* Biometrics Strip */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#141519] border border-[#24262e]">
              <span className="block text-[9px] font-mono uppercase text-zinc-500">Weight</span>
              <span className="text-sm font-bold font-numeric text-white">{user.weightKg} kg</span>
            </div>
            <div className="p-3 rounded-xl bg-[#141519] border border-[#24262e]">
              <span className="block text-[9px] font-mono uppercase text-zinc-500">Target</span>
              <span className="text-sm font-bold font-numeric text-zinc-200">{user.targetWeightKg} kg</span>
            </div>
            <div className="p-3 rounded-xl bg-[#141519] border border-[#24262e]">
              <span className="block text-[9px] font-mono uppercase text-zinc-500">Height</span>
              <span className="text-sm font-bold font-numeric text-white">{user.heightCm} cm</span>
            </div>
            <div className="p-3 rounded-xl bg-[#141519] border border-[#24262e]">
              <span className="block text-[9px] font-mono uppercase text-zinc-500">Workouts</span>
              <span className="text-sm font-bold font-numeric text-zinc-200">{traineeLogs.length}</span>
            </div>
          </div>

          {/* Assigned Protocol Box */}
          <div className="p-4 rounded-xl bg-[#141519] border border-[#24262e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Assigned Workout Plan
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenAssignPlan(user);
                }}
                className="text-xs font-bold text-[#2f80ed] hover:text-[#3897f0] transition-colors"
              >
                {assignedPlan ? 'Edit Routine' : '+ Build Custom Routine'}
              </button>
            </div>

            {assignedPlan ? (
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {assignedPlan.title}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">{assignedPlan.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 font-numeric">
                  <span>{assignedPlan.daysPerWeek} Days / Week</span>
                  <span>•</span>
                  <span>{assignedPlan.durationWeeks} Weeks</span>
                  <span>•</span>
                  <span className="uppercase">{assignedPlan.level}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-400 font-medium">No custom workout routine built yet</p>
            )}
          </div>

          {/* Trainee Workout History */}
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2 font-semibold">
              Recent Session Logs ({traineeLogs.length})
            </span>

            {traineeLogs.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-4 rounded-xl bg-[#141519] border border-[#24262e] text-center">
                Athlete has not logged any workouts yet.
              </p>
            ) : (
              <div className="space-y-2">
                {traineeLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#141519] border border-[#24262e] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">
                        {log.dayName}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {log.date} • {Math.round(log.durationSeconds / 60)} mins
                      </span>
                    </div>
                    <span className="font-numeric font-bold text-white">
                      {log.totalVolumeKg.toLocaleString()} kg
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coach Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Coach Technique Notes & Directives
              </span>
              {isSaved && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter technique focus, injury modifications, or progression targets..."
              className="w-full p-3 rounded-xl bg-[#141519] border border-[#24262e] text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#2f80ed]"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleSaveNotes}
                className="btn-cyan px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
