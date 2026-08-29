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
  Calendar,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Video,
  Play
} from 'lucide-react';

interface WorkoutPlanBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: WorkoutPlan | null;
  targetUserId?: string;
}

const MUSCLE_OPTIONS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Arms', 'Biceps', 'Triceps', 'Calves', 'Core', 'Forearms', 'Traps', 'Full Body'
];

const EQUIPMENT_OPTIONS: EquipmentType[] = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Smith Machine', 'EZ Bar', 'Kettlebell', 'Resistance Band', 'Other'
];

export const WorkoutPlanBuilderModal: React.FC<WorkoutPlanBuilderModalProps> = ({
  isOpen,
  onClose,
  initialPlan,
  targetUserId
}) => {
  const { exercises, createPlan, updatePlan, assignPlanToUser, users, addExercise } = useGym();

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
  
  // Exercise picker drawer state
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [pickerMuscleFilter, setPickerMuscleFilter] = useState<string>('All');
  const [pickerSearch, setPickerSearch] = useState('');

  // Drag & drop reorder state
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState<number | null>(null);
  const [dragOverExerciseIndex, setDragOverExerciseIndex] = useState<number | null>(null);

  // New Exercise Creation Modal inside Plan Builder
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExEquipment, setNewExEquipment] = useState<EquipmentType>('Barbell');
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>('Chest');
  const [newExCategory, setNewExCategory] = useState<'Compound' | 'Isolation'>('Compound');
  const [newExVideoUrl, setNewExVideoUrl] = useState('');
  const [newExAlternative, setNewExAlternative] = useState('');
  const [newExCue, setNewExCue] = useState('');

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
      sets: 1,
      targetReps: '4-10',
      targetRpe: '1-2',
      restSeconds: 150,
      notes: '',
      alternativeExercise: ex.alternativeExercise || '',
      videoUrl: ex.videoUrl || '',
      tips: ex.tips
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

  const handleDragStart = (index: number) => {
    setDraggedExerciseIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setDragOverExerciseIndex(index);
  };

  const handleDragEnd = () => {
    if (
      draggedExerciseIndex !== null &&
      dragOverExerciseIndex !== null &&
      draggedExerciseIndex !== dragOverExerciseIndex
    ) {
      const nextExercises = [...activeDay.exercises];
      const [draggedItem] = nextExercises.splice(draggedExerciseIndex, 1);
      nextExercises.splice(dragOverExerciseIndex, 0, draggedItem);
      handleUpdateActiveDay({ exercises: nextExercises });
    }
    setDraggedExerciseIndex(null);
    setDragOverExerciseIndex(null);
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeDay.exercises.length) return;
    const nextExercises = [...activeDay.exercises];
    const [item] = nextExercises.splice(index, 1);
    nextExercises.splice(targetIndex, 0, item);
    handleUpdateActiveDay({ exercises: nextExercises });
  };

  const handleCreateNewExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const created = await addExercise({
      name: newExName.trim(),
      targetMuscle: newExMuscle,
      equipment: newExEquipment,
      category: newExCategory,
      videoUrl: newExVideoUrl.trim() || undefined,
      alternativeExercise: newExAlternative.trim() || undefined,
      executionCue: newExCue.trim() || 'Execute with strict form.',
      tips: ['Maintain control', 'Keep core tight']
    });

    handleAddExerciseToActiveDay(created);
    setNewExName('');
    setNewExVideoUrl('');
    setNewExAlternative('');
    setNewExCue('');
    setIsNewMovementModalOpen(false);
  };

  const handleSavePlan = async () => {
    if (!title.trim()) return;

    if (initialPlan) {
      await updatePlan({
        ...initialPlan,
        title,
        description,
        level,
        durationWeeks: Number(durationWeeks),
        daysPerWeek: days.filter((d) => !d.isRestDay).length,
        days
      });
      if (assignToUserId) {
        await assignPlanToUser(assignToUserId, initialPlan.id);
      }
    } else {
      const created = await createPlan({
        title,
        description,
        level,
        durationWeeks: Number(durationWeeks),
        daysPerWeek: days.filter((d) => !d.isRestDay).length,
        days,
        createdForUserId: assignToUserId || undefined
      });
      if (assignToUserId) {
        await assignPlanToUser(assignToUserId, created.id);
      }
    }

    onClose();
  };

  const toggleDayMuscle = (muscle: MuscleGroup) => {
    const current = activeDay.targetMuscles || [];
    const exists = current.includes(muscle);
    const next = exists ? current.filter((m) => m !== muscle) : [...current, muscle];
    handleUpdateActiveDay({ targetMuscles: next });
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesMuscle = pickerMuscleFilter === 'All' || ex.targetMuscle === pickerMuscleFilter;
    const matchesSearch =
      ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      ex.executionCue.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      (ex.alternativeExercise && ex.alternativeExercise.toLowerCase().includes(pickerSearch.toLowerCase()));
    return matchesMuscle && matchesSearch;
  });

  const trainees = users.filter((u) => u.role === 'trainee');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl bg-[#0f0f14] border border-[#262634] rounded-2xl p-4 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {initialPlan ? 'Edit Training Split' : 'Build Custom Training Split'}
              </h2>
              <p className="text-xs text-zinc-400">
                Design periodized split days, custom exercise sets, reps, and video guides
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSavePlan();
          }}
          className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 scrollbar-thin"
        >
          {/* Section 1: Split Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#13131a] border border-[#232330]">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Split Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 4-Day Push / Pull / Legs Hypertrophy Split"
                className="w-full px-3 py-2 rounded-lg bg-[#0d0d12] border border-[#262634] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Assign to Athlete (Optional)
              </label>
              <select
                value={assignToUserId}
                onChange={(e) => setAssignToUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0d0d12] border border-[#262634] text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">None (Template Only)</option>
                {trainees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.goal})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Program Description & Directives
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Progressive overload focus, 2 RIR in compound lifts, strict rest intervals"
                className="w-full px-3 py-2 rounded-lg bg-[#0d0d12] border border-[#262634] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Section 2: Split Days Tabs Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Split Schedule ({days.length} Days)</span>
              </label>

              <button
                type="button"
                onClick={handleAddDay}
                className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Day</span>
              </button>
            </div>

            {/* Days Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {days.map((d, index) => {
                const isActive = index === activeDayIndex;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setActiveDayIndex(index)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                        : 'bg-[#13131a] text-zinc-400 hover:text-white border border-[#22222d]'
                    }`}
                  >
                    <span>Day {index + 1}</span>
                    {d.isRestDay && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-zinc-300 font-mono">
                        Rest
                      </span>
                    )}
                    {days.length > 1 && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDay(index);
                        }}
                        className="p-0.5 rounded hover:bg-black/30 text-white/70 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Active Day Content */}
          {activeDay && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#111117] border border-[#242433] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div className="flex-1 max-w-sm">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Day Name
                  </label>
                  <input
                    type="text"
                    value={activeDay.dayName}
                    onChange={(e) => handleUpdateActiveDay({ dayName: e.target.value })}
                    placeholder="e.g. Day 1: Chest & Shoulders"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0d0d12] border border-[#242430] text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300">
                    <input
                      type="checkbox"
                      checked={activeDay.isRestDay}
                      onChange={(e) => handleUpdateActiveDay({ isRestDay: e.target.checked })}
                      className="rounded bg-[#0d0d12] border-zinc-700 text-purple-600 focus:ring-0"
                    />
                    <span>Mark as Rest / Recovery Day</span>
                  </label>
                </div>
              </div>

              {!activeDay.isRestDay ? (
                <div className="space-y-4">
                  {/* Target Muscles Pills */}
                  <div>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      Target Muscles for this Day
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {MUSCLE_OPTIONS.map((muscle) => {
                        const isSelected = activeDay.targetMuscles.includes(muscle);
                        return (
                          <button
                            key={muscle}
                            type="button"
                            onClick={() => toggleDayMuscle(muscle)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                                : 'bg-[#0d0d12] text-zinc-400 hover:text-white border border-[#242430]'
                            }`}
                          >
                            {muscle}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Exercises List Header */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Prescribed Exercises ({activeDay.exercises.length})
                      </h4>
                      <p className="text-[10px] text-zinc-500">
                        Drag to reorder or use ▲/▼ arrows to change exercise sequence
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsExercisePickerOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>+ Add Movement</span>
                    </button>
                  </div>

                  {activeDay.exercises.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl bg-[#09090c]/50">
                      <Dumbbell className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                      <p className="text-xs text-zinc-400 font-medium">No movements added to this day yet</p>
                      <p className="text-[11px] text-zinc-600 mt-1">Click "+ Add Movement" to choose or create exercises</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeDay.exercises.map((item, exIdx) => {
                        const isDragging = draggedExerciseIndex === exIdx;
                        const isDragOver = dragOverExerciseIndex === exIdx && !isDragging;

                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(exIdx)}
                            onDragEnter={() => handleDragEnter(exIdx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnd={handleDragEnd}
                            className={`p-3.5 rounded-xl transition-all ${
                              isDragging
                                ? 'opacity-40 scale-[0.99] border-2 border-purple-500 bg-purple-950/20'
                                : isDragOver
                                ? 'border-2 border-purple-400 border-dashed bg-purple-950/30 scale-[1.01]'
                                : 'bg-[#14141c] border border-[#252532] hover:border-[#3a3a4c]'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                {/* Drag Handle */}
                                <div 
                                  className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-purple-400 transition-colors"
                                  title="Drag to reorder movement"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>

                                {/* Up / Down Quick Reorder Buttons */}
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    type="button"
                                    disabled={exIdx === 0}
                                    onClick={() => handleMoveExercise(exIdx, 'up')}
                                    className="p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                                    title="Move Up"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={exIdx === activeDay.exercises.length - 1}
                                    onClick={() => handleMoveExercise(exIdx, 'down')}
                                    className="p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                                    title="Move Down"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>

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
                                title="Remove exercise"
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

                              <div>
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                                  Equipment
                                </span>
                                <select
                                  value={item.equipment}
                                  onChange={(e) => handleUpdateExercise(item.id, { equipment: e.target.value as EquipmentType })}
                                  className="w-full px-2.5 py-1.5 rounded bg-[#0d0d12] border border-[#242430] text-zinc-200 text-xs focus:outline-none focus:border-purple-500"
                                >
                                  {EQUIPMENT_OPTIONS.map((eq) => (
                                    <option key={eq} value={eq}>{eq}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                                  Target Muscle
                                </span>
                                <select
                                  value={item.targetMuscle}
                                  onChange={(e) => handleUpdateExercise(item.id, { targetMuscle: e.target.value as MuscleGroup })}
                                  className="w-full px-2.5 py-1.5 rounded bg-[#0d0d12] border border-[#242430] text-zinc-200 text-xs focus:outline-none focus:border-purple-500"
                                >
                                  {MUSCLE_OPTIONS.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="col-span-2">
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-purple-400 mb-1 flex items-center justify-between">
                                  <span>Alternative Movement (Badeel)</span>
                                  <span className="text-[8px] text-zinc-500 font-normal">If busy</span>
                                </span>
                                <input
                                  type="text"
                                  value={item.alternativeExercise || ''}
                                  onChange={(e) => handleUpdateExercise(item.id, { alternativeExercise: e.target.value })}
                                  placeholder="e.g. Incline DB Press or Machine Press"
                                  className="w-full px-2.5 py-1.5 rounded bg-[#0d0d12] border border-purple-900/40 text-purple-200 text-xs focus:outline-none focus:border-purple-500"
                                />
                              </div>

                              <div className="col-span-2">
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-blue-400 mb-1 flex items-center justify-between">
                                  <span>Video Guide Link (YouTube URL)</span>
                                  <span className="text-[8px] text-zinc-500 font-normal">Form video</span>
                                </span>
                                <input
                                  type="url"
                                  value={item.videoUrl || ''}
                                  onChange={(e) => handleUpdateExercise(item.id, { videoUrl: e.target.value })}
                                  placeholder="https://youtube.com/watch?v=..."
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
                                  placeholder="e.g. 4-10"
                                  className="w-full px-2.5 py-1.5 rounded bg-[#0d0d12] border border-[#242430] font-numeric text-white text-xs focus:outline-none focus:border-purple-500"
                                />
                              </div>

                              <div>
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                                  Target RPE / RIR
                                </span>
                                <input
                                  type="text"
                                  value={item.targetRpe !== undefined ? item.targetRpe : ''}
                                  onChange={(e) => handleUpdateExercise(item.id, { targetRpe: e.target.value })}
                                  placeholder="e.g. 1-2"
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
                                  Form Checklist & Execution Tips (Optional)
                                </span>
                                <input
                                  type="text"
                                  value={item.notes || ''}
                                  onChange={(e) => handleUpdateExercise(item.id, { notes: e.target.value })}
                                  placeholder="Notes & form directives..."
                                  className="w-full px-2.5 py-1.5 rounded bg-[#0d0d12] border border-[#242430] text-zinc-300 text-xs focus:outline-none focus:border-purple-500"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
          <div className="absolute inset-0 z-50 bg-[#09090c]/95 backdrop-blur-md p-4 sm:p-6 flex flex-col animate-in fade-in duration-100 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Dumbbell className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Exercise Library Directory ({exercises.length} Saved)
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
            <div className="py-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search exercise name or alternative..."
                  className="flex-1 px-3.5 py-2 rounded-lg bg-[#14141c] border border-[#282836] text-xs text-white focus:outline-none focus:border-purple-500"
                />

                <button
                  type="button"
                  onClick={() => setIsNewMovementModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create & Save New Movement</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setPickerMuscleFilter('All')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
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
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
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
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
                        {ex.equipment}
                      </span>
                      {ex.videoUrl && (
                        <span className="text-[9px] font-mono text-blue-400 flex items-center gap-0.5">
                          <Video className="w-2.5 h-2.5" />
                          <span>Video</span>
                        </span>
                      )}
                    </div>
                    {ex.alternativeExercise && (
                      <p className="text-[10px] text-purple-300/80 mt-0.5">
                        Alt: {ex.alternativeExercise}
                      </p>
                    )}
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center text-zinc-400 transition-colors">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              ))}

              {filteredExercises.length === 0 && (
                <div className="py-12 text-center border border-dashed border-zinc-800 rounded-xl bg-[#0c0c11]">
                  <Dumbbell className="w-7 h-7 text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white">No movements in library</p>
                  <p className="text-[11px] text-zinc-500 mt-1 mb-3">Click below to create your first movement with video link</p>
                  <button
                    type="button"
                    onClick={() => setIsNewMovementModalOpen(true)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Movement</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dedicated Create Movement Modal inside Plan Builder */}
        {isNewMovementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
            <div 
              className="w-full max-w-lg bg-[#121218] border border-[#2c2c3e] rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsNewMovementModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Add New Exercise to Supabase
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Saves permanently with video link & equipment type to your database
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateNewExerciseSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Exercise Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    placeholder="e.g. Incline Dumbbell Bench Press"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                      Equipment Type
                    </label>
                    <select
                      value={newExEquipment}
                      onChange={(e) => setNewExEquipment(e.target.value as EquipmentType)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {EQUIPMENT_OPTIONS.map((eq) => (
                        <option key={eq} value={eq}>{eq}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                      Target Muscle
                    </label>
                    <select
                      value={newExMuscle}
                      onChange={(e) => setNewExMuscle(e.target.value as MuscleGroup)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {MUSCLE_OPTIONS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Video Guide Link (YouTube URL)
                  </label>
                  <input
                    type="url"
                    value={newExVideoUrl}
                    onChange={(e) => setNewExVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500 placeholder-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Alternative Movement (Badeel el-tamrena)
                  </label>
                  <input
                    type="text"
                    value={newExAlternative}
                    onChange={(e) => setNewExAlternative(e.target.value)}
                    placeholder="e.g. Incline Smith Machine Press / Chest Press Machine"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500 placeholder-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Movement Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewExCategory('Compound')}
                      className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                        newExCategory === 'Compound' 
                          ? 'bg-purple-600 text-white border-purple-500' 
                          : 'bg-[#0d0d12] text-zinc-400 border-[#262632]'
                      }`}
                    >
                      Compound
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewExCategory('Isolation')}
                      className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                        newExCategory === 'Isolation' 
                          ? 'bg-purple-600 text-white border-purple-500' 
                          : 'bg-[#0d0d12] text-zinc-400 border-[#262632]'
                      }`}
                    >
                      Isolation
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Technique & Form Cue
                  </label>
                  <input
                    type="text"
                    value={newExCue}
                    onChange={(e) => setNewExCue(e.target.value)}
                    placeholder="e.g. Retract scapulae, touch lower sternum..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0d0d12] border border-[#262632] text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsNewMovementModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  >
                    Save Exercise to Supabase & Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
