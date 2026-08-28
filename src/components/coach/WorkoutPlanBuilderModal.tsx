'use client';

import React, { useState } from 'react';
import { useGym } from '@/context/GymContext';
import { WorkoutPlan, WorkoutDay, RoutineExercise, MuscleGroup, EquipmentType } from '@/types';
import { 
  X, 
  Plus, 
  Trash2, 
  Dumbbell, 
  Clock, 
  Layers, 
  Check, 
  ChevronRight, 
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';

interface WorkoutPlanBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: WorkoutPlan | null;
  targetUserId?: string;
}

const MUSCLE_OPTIONS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Arms', 'Core', 'Full Body'
];

export const WorkoutPlanBuilderModal: React.FC<WorkoutPlanBuilderModalProps> = ({
  isOpen,
  onClose,
  initialPlan,
  targetUserId
}) => {
  const { exercises, createPlan, updatePlan, assignPlanToUser, users } = useGym();

  const [title, setTitle] = useState(initialPlan?.title || '');
  const [description, setDescription] = useState(initialPlan?.description || '');
  const [level, setLevel] = useState<WorkoutPlan['level']>(initialPlan?.level || 'Intermediate');
  const [durationWeeks, setDurationWeeks] = useState(initialPlan?.durationWeeks || 8);
  const [days, setDays] = useState<WorkoutDay[]>(
    initialPlan?.days || [
      {
        id: `day-${Date.now()}-1`,
        dayName: 'Day 1: Upper Body Focus',
        isRestDay: false,
        targetMuscles: ['Chest', 'Back', 'Arms'],
        estimatedMinutes: 60,
        exercises: []
      }
    ]
  );
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [assignToUserId, setAssignToUserId] = useState<string>(targetUserId || '');
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [pickerMuscleFilter, setPickerMuscleFilter] = useState<string>('All');
  const [pickerSearch, setPickerSearch] = useState('');

  if (!isOpen) return null;

  const activeDay = days[activeDayIndex] || days[0];

  const handleAddDay = () => {
    const newDayNumber = days.length + 1;
    const newDay: WorkoutDay = {
      id: `day-${Date.now()}-${newDayNumber}`,
      dayName: `Day ${newDayNumber}: New Workout`,
      isRestDay: false,
      targetMuscles: ['Chest'],
      estimatedMinutes: 60,
      exercises: []
    };
    setDays([...days, newDay]);
    setActiveDayIndex(days.length);
  };

  const handleRemoveDay = (index: number) => {
    if (days.length <= 1) return;
    const nextDays = days.filter((_, i) => i !== index);
    setDays(nextDays);
    if (activeDayIndex >= nextDays.length) {
      setActiveDayIndex(nextDays.length - 1);
    }
  };

  const handleUpdateActiveDay = (partial: Partial<WorkoutDay>) => {
    setDays((prev) =>
      prev.map((d, i) => (i === activeDayIndex ? { ...d, ...partial } : d))
    );
  };

  const handleAddExerciseToActiveDay = (ex: (typeof exercises)[0]) => {
    const routineItem: RoutineExercise = {
      id: `re-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      exerciseId: ex.id,
      exerciseName: ex.name,
      targetMuscle: ex.targetMuscle,
      equipment: ex.equipment,
      sets: 3,
      targetReps: '8-10',
      targetRpe: 8,
      restSeconds: 90,
      notes: ex.executionCue
    };

    handleUpdateActiveDay({
      exercises: [...activeDay.exercises, routineItem]
    });
    setIsExercisePickerOpen(false);
  };

  const handleRemoveExercise = (routineId: string) => {
    handleUpdateActiveDay({
      exercises: activeDay.exercises.filter((item) => item.id !== routineId)
    });
  };

  const handleUpdateExercise = (routineId: string, partial: Partial<RoutineExercise>) => {
    handleUpdateActiveDay({
      exercises: activeDay.exercises.map((item) =>
        item.id === routineId ? { ...item, ...partial } : item
      )
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (initialPlan) {
      updatePlan({
        ...initialPlan,
        title,
        description,
        level,
        durationWeeks: Number(durationWeeks),
        daysPerWeek: days.filter((d) => !d.isRestDay).length,
        days
      });
      if (assignToUserId) {
        assignPlanToUser(assignToUserId, initialPlan.id);
      }
    } else {
      const created = createPlan({
        title,
        description,
        level,
        durationWeeks: Number(durationWeeks),
        daysPerWeek: days.filter((d) => !d.isRestDay).length,
        days,
        createdForUserId: assignToUserId || undefined
      });
      if (assignToUserId) {
        assignPlanToUser(assignToUserId, created.id);
      }
    }

    onClose();
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesFilter = pickerMuscleFilter === 'All' || ex.targetMuscle === pickerMuscleFilter;
    const matchesSearch = ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                          ex.targetMuscle.toLowerCase().includes(pickerSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const trainees = users.filter((u) => u.role === 'trainee');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-5xl bg-[#111116] border border-[#262634] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#22222e] bg-[#14141c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {initialPlan ? 'Edit Workout Plan' : 'Custom Workout Plan Architect'}
              </h2>
              <p className="text-xs text-zinc-400">
                Design custom splits, configure sets & rest periods, and assign to trainees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#0d0d12] border border-[#20202c]">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Plan Name / Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 4-Day Hypertrophy & Density"
                className="w-full px-3.5 py-2 rounded-lg bg-[#14141c] border border-[#282836] text-xs font-semibold text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Experience Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as WorkoutPlan['level'])}
                className="w-full px-3.5 py-2 rounded-lg bg-[#14141c] border border-[#282836] text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Duration (Weeks)
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg bg-[#14141c] border border-[#282836] text-xs font-numeric text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Program Description / Objective
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief protocol goals, intensity targets, and progression notes..."
                className="w-full px-3.5 py-2 rounded-lg bg-[#14141c] border border-[#282836] text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Direct Trainee Assignment
              </label>
              <select
                value={assignToUserId}
                onChange={(e) => setAssignToUserId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#14141c] border border-[#282836] text-xs text-purple-300 font-semibold focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="">-- No Direct Assignment --</option>
                {trainees.map((t) => (
                  <option key={t.id} value={t.id}>
                    Assign to {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Workout Days Tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Split Days ({days.length})
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {days.filter(d => !d.isRestDay).length} Active Training Days
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddDay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Split Day
              </button>
            </div>

            {/* Day selector pill strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {days.map((day, idx) => {
                const isActive = idx === activeDayIndex;
                return (
                  <div
                    key={day.id}
                    className={`flex items-center rounded-lg border transition-all ${
                      isActive
                        ? 'bg-[#1e1e2c] border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                        : 'bg-[#101016] border-[#22222e] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveDayIndex(idx)}
                      className="px-3.5 py-2 text-xs font-semibold whitespace-nowrap flex items-center gap-2"
                    >
                      <span>{day.dayName}</span>
                      {day.isRestDay ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                          REST
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 font-numeric">
                          {day.exercises.length} ex
                        </span>
                      )}
                    </button>

                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDay(idx);
                        }}
                        className="p-1.5 mr-1 text-zinc-500 hover:text-red-400 transition-colors rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Day Configuration */}
          {activeDay && (
            <div className="p-5 rounded-xl bg-[#0f0f14] border border-[#242432] space-y-4">
              
              {/* Day settings bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-4 border-b border-zinc-800/80">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Day Title
                  </label>
                  <input
                    type="text"
                    value={activeDay.dayName}
                    onChange={(e) => handleUpdateActiveDay({ dayName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#14141c] border border-[#292938] text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Est. Duration (Mins)
                  </label>
                  <input
                    type="number"
                    value={activeDay.estimatedMinutes}
                    onChange={(e) => handleUpdateActiveDay({ estimatedMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#14141c] border border-[#292938] text-xs font-numeric text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={activeDay.isRestDay}
                      onChange={(e) => handleUpdateActiveDay({ isRestDay: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-purple-500 focus:ring-0"
                    />
                    <span className="text-xs text-zinc-300 font-medium">Mark as Active Recovery / Rest Day</span>
                  </label>
                </div>
              </div>

              {/* Day Exercises */}
              {!activeDay.isRestDay ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Exercise Routine ({activeDay.exercises.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsExercisePickerOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      Add Exercise
                    </button>
                  </div>

                  {activeDay.exercises.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl bg-[#09090c]/50">
                      <Dumbbell className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                      <p className="text-xs text-zinc-400 font-medium">No exercises added to this day yet</p>
                      <p className="text-[11px] text-zinc-600 mt-1">Click "Add Exercise" to pick movements from your exercise library</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeDay.exercises.map((item, exIdx) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-[#14141c] border border-[#252532] hover:border-[#323242] transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px] flex items-center justify-center font-bold">
                                {exIdx + 1}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-white tracking-tight">
                                  {item.exerciseName}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                                    {item.targetMuscle}
                                  </span>
                                  <span className="text-[10px] text-zinc-500">
                                    {item.equipment}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveExercise(item.id)}
                              className="text-zinc-500 hover:text-red-400 self-start sm:self-auto p-1 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Exercise Parameters Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                            <div className="col-span-2">
                              <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                                Exercise Name
                              </span>
                              <input
                                type="text"
                                value={item.exerciseName}
                                onChange={(e) => handleUpdateExercise(item.id, { exerciseName: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded bg-[#0d0d12] border border-[#242430] text-white text-xs focus:outline-none focus:border-purple-500 font-medium"
                              />
                            </div>

                            <div className="col-span-2">
                              <span className="block text-[9px] font-mono uppercase tracking-wider text-purple-400 mb-1 flex items-center justify-between">
                                <span>Alternative Movement (Badeel)</span>
                                <span className="text-[8px] text-zinc-500 font-normal">If machine is busy</span>
                              </span>
                              <input
                                type="text"
                                value={item.alternativeExercise || ''}
                                onChange={(e) => handleUpdateExercise(item.id, { alternativeExercise: e.target.value })}
                                placeholder="e.g. Incline DB Press or Machine Press"
                                className="w-full px-2.5 py-1.5 rounded bg-[#0d0d12] border border-purple-900/40 text-purple-200 text-xs focus:outline-none focus:border-purple-500"
                              />
                            </div>

                            <div className="col-span-2 sm:col-span-4">
                              <span className="block text-[9px] font-mono uppercase tracking-wider text-blue-400 mb-1 flex items-center justify-between">
                                <span>Video Guide Link (YouTube / Drive / Reel)</span>
                                <span className="text-[8px] text-zinc-500 font-normal">Trainee can watch form</span>
                              </span>
                              <input
                                type="url"
                                value={item.videoUrl || ''}
                                onChange={(e) => handleUpdateExercise(item.id, { videoUrl: e.target.value })}
                                placeholder="e.g. https://youtube.com/watch?v=..."
                                className="w-full px-2.5 py-1.5 rounded bg-[#0d0d12] border border-blue-900/40 text-blue-200 text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                                Sets Count
                              </span>
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={item.sets}
                                onChange={(e) => handleUpdateExercise(item.id, { sets: Number(e.target.value) })}
                                className="w-full px-2.5 py-1.5 rounded bg-[#0d0d12] border border-[#242430] font-numeric text-white text-xs focus:outline-none focus:border-purple-500"
                              />
                            </div>

                            <div>
                              <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                                Target Reps
                              </span>
                              <input
                                type="text"
                                value={item.targetReps}
                                onChange={(e) => handleUpdateExercise(item.id, { targetReps: e.target.value })}
                                placeholder="e.g. 8-10 or 5"
                                className="w-full px-2.5 py-1.5 rounded bg-[#0d0d12] border border-[#242430] font-numeric text-white text-xs focus:outline-none focus:border-purple-500"
                              />
                            </div>

                            <div>
                              <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                                Target RPE
                              </span>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                step="0.5"
                                value={item.targetRpe || 8}
                                onChange={(e) => handleUpdateExercise(item.id, { targetRpe: Number(e.target.value) })}
                                className="w-full px-2.5 py-1.5 rounded bg-[#0d0d12] border border-[#242430] font-numeric text-white text-xs focus:outline-none focus:border-purple-500"
                              />
                            </div>

                            <div>
                              <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                                Rest Period (Sec)
                              </span>
                              <input
                                type="number"
                                min="15"
                                max="600"
                                step="15"
                                value={item.restSeconds}
                                onChange={(e) => handleUpdateExercise(item.id, { restSeconds: Number(e.target.value) })}
                                className="w-full px-2.5 py-1.5 rounded bg-[#0d0d12] border border-[#242430] font-numeric text-purple-400 text-xs focus:outline-none focus:border-purple-500"
                              />
                            </div>

                            <div className="col-span-2 sm:col-span-4">
                              <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                                Form Checklist & Execution Tips
                              </span>
                              <input
                                type="text"
                                value={item.notes || ''}
                                onChange={(e) => handleUpdateExercise(item.id, { notes: e.target.value })}
                                placeholder="e.g. 3-second negative descent, elbows 45°, squeeze chest at apex..."
                                className="w-full px-2.5 py-1.5 rounded bg-[#0d0d12] border border-[#242430] text-zinc-300 text-xs focus:outline-none focus:border-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center bg-[#09090c] rounded-xl border border-zinc-800/80">
                  <Clock className="w-6 h-6 mx-auto text-zinc-500 mb-2" />
                  <p className="text-xs text-zinc-300 font-semibold">Scheduled Active Recovery</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Light mobility, foam rolling, and hydration recommended for athlete</p>
                </div>
              )}
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{initialPlan ? 'Save Changes' : 'Publish & Deploy Plan'}</span>
            </button>
          </div>
        </form>

        {/* Exercise Library Picker Drawer */}
        {isExercisePickerOpen && (
          <div className="absolute inset-0 z-50 bg-[#09090c]/95 backdrop-blur-md p-6 flex flex-col animate-in fade-in duration-100">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Dumbbell className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Exercise Library Directory
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExercisePickerOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter search & muscle groups */}
            <div className="py-4 space-y-3">
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search exercise name or technique cues..."
                className="w-full px-3.5 py-2 rounded-lg bg-[#14141c] border border-[#282836] text-xs text-white focus:outline-none focus:border-purple-500"
              />

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setPickerMuscleFilter('All')}
                  className={`px-3 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    pickerMuscleFilter === 'All'
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  All Movements
                </button>
                {MUSCLE_OPTIONS.map((muscle) => (
                  <button
                    key={muscle}
                    type="button"
                    onClick={() => setPickerMuscleFilter(muscle)}
                    className={`px-3 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      pickerMuscleFilter === muscle
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {muscle}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action to Add a Custom Movement on the fly */}
            <div className="mb-3 p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Need a specific custom movement?</p>
                <p className="text-[10px] text-purple-300">Add any movement name, substitute, and video guide on the fly</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const customEx = {
                    id: `ex-custom-${Date.now()}`,
                    name: pickerSearch.trim() || 'Custom Movement',
                    targetMuscle: (pickerMuscleFilter !== 'All' ? pickerMuscleFilter : 'Chest') as MuscleGroup,
                    equipment: 'Dumbbell' as EquipmentType,
                    category: 'Compound' as const,
                    executionCue: 'Focus on full range of motion and mind-muscle connection.',
                    tips: ['Control eccentric tempo', 'Keep core tight'],
                    alternativeExercise: '',
                    videoUrl: ''
                  };
                  handleAddExerciseToActiveDay(customEx);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add "{pickerSearch.trim() || 'Custom'}" Now</span>
              </button>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToActiveDay(ex)}
                  className="p-3 rounded-xl bg-[#121218] border border-[#22222e] hover:border-purple-500 hover:bg-[#181824] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                        {ex.name}
                      </h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {ex.targetMuscle}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-medium">
                        {ex.equipment}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                      {ex.executionCue}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center text-zinc-400 transition-colors">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
