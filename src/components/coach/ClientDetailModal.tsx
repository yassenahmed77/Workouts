'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { User, WorkoutPlan } from '@/types';
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

  if (!isOpen || !user) return null;

  const assignedPlan = plans.find((p) => p.id === user.assignedPlanId);
  const traineeLogs = logs.filter((l) => l.userId === user.id);
  const totalVolume = traineeLogs.reduce((acc, l) => acc + l.totalVolumeKg, 0);

  const handleSaveNotes = () => {
    updateUserNotes(user.id, notes);
    setIsSaved(true);
    showToast('Coach notes saved', 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-[#141418] border border-zinc-700 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-300 p-1.5 rounded-xl hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Athlete Header */}
        <div className="flex items-center gap-4 pb-5 border-b border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-base font-bold text-white">
            {user.avatarText}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                {user.name}
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
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
            <div className="p-3 rounded-xl bg-[#09090b] border border-zinc-800">
              <span className="block text-[9px] font-mono uppercase text-zinc-500">Weight</span>
              <span className="text-sm font-bold font-numeric text-white">{user.weightKg} kg</span>
            </div>
            <div className="p-3 rounded-xl bg-[#09090b] border border-zinc-800">
              <span className="block text-[9px] font-mono uppercase text-zinc-500">Target</span>
              <span className="text-sm font-bold font-numeric text-zinc-200">{user.targetWeightKg} kg</span>
            </div>
            <div className="p-3 rounded-xl bg-[#09090b] border border-zinc-800">
              <span className="block text-[9px] font-mono uppercase text-zinc-500">Height</span>
              <span className="text-sm font-bold font-numeric text-white">{user.heightCm} cm</span>
            </div>
            <div className="p-3 rounded-xl bg-[#09090b] border border-zinc-800">
              <span className="block text-[9px] font-mono uppercase text-zinc-500">Workouts</span>
              <span className="text-sm font-bold font-numeric text-zinc-200">{traineeLogs.length}</span>
            </div>
          </div>

          {/* Assigned Protocol Box */}
          <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Assigned Workout Protocol
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenAssignPlan(user);
                }}
                className="text-xs font-bold text-zinc-300 hover:text-white transition-colors"
              >
                {assignedPlan ? 'Change Plan' : 'Assign Plan Now'}
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
              <p className="text-xs text-amber-400 font-medium">No workout plan assigned yet</p>
            )}
          </div>

          {/* Trainee Workout History */}
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2 font-semibold">
              Recent Session Logs ({traineeLogs.length})
            </span>

            {traineeLogs.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-4 rounded-xl bg-[#09090b] border border-zinc-800 text-center">
                Athlete has not logged any workouts yet.
              </p>
            ) : (
              <div className="space-y-2">
                {traineeLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#09090b] border border-zinc-800 flex items-center justify-between text-xs"
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
              className="w-full p-3 rounded-xl bg-[#09090b] border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-2 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-white rounded-xl transition-colors shadow-sm"
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
