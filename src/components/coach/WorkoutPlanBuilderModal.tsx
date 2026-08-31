'use client';

import React, { useState, useMemo } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
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
  Calendar, 
  GripVertical, 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Copy, 
  BarChart3, 
  Flame, 
  ExternalLink 
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
  const { showToast } = useToast();

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
  
  // Volume Analyzer Drawer state
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);

  // Video guide preview modal
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Exercise picker drawer state
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [pickerMuscleFilter, setPickerMuscleFilter] = useState<string>('All');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState<'All' | 'Compound' | 'Isolation'>('All');

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

  React.useEffect(() => {
    if (isOpen) {
      if (initialPlan) {
        setTitle(initialPlan.title);
        setDescription(initialPlan.description || '');
        setLevel(initialPlan.level || 'Intermediate');
        setDurationWeeks(initialPlan.durationWeeks || 8);
        setDays(initialPlan.days || []);
        setActiveDayIndex(0);
      } else {
        const targetAthlete = users.find(u => u.id === targetUserId);
        setTitle(targetAthlete ? `${targetAthlete.name}'s Custom Split` : 'New Custom Split');
        setDescription(targetAthlete ? `Customized workout split designed for ${targetAthlete.name}.` : '');
        setLevel('Intermediate');
        setDurationWeeks(8);
        setDays([
          {
            id: `day-${Date.now()}-1`,
            dayName: 'Day 1: Upper Body Focus',
            isRestDay: false,
            targetMuscles: ['Chest', 'Back', 'Arms'],
            estimatedMinutes: 60,
            exercises: []
          }
        ]);
        setActiveDayIndex(0);
      }
      setAssignToUserId(targetUserId || (initialPlan?.createdForUserId || ''));
    }
  }, [isOpen, initialPlan, targetUserId, users]);

  const activeDay = days[activeDayIndex] || days[0];

  // Calculate live volume metrics across split
  const volumeMetrics = useMemo(() => {
    let totalWeeklySets = 0;
    const muscleSets: Record<string, number> = {};
    let totalEstimatedMinutes = 0;

    days.forEach((d) => {
      if (!d.isRestDay) {
        let daySets = 0;
        let dayRestSeconds = 0;

        d.exercises.forEach((ex) => {
          const setsCount = Number(ex.sets) || 1;
          totalWeeklySets += setsCount;
          daySets += setsCount;
          dayRestSeconds += (ex.restSeconds || 90) * setsCount;

          const muscle = ex.targetMuscle || 'Other';
          muscleSets[muscle] = (muscleSets[muscle] || 0) + setsCount;
        });

        const dayDuration = Math.round((daySets * 45 + dayRestSeconds) / 60);
        totalEstimatedMinutes += dayDuration || 45;
      }
    });

    const activeDaySets = activeDay && !activeDay.isRestDay
      ? activeDay.exercises.reduce((sum, ex) => sum + (Number(ex.sets) || 1), 0)
      : 0;

    return {
      totalWeeklySets,
      muscleSets,
      totalEstimatedMinutes,
      activeDaySets
    };
  }, [days, activeDay]);

  const handleAddDay = () => {
    const newDayNumber = days.length + 1;
    const newDay: WorkoutDay = {
      id: `day-${Date.now()}-${newDayNumber}`,
      dayName: `Day ${newDayNumber}: New Workout Focus`,
      isRestDay: false,
      targetMuscles: ['Chest'],
      estimatedMinutes: 60,
      exercises: []
    };
    setDays([...days, newDay]);
    setActiveDayIndex(days.length);
    showToast(`Added Day ${newDayNumber}`, 'info');
  };

  const handleDuplicateDay = (index: number) => {
    const sourceDay = days[index];
    if (!sourceDay) return;

    const duplicatedDay: WorkoutDay = {
      ...sourceDay,
      id: `day-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dayName: `${sourceDay.dayName} (Copy)`,
      exercises: sourceDay.exercises.map((ex) => ({
        ...ex,
        id: `re-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      }))
    };

    const nextDays = [...days];
    nextDays.splice(index + 1, 0, duplicatedDay);
    setDays(nextDays);
    setActiveDayIndex(index + 1);
    showToast(`Duplicated ${sourceDay.dayName}`, 'success');
  };

  const handleRemoveDay = (index: number) => {
    if (days.length <= 1) return;
    const nextDays = days.filter((_, i) => i !== index);
    setDays(nextDays);
    if (activeDayIndex >= nextDays.length) {
      setActiveDayIndex(nextDays.length - 1);
    }
    showToast('Day removed from split', 'info');
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
      targetReps: '8-12',
      targetRpe: '1-2 RIR',
      restSeconds: 90,
      notes: ex.executionCue || '',
      alternativeExercise: ex.alternativeExercise || '',
      videoUrl: ex.videoUrl || '',
      tips: ex.tips
    };

    handleUpdateActiveDay({
      exercises: [...activeDay.exercises, routineItem]
    });
    setIsExercisePickerOpen(false);
    showToast(`Added ${ex.name}`, 'success');
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
    showToast(`Created & added ${created.name}`, 'success');
  };

  const handleSavePlan = async () => {
    if (!title.trim()) {
      showToast('Please enter a split title', 'error');
      return;
    }

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
        const assignedUser = users.find((u) => u.id === assignToUserId);
        showToast(`Split updated & assigned to ${assignedUser?.name || 'athlete'}!`, 'success');
      } else {
        showToast('Workout plan updated successfully!', 'success');
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
        const assignedUser = users.find((u) => u.id === assignToUserId);
        showToast(`Split deployed & assigned to ${assignedUser?.name || 'athlete'}!`, 'success');
      } else {
        showToast('New workout plan published successfully!', 'success');
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
    const matchesCategory = pickerCategoryFilter === 'All' || ex.category === pickerCategoryFilter;
    const matchesSearch =
      ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      ex.executionCue.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      (ex.alternativeExercise && ex.alternativeExercise.toLowerCase().includes(pickerSearch.toLowerCase()));
    return matchesMuscle && matchesCategory && matchesSearch;
  });

  const trainees = users.filter((u) => u.role === 'trainee');
  const targetAthlete = users.find((u) => u.id === (assignToUserId || targetUserId));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-5xl bg-[#121215] border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative max-h-[94vh] flex flex-col animate-in zoom-in-95 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {initialPlan ? 'Customize Workout Split' : 'Build Custom Training Split'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#18151f] text-[#ff6b00] border border-[#ff6b00]/20 font-bold">
                  {targetAthlete ? `FOR ${targetAthlete.name.toUpperCase()}` : 'BUILDER'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {targetAthlete ? (
                  <>Directly customize exercises, sets, reps & days for <span className="text-[#ff6b00] font-bold">{targetAthlete.name}</span></>
                ) : (
                  'Structure split days, target sets, reps, rest intervals & form cues'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Volume Analyzer Drawer */}
            <button
              type="button"
              onClick={() => setIsAnalyzerOpen(!isAnalyzerOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isAnalyzerOpen
                  ? 'bg-zinc-700 text-white border-zinc-600'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white border-zinc-700'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Volume Stats</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Volume & Muscle Distribution Drawer */}
        {isAnalyzerOpen && (
          <div className="mt-3 p-4 rounded-2xl bg-[#18181c] border border-zinc-700/80 animate-in slide-in-from-top-2 fade-in duration-150">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-zinc-300" />
                <span className="text-xs font-bold text-white tracking-tight">
                  Volume & Muscle Distribution Overview
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-300 font-bold">
                {volumeMetrics.totalWeeklySets} Total Weekly Sets
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3 text-xs">
              <div className="p-2 rounded-xl bg-[#09090b] border border-zinc-800 text-center">
                <span className="block text-[9px] font-mono uppercase text-zinc-500">Days Active</span>
                <span className="text-sm font-bold font-numeric text-white">{days.filter((d) => !d.isRestDay).length} Days</span>
              </div>
              <div className="p-2 rounded-xl bg-[#09090b] border border-zinc-800 text-center">
                <span className="block text-[9px] font-mono uppercase text-zinc-500">Today Sets</span>
                <span className="text-sm font-bold font-numeric text-zinc-200">{volumeMetrics.activeDaySets} Sets</span>
              </div>
              <div className="p-2 rounded-xl bg-[#09090b] border border-zinc-800 text-center">
                <span className="block text-[9px] font-mono uppercase text-zinc-500">Est. Total Time</span>
                <span className="text-sm font-bold font-numeric text-zinc-200">~{volumeMetrics.totalEstimatedMinutes} Mins/Wk</span>
              </div>
              <div className="p-2 rounded-xl bg-[#09090b] border border-zinc-800 text-center">
                <span className="block text-[9px] font-mono uppercase text-zinc-500">Protocol Cycle</span>
                <span className="text-sm font-bold font-numeric text-zinc-200">{durationWeeks} Weeks</span>
              </div>
            </div>

            {/* Muscle Breakdown Progress Bars */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Target Muscle Volume Distribution
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(volumeMetrics.muscleSets).map(([muscle, sets]) => {
                  const pct = Math.min(100, Math.round((sets / Math.max(1, volumeMetrics.totalWeeklySets)) * 100));
                  return (
                    <div key={muscle} className="p-2 rounded-lg bg-[#09090b] border border-zinc-800">
                      <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                        <span className="text-zinc-300">{muscle}</span>
                        <span className="text-zinc-200 font-numeric font-bold">{sets} sets</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-zinc-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Form Content */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSavePlan();
          }}
          className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 scrollbar-thin"
        >
          {/* Section 1: Split Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#16161b] border border-zinc-800">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                Split Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 4-Day Push / Pull / Legs Hypertrophy Split"
                className="w-full px-3.5 py-2 rounded-xl bg-[#09090b] border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                Assign to Athlete
              </label>
              <select
                value={assignToUserId}
                onChange={(e) => setAssignToUserId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#09090b] border border-zinc-700/80 text-xs text-white focus:outline-none focus:border-zinc-500"
              >
                <option value="">None (Master Template)</option>
                {trainees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.goal})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                Program Directives & Progression Notes
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Progressive overload focus, 1-2 RIR in compound lifts, strict rest intervals"
                className="w-full px-3.5 py-2 rounded-xl bg-[#09090b] border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                Duration (Weeks)
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-[#09090b] border border-zinc-700/80 text-xs font-numeric text-white focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {/* Section 2: Split Days Tabs Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Split Schedule ({days.length} Days)</span>
              </label>

              <button
                type="button"
                onClick={handleAddDay}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Day</span>
              </button>
            </div>

            {/* Days Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              {days.map((d, index) => {
                const isActive = index === activeDayIndex;
                return (
                  <div
                    key={d.id}
                    onClick={() => setActiveDayIndex(index)}
                    className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      isActive
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-sm'
                        : 'bg-[#16161a] text-zinc-400 hover:text-white border-zinc-800'
                    }`}
                  >
                    <span>Day {index + 1}</span>
                    {d.isRestDay ? (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${isActive ? 'bg-zinc-300 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>
                        Rest
                      </span>
                    ) : (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-numeric ${isActive ? 'bg-zinc-300 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>
                        {d.exercises.length} ex
                      </span>
                    )}

                    <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleDuplicateDay(index)}
                        className="p-1 rounded hover:bg-black/20 text-inherit opacity-70 hover:opacity-100 transition-opacity"
                        title="Duplicate Day"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {days.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDay(index)}
                          className="p-1 rounded hover:bg-black/20 text-inherit opacity-70 hover:opacity-100 transition-opacity"
                          title="Delete Day"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Active Day Content */}
          {activeDay && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141418] border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex-1 max-w-md">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                    Day Name / Focus
                  </label>
                  <input
                    type="text"
                    value={activeDay.dayName}
                    onChange={(e) => handleUpdateActiveDay({ dayName: e.target.value })}
                    placeholder="e.g. Day 1: Chest & Shoulders"
                    className="w-full px-3.5 py-1.5 rounded-xl bg-[#09090b] border border-zinc-700/80 text-xs text-white font-bold focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300 px-3 py-1.5 rounded-xl bg-[#18181e] border border-zinc-800">
                    <input
                      type="checkbox"
                      checked={activeDay.isRestDay}
                      onChange={(e) => handleUpdateActiveDay({ isRestDay: e.target.checked })}
                      className="rounded bg-[#09090b] border-zinc-700 text-zinc-300 focus:ring-0 w-4 h-4"
                    />
                    <span>Rest / Recovery Day</span>
                  </label>
                </div>
              </div>

              {!activeDay.isRestDay ? (
                <div className="space-y-4">
                  {/* Target Muscles Pills */}
                  <div>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5 font-semibold">
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
                            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              isSelected
                                ? 'bg-zinc-200 text-zinc-900 shadow-sm'
                                : 'bg-[#09090b] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
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
                      <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                        <Dumbbell className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Prescribed Movements ({activeDay.exercises.length})</span>
                      </h4>
                      <p className="text-[10px] text-zinc-500">
                        Drag to reorder or use ▲/▼ arrows to sequence exercise execution
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsExercisePickerOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-white transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>+ Add Movement</span>
                    </button>
                  </div>

                  {activeDay.exercises.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-zinc-800 rounded-2xl bg-[#09090b]">
                      <Dumbbell className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                      <p className="text-xs text-zinc-300 font-semibold">No movements added to this split day</p>
                      <p className="text-[11px] text-zinc-500 mt-1 mb-3">Click "+ Add Movement" to choose or create exercises</p>
                      <button
                        type="button"
                        onClick={() => setIsExercisePickerOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add First Movement</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
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
                            className={`p-4 rounded-2xl transition-all ${
                              isDragging
                                ? 'opacity-40 scale-[0.99] border-2 border-zinc-500 bg-zinc-900'
                                : isDragOver
                                ? 'border-2 border-zinc-400 border-dashed bg-zinc-900 scale-[1.01]'
                                : 'bg-[#18181e] border border-zinc-800/80 hover:border-zinc-700 shadow-sm'
                            }`}
                          >
                            {/* Exercise Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                              <div className="flex items-center gap-2.5">
                                {/* Drag Handle */}
                                <div 
                                  className="cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
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

                                <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 font-mono text-xs flex items-center justify-center font-bold">
                                  {exIdx + 1}
                                </span>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-white tracking-tight">
                                      {item.exerciseName}
                                    </h4>
                                    {item.videoUrl && (
                                      <button
                                        type="button"
                                        onClick={() => setActiveVideoUrl(item.videoUrl || null)}
                                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors inline-flex items-center gap-1"
                                      >
                                        <Play className="w-2.5 h-2.5" />
                                        <span>Video Guide</span>
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                                      {item.targetMuscle}
                                    </span>
                                    <span className="text-[10px] text-zinc-400">
                                      {item.equipment}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveExercise(item.id)}
                                className="text-zinc-500 hover:text-rose-400 self-start sm:self-auto p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                                title="Remove exercise"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Exercise Parameters Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                              <div className="col-span-2">
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                                  Exercise Name
                                </span>
                                <input
                                  type="text"
                                  value={item.exerciseName}
                                  onChange={(e) => handleUpdateExercise(item.id, { exerciseName: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-700/80 text-white text-xs focus:outline-none focus:border-zinc-500 font-semibold"
                                />
                              </div>

                              <div>
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                                  Equipment
                                </span>
                                <select
                                  value={item.equipment}
                                  onChange={(e) => handleUpdateExercise(item.id, { equipment: e.target.value as EquipmentType })}
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-700/80 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500"
                                >
                                  {EQUIPMENT_OPTIONS.map((eq) => (
                                    <option key={eq} value={eq}>{eq}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                                  Target Muscle
                                </span>
                                <select
                                  value={item.targetMuscle}
                                  onChange={(e) => handleUpdateExercise(item.id, { targetMuscle: e.target.value as MuscleGroup })}
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-700/80 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500"
                                >
                                  {MUSCLE_OPTIONS.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                                  Sets Count
                                </span>
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={item.sets}
                                  onChange={(e) => handleUpdateExercise(item.id, { sets: Number(e.target.value) })}
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-700/80 font-numeric text-white text-xs focus:outline-none focus:border-zinc-500 font-bold"
                                />
                              </div>

                              <div>
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                                  Target Reps
                                </span>
                                <input
                                  type="text"
                                  value={item.targetReps}
                                  onChange={(e) => handleUpdateExercise(item.id, { targetReps: e.target.value })}
                                  placeholder="e.g. 6-10"
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-700/80 font-numeric text-white text-xs focus:outline-none focus:border-zinc-500 font-bold"
                                />
                              </div>

                              <div>
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                                  Target RPE / RIR
                                </span>
                                <input
                                  type="text"
                                  value={item.targetRpe !== undefined ? item.targetRpe : ''}
                                  onChange={(e) => handleUpdateExercise(item.id, { targetRpe: e.target.value })}
                                  placeholder="e.g. 1-2 RIR"
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-700/80 font-numeric text-zinc-200 text-xs focus:outline-none focus:border-zinc-500 font-bold"
                                />
                              </div>

                              <div>
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                                  Rest Period (Sec)
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min="15"
                                    max="600"
                                    step="15"
                                    value={item.restSeconds}
                                    onChange={(e) => handleUpdateExercise(item.id, { restSeconds: Number(e.target.value) })}
                                    className="w-20 px-2.5 py-1.5 rounded-xl bg-[#09090b] border border-zinc-700/80 font-numeric text-zinc-200 text-xs focus:outline-none focus:border-zinc-500 font-bold"
                                  />
                                  <div className="flex items-center gap-1 overflow-x-auto">
                                    {[60, 90, 120, 180].map((sec) => (
                                      <button
                                        key={sec}
                                        type="button"
                                        onClick={() => handleUpdateExercise(item.id, { restSeconds: sec })}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-colors ${
                                          item.restSeconds === sec
                                            ? 'bg-zinc-200 text-zinc-900'
                                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                        }`}
                                      >
                                        {sec}s
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="col-span-2">
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between font-semibold">
                                  <span>Alternative Movement (Badeel)</span>
                                  <span className="text-[8px] text-zinc-500 font-normal">Swap if machine busy</span>
                                </span>
                                <input
                                  type="text"
                                  value={item.alternativeExercise || ''}
                                  onChange={(e) => handleUpdateExercise(item.id, { alternativeExercise: e.target.value })}
                                  placeholder="e.g. Incline Dumbbell Press / Chest Press Machine"
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-700/80 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500"
                                />
                              </div>

                              <div className="col-span-2">
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between font-semibold">
                                  <span>Video Guide URL</span>
                                  <span className="text-[8px] text-zinc-500 font-normal">YouTube</span>
                                </span>
                                <input
                                  type="url"
                                  value={item.videoUrl || ''}
                                  onChange={(e) => handleUpdateExercise(item.id, { videoUrl: e.target.value })}
                                  placeholder="https://youtube.com/watch?v=..."
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-700/80 text-zinc-200 text-xs focus:outline-none focus:border-zinc-500"
                                />
                              </div>

                              <div className="col-span-2 sm:col-span-4">
                                <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                                  Technique Directives & Form Cues
                                </span>
                                <input
                                  type="text"
                                  value={item.notes || ''}
                                  onChange={(e) => handleUpdateExercise(item.id, { notes: e.target.value })}
                                  placeholder="e.g. 3-second eccentric tempo, pause at the bottom, maintain neutral spine"
                                  className="w-full px-3 py-1.5 rounded-xl bg-[#09090b] border border-zinc-700/80 text-zinc-300 text-xs focus:outline-none focus:border-zinc-500"
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
                <div className="py-10 text-center bg-[#09090b] rounded-2xl border border-zinc-800">
                  <Clock className="w-7 h-7 mx-auto text-zinc-500 mb-2" />
                  <p className="text-sm text-zinc-200 font-bold">Scheduled Active Recovery / Rest Day</p>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">Light mobility, foam rolling, 10k steps, and optimal protein hydration protocol for athlete recovery.</p>
                </div>
              )}
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <span>{days.filter((d) => !d.isRestDay).length} Workout Days</span>
              <span>•</span>
              <span className="text-zinc-200 font-bold">{volumeMetrics.totalWeeklySets} Total Sets</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-white rounded-xl transition-all shadow-sm"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{initialPlan ? 'Update Protocol' : 'Publish & Deploy Split'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Exercise Library Picker Drawer */}
        {isExercisePickerOpen && (
          <div className="absolute inset-0 z-50 bg-[#09090b]/95 backdrop-blur-md p-4 sm:p-6 flex flex-col animate-in fade-in duration-100 rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Dumbbell className="w-5 h-5 text-zinc-300" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Exercise Library ({exercises.length} Movements)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExercisePickerOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
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
                  placeholder="Search exercise name, form cues, or alternatives..."
                  className="flex-1 px-4 py-2 rounded-xl bg-[#141418] border border-zinc-700/80 text-xs text-white focus:outline-none focus:border-zinc-500"
                />

                <button
                  type="button"
                  onClick={() => setIsNewMovementModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-white transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create Movement</span>
                </button>
              </div>

              {/* Category & Muscle Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <div className="flex items-center gap-1 border-r border-zinc-800 pr-2 mr-1">
                  {(['All', 'Compound', 'Isolation'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPickerCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                        pickerCategoryFilter === cat
                          ? 'bg-zinc-200 text-zinc-900'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setPickerMuscleFilter('All')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    pickerMuscleFilter === 'All'
                      ? 'bg-zinc-200 text-zinc-900'
                      : 'bg-zinc-850 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  All ({exercises.length})
                </button>
                {MUSCLE_OPTIONS.map((muscle) => {
                  const count = exercises.filter((e) => e.targetMuscle === muscle).length;
                  return (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => setPickerMuscleFilter(muscle)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                        pickerMuscleFilter === muscle
                          ? 'bg-zinc-200 text-zinc-900'
                          : 'bg-zinc-850 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      {muscle} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToActiveDay(ex)}
                  className="p-3.5 rounded-2xl bg-[#141418] border border-zinc-800 hover:border-zinc-600 hover:bg-[#1a1a20] cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors">
                        {ex.name}
                      </h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {ex.targetMuscle}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {ex.equipment}
                      </span>
                      {ex.category && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {ex.category}
                        </span>
                      )}
                    </div>
                    {ex.alternativeExercise && (
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Badeel: {ex.alternativeExercise}
                      </p>
                    )}
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 group-hover:bg-zinc-200 group-hover:text-zinc-900 flex items-center justify-center text-zinc-400 transition-colors">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dedicated Create Movement Modal inside Plan Builder */}
        {isNewMovementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div 
              className="w-full max-w-lg bg-[#141418] border border-zinc-700 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsNewMovementModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Add New Exercise Movement
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Saves to library with video demonstration & equipment tags
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateNewExerciseSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                    Exercise Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    placeholder="e.g. Incline Dumbbell Bench Press"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#09090b] border border-zinc-700/80 text-xs text-white focus:outline-none focus:border-zinc-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                      Equipment Type
                    </label>
                    <select
                      value={newExEquipment}
                      onChange={(e) => setNewExEquipment(e.target.value as EquipmentType)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#09090b] border border-zinc-700/80 text-xs text-white focus:outline-none focus:border-zinc-500"
                    >
                      {EQUIPMENT_OPTIONS.map((eq) => (
                        <option key={eq} value={eq}>{eq}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                      Target Muscle
                    </label>
                    <select
                      value={newExMuscle}
                      onChange={(e) => setNewExMuscle(e.target.value as MuscleGroup)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#09090b] border border-zinc-700/80 text-xs text-white focus:outline-none focus:border-zinc-500"
                    >
                      {MUSCLE_OPTIONS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                    Video Guide URL (YouTube)
                  </label>
                  <input
                    type="url"
                    value={newExVideoUrl}
                    onChange={(e) => setNewExVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#09090b] border border-zinc-700/80 text-xs text-white focus:outline-none focus:border-zinc-500 placeholder-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                    Alternative Movement (Badeel)
                  </label>
                  <input
                    type="text"
                    value={newExAlternative}
                    onChange={(e) => setNewExAlternative(e.target.value)}
                    placeholder="e.g. Incline Smith Machine Press / Chest Press Machine"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#09090b] border border-zinc-700/80 text-xs text-white focus:outline-none focus:border-zinc-500 placeholder-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                    Movement Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewExCategory('Compound')}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        newExCategory === 'Compound' 
                          ? 'bg-zinc-200 text-zinc-900 border-zinc-200' 
                          : 'bg-[#09090b] text-zinc-400 border-zinc-800'
                      }`}
                    >
                      Compound
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewExCategory('Isolation')}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        newExCategory === 'Isolation' 
                          ? 'bg-zinc-200 text-zinc-900 border-zinc-200' 
                          : 'bg-[#09090b] text-zinc-400 border-zinc-800'
                      }`}
                    >
                      Isolation
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                    Technique & Form Cue
                  </label>
                  <input
                    type="text"
                    value={newExCue}
                    onChange={(e) => setNewExCue(e.target.value)}
                    placeholder="e.g. Retract scapulae, touch lower sternum..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#09090b] border border-zinc-700/80 text-xs text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsNewMovementModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-white rounded-xl transition-all shadow-sm"
                  >
                    Save & Add to Day
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Video Guide Modal Preview */}
        {activeVideoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div 
              className="w-full max-w-2xl bg-[#141418] border border-zinc-700 rounded-3xl p-5 shadow-2xl relative animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                <h3 className="text-sm font-bold text-white">Video Demonstration</h3>
                <button
                  type="button"
                  onClick={() => setActiveVideoUrl(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-zinc-400">
                  Target Link: <a href={activeVideoUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-200 underline font-mono break-all">{activeVideoUrl}</a>
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <a
                    href={activeVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-white transition-all inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in YouTube ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
