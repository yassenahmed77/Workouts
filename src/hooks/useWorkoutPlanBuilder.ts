'use client';

import { useState, useEffect, useMemo, useRef, FormEvent } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { WorkoutPlan, WorkoutDay, RoutineExercise, MuscleGroup, EquipmentType } from '@/types';
import { workoutService } from '@/services/workoutService';

export interface UseWorkoutPlanBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: WorkoutPlan | null;
  targetUserId?: string;
}

export function useWorkoutPlanBuilder({
  isOpen,
  onClose,
  initialPlan,
  targetUserId
}: UseWorkoutPlanBuilderProps) {
  const { exercises, createPlan, updatePlan, assignPlanToUser, users, addExercise } = useGym();
  const { showToast, confirmDialog } = useToast();

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
  
  // Mobile active view switch ('movements' vs 'settings')
  const [mobileView, setMobileView] = useState<'movements' | 'settings'>('movements');

  // Target Muscles floating popover state
  const [isMusclesPopoverOpen, setIsMusclesPopoverOpen] = useState(false);
  const musclesPopoverRef = useRef<HTMLDivElement>(null);
  const musclesPopoverDropdownRef = useRef<HTMLDivElement>(null);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  // Volume Analyzer Drawer state
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);

  // Video guide preview modal
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Exercise picker drawer state
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [pickerMuscleFilter, setPickerMuscleFilter] = useState<string>('All');
  const [pickerSearch, setPickerSearch] = useState('');

  // Drag & drop reorder state
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState<number | null>(null);
  const [dragOverExerciseIndex, setDragOverExerciseIndex] = useState<number | null>(null);

  // Progressive disclosure for movement cards
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<Record<string, boolean>>({});

  const toggleExerciseExpand = (id: string) => {
    setExpandedExerciseIds((prev) => ({
      [id]: !prev[id]
    }));
  };

  // New Exercise Creation Modal inside Plan Builder
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExEquipment, setNewExEquipment] = useState<EquipmentType>('Barbell');
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>('Chest');
  const [newExCategory] = useState<'Compound' | 'Isolation'>('Compound');
  const [newExVideoUrl, setNewExVideoUrl] = useState('');
  const [newExAlternative, setNewExAlternative] = useState('');
  const [newExCue, setNewExCue] = useState('');

  // Click outside to collapse expanded exercise details
  useEffect(() => {
    const hasExpanded = Object.values(expandedExerciseIds).some(Boolean);
    if (!hasExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-movement-card="true"]')) {
        return;
      }
      setExpandedExerciseIds({});
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedExerciseIds]);

  // Global Escape key listener (dismisses innermost modal/drawer or main builder)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeVideoUrl) {
          setActiveVideoUrl(null);
          return;
        }
        if (isNewMovementModalOpen) {
          setIsNewMovementModalOpen(false);
          return;
        }
        if (isMusclesPopoverOpen) {
          setIsMusclesPopoverOpen(false);
          return;
        }
        if (isExercisePickerOpen) {
          setIsExercisePickerOpen(false);
          return;
        }
        if (isAnalyzerOpen) {
          setIsAnalyzerOpen(false);
          return;
        }
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    activeVideoUrl,
    isNewMovementModalOpen,
    isMusclesPopoverOpen,
    isExercisePickerOpen,
    isAnalyzerOpen,
    onClose
  ]);

  // Hydrate on open or prop changes
  useEffect(() => {
    if (isOpen) {
      if (initialPlan) {
        setTitle(initialPlan.title);
        setDescription(initialPlan.description || '');
        setLevel(initialPlan.level || 'Intermediate');
        setDurationWeeks(initialPlan.durationWeeks || 8);
        setDays(initialPlan.days || []);
        setActiveDayIndex(0);
      } else {
        const targetAthlete = users.find((u) => u.id === targetUserId);
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
      setMobileView('movements');
    }
  }, [isOpen, initialPlan, targetUserId, users]);

  // Dynamically calculate popover coordinates relative to trigger button
  useEffect(() => {
    if (isMusclesPopoverOpen && musclesPopoverRef.current) {
      const rect = musclesPopoverRef.current.getBoundingClientRect();
      const popoverHeight = 240;
      const spaceBelow = window.innerHeight - rect.bottom;
      
      if (spaceBelow < popoverHeight && rect.top > popoverHeight) {
        setPopoverCoords({
          top: rect.top - popoverHeight - 6,
          left: rect.left,
          width: Math.max(rect.width, 290)
        });
      } else {
        setPopoverCoords({
          top: rect.bottom + 6,
          left: rect.left,
          width: Math.max(rect.width, 290)
        });
      }
    }
  }, [isMusclesPopoverOpen]);

  // Click outside listener for muscle popover trigger + dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = musclesPopoverRef.current && musclesPopoverRef.current.contains(target);
      const clickedDropdown = musclesPopoverDropdownRef.current && musclesPopoverDropdownRef.current.contains(target);

      if (!clickedTrigger && !clickedDropdown) {
        setIsMusclesPopoverOpen(false);
      }
    };

    if (isMusclesPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMusclesPopoverOpen]);

  const activeDay = days[activeDayIndex] || days[0];

  // Calculate live volume metrics across split
  const volumeMetrics = useMemo(() => {
    let totalWeeklySets = 0;
    let totalSplitMovements = 0;
    const muscleSets: Record<string, number> = {};
    let totalEstimatedMinutes = 0;

    days.forEach((d) => {
      if (!d.isRestDay) {
        let daySets = 0;
        let dayRestSeconds = 0;
        totalSplitMovements += (d.exercises || []).length;

        (d.exercises || []).forEach((ex) => {
          const setsCount = Number(ex.sets) || 1;
          totalWeeklySets += setsCount;
          daySets += setsCount;
          dayRestSeconds += (ex.restSeconds || 150) * setsCount;

          const muscle = ex.targetMuscle || 'Other';
          muscleSets[muscle] = (muscleSets[muscle] || 0) + setsCount;
        });

        const dayDuration = Math.round((daySets * 45 + dayRestSeconds) / 60);
        totalEstimatedMinutes += dayDuration || 45;
      }
    });

    const activeDaySets = activeDay && !activeDay.isRestDay
      ? (activeDay.exercises || []).reduce((sum, ex) => sum + (Number(ex.sets) || 1), 0)
      : 0;

    return {
      totalWeeklySets,
      totalSplitMovements,
      muscleSets,
      totalEstimatedMinutes,
      activeDaySets
    };
  }, [days, activeDay]);

  const handleAddDay = () => {
    if (days.length >= 7) {
      showToast('Weekly splits are limited to 7 days maximum', 'info');
      return;
    }

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
    if (days.length >= 7) {
      showToast('Weekly splits are limited to 7 days maximum', 'info');
      return;
    }

    const sourceDay = days[index];
    if (!sourceDay) return;

    const duplicatedDay: WorkoutDay = {
      ...sourceDay,
      id: `day-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dayName: `${sourceDay.dayName} (Copy)`,
      exercises: (sourceDay.exercises || []).map((ex) => ({
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
    const targetDay = days[index];
    if (targetDay && targetDay.exercises.length > 0) {
      confirmDialog({
        title: 'Delete Training Day',
        message: `Are you sure you want to delete "${targetDay.dayName}" and its ${targetDay.exercises.length} prescribed movements?`,
        confirmText: 'Delete Day',
        variant: 'danger',
        onConfirm: () => {
          const nextDays = days.filter((_, i) => i !== index);
          setDays(nextDays);
          if (activeDayIndex >= nextDays.length) {
            setActiveDayIndex(nextDays.length - 1);
          }
          showToast('Day removed from split', 'info');
        }
      });
      return;
    }

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
    const initialAlts = ex.alternativeExercise
      ? [{ name: ex.alternativeExercise, videoUrl: '' }]
      : [];

    const routineItem: RoutineExercise = {
      id: `re-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      exerciseId: ex.id,
      exerciseName: ex.name,
      targetMuscle: ex.targetMuscle,
      equipment: ex.equipment,
      sets: 3,
      targetReps: '8-12',
      targetRpe: '1-2 RIR',
      restSeconds: 120,
      notes: ex.executionCue || '',
      alternativeExercise: ex.alternativeExercise || '',
      alternatives: initialAlts,
      videoUrl: ex.videoUrl || '',
      tips: ex.tips
    };

    handleUpdateActiveDay({
      exercises: [...(activeDay?.exercises || []), routineItem]
    });
    setIsExercisePickerOpen(false);
    showToast(`Added ${ex.name}`, 'success');
  };

  const handleAddAlternative = (exerciseId: string) => {
    if (!activeDay) return;
    const currentItem = activeDay.exercises.find((e) => e.id === exerciseId);
    if (!currentItem) return;
    const currentAlts = currentItem.alternatives || (currentItem.alternativeExercise ? [{ name: currentItem.alternativeExercise, videoUrl: '' }] : []);
    const nextAlts = [...currentAlts, { name: '', videoUrl: '' }];
    handleUpdateExercise(exerciseId, {
      alternatives: nextAlts,
      alternativeExercise: nextAlts.map((a) => a.name).filter(Boolean).join(' / ')
    });
  };

  const handleUpdateAlternative = (
    exerciseId: string,
    altIndex: number,
    field: 'name' | 'videoUrl',
    value: string
  ) => {
    if (!activeDay) return;
    const currentItem = activeDay.exercises.find((e) => e.id === exerciseId);
    if (!currentItem) return;
    const currentAlts = currentItem.alternatives || (currentItem.alternativeExercise ? [{ name: currentItem.alternativeExercise, videoUrl: '' }] : []);
    const nextAlts = currentAlts.map((alt, idx) =>
      idx === altIndex ? { ...alt, [field]: value } : alt
    );
    handleUpdateExercise(exerciseId, {
      alternatives: nextAlts,
      alternativeExercise: nextAlts.map((a) => a.name).filter(Boolean).join(' / ')
    });
  };

  const handleRemoveAlternative = (exerciseId: string, altIndex: number) => {
    if (!activeDay) return;
    const currentItem = activeDay.exercises.find((e) => e.id === exerciseId);
    if (!currentItem) return;
    const currentAlts = currentItem.alternatives || (currentItem.alternativeExercise ? [{ name: currentItem.alternativeExercise, videoUrl: '' }] : []);
    const nextAlts = currentAlts.filter((_, idx) => idx !== altIndex);
    handleUpdateExercise(exerciseId, {
      alternatives: nextAlts,
      alternativeExercise: nextAlts.map((a) => a.name).filter(Boolean).join(' / ')
    });
  };

  const handleRemoveExercise = (routineId: string) => {
    if (!activeDay) return;
    handleUpdateActiveDay({
      exercises: activeDay.exercises.filter((item) => item.id !== routineId)
    });
  };

  const handleUpdateExercise = (routineId: string, partial: Partial<RoutineExercise>) => {
    if (!activeDay) return;
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
      draggedExerciseIndex !== dragOverExerciseIndex &&
      activeDay
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
    if (!activeDay) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeDay.exercises.length) return;
    const nextExercises = [...activeDay.exercises];
    const [item] = nextExercises.splice(index, 1);
    nextExercises.splice(targetIndex, 0, item);
    handleUpdateActiveDay({ exercises: nextExercises });
  };

  const handleCreateNewExerciseSubmit = async (e: FormEvent) => {
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
    // 1. Runtime Zod Schema Validation & Sanitization
    const validation = workoutService.validatePlan({
      title,
      description,
      level,
      durationWeeks: Number(durationWeeks),
      daysPerWeek: days.filter((d) => !d.isRestDay).length || 1,
      days,
      createdForUserId: assignToUserId || undefined
    });

    if (!validation.success) {
      showToast(validation.errors[0] || 'Please complete the routine setup', 'error');
      return;
    }

    const validPlan = validation.data;

    if (initialPlan) {
      await updatePlan({
        ...initialPlan,
        title: validPlan.title,
        description: validPlan.description,
        level: validPlan.level,
        durationWeeks: validPlan.durationWeeks,
        daysPerWeek: validPlan.daysPerWeek,
        days: validPlan.days
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
        title: validPlan.title,
        description: validPlan.description,
        level: validPlan.level,
        durationWeeks: validPlan.durationWeeks,
        daysPerWeek: validPlan.daysPerWeek,
        days: validPlan.days,
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
    if (!activeDay) return;
    const current = activeDay.targetMuscles || [];
    const exists = current.includes(muscle);
    const next = exists ? current.filter((m) => m !== muscle) : [...current, muscle];
    handleUpdateActiveDay({ targetMuscles: next });
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesMuscle = pickerMuscleFilter === 'All' || ex.targetMuscle === pickerMuscleFilter;
      const matchesSearch =
        ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        ex.executionCue.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        (ex.alternativeExercise && ex.alternativeExercise.toLowerCase().includes(pickerSearch.toLowerCase()));
      return matchesMuscle && matchesSearch;
    });
  }, [exercises, pickerMuscleFilter, pickerSearch]);

  const trainees = useMemo(() => users.filter((u) => u.role === 'trainee'), [users]);
  const targetAthlete = useMemo(
    () => users.find((u) => u.id === (assignToUserId || targetUserId)),
    [users, assignToUserId, targetUserId]
  );

  return {
    // Plan Form State
    title,
    setTitle,
    description,
    setDescription,
    level,
    setLevel,
    durationWeeks,
    setDurationWeeks,
    days,
    activeDay,
    activeDayIndex,
    setActiveDayIndex,
    assignToUserId,
    setAssignToUserId,
    trainees,
    targetAthlete,
    exercises,

    // Mobile View
    mobileView,
    setMobileView,

    // Muscle Popover
    isMusclesPopoverOpen,
    setIsMusclesPopoverOpen,
    musclesPopoverRef,
    musclesPopoverDropdownRef,
    popoverCoords,
    toggleDayMuscle,

    // Metrics
    volumeMetrics,

    // Drawers & Modals
    isAnalyzerOpen,
    setIsAnalyzerOpen,
    activeVideoUrl,
    setActiveVideoUrl,
    isExercisePickerOpen,
    setIsExercisePickerOpen,
    pickerMuscleFilter,
    setPickerMuscleFilter,
    pickerSearch,
    setPickerSearch,
    filteredExercises,

    // Drag & Reorder
    draggedExerciseIndex,
    dragOverExerciseIndex,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    handleMoveExercise,

    // Card Expansion
    expandedExerciseIds,
    toggleExerciseExpand,

    // New Movement Form
    isNewMovementModalOpen,
    setIsNewMovementModalOpen,
    newExName,
    setNewExName,
    newExEquipment,
    setNewExEquipment,
    newExMuscle,
    setNewExMuscle,
    newExVideoUrl,
    setNewExVideoUrl,
    newExAlternative,
    setNewExAlternative,
    newExCue,
    setNewExCue,
    handleCreateNewExerciseSubmit,

    // Day & Exercise Handlers
    handleAddDay,
    handleDuplicateDay,
    handleRemoveDay,
    handleUpdateActiveDay,
    handleAddExerciseToActiveDay,
    handleRemoveExercise,
    handleUpdateExercise,
    handleAddAlternative,
    handleUpdateAlternative,
    handleRemoveAlternative,

    // Save & Close
    handleSavePlan
  };
}
