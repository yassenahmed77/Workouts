'use client';

import React from 'react';
import { WorkoutPlan } from '@/types';
import { 
  ArrowLeft, 
  Trash2, 
  Copy, 
  Plus, 
  ChevronDown 
} from 'lucide-react';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { useWorkoutPlanBuilder } from '@/hooks/useWorkoutPlanBuilder';
import { VolumeAnalyzerDrawer } from './workout-builder/VolumeAnalyzerDrawer';
import { ExercisePickerDrawer } from './workout-builder/ExercisePickerDrawer';
import { NewMovementModal } from './workout-builder/NewMovementModal';
import { VideoPreviewModal } from './workout-builder/VideoPreviewModal';
import { MovementCard } from './workout-builder/MovementCard';

interface WorkoutPlanBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: WorkoutPlan | null;
  targetUserId?: string;
}

const MUSCLE_GROUPS_BY_CATEGORY = [
  {
    category: 'Upper Body',
    muscles: ['Chest', 'Back', 'Shoulders', 'Arms', 'Biceps', 'Triceps', 'Forearms', 'Traps'] as const
  },
  {
    category: 'Lower Body',
    muscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] as const
  },
  {
    category: 'Core & Other',
    muscles: ['Core', 'Full Body'] as const
  }
];

export const WorkoutPlanBuilderModal: React.FC<WorkoutPlanBuilderModalProps> = (props) => {
  const { isOpen, onClose, initialPlan } = props;
  const builder = useWorkoutPlanBuilder(props);

  if (!isOpen) return null;

  const {
    title,
    setTitle,
    description,
    setDescription,
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
    mobileView,
    setMobileView,
    isMusclesPopoverOpen,
    setIsMusclesPopoverOpen,
    musclesPopoverRef,
    musclesPopoverDropdownRef,
    popoverCoords,
    toggleDayMuscle,
    volumeMetrics,
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
    draggedExerciseIndex,
    dragOverExerciseIndex,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    handleMoveExercise,
    expandedExerciseIds,
    toggleExerciseExpand,
    isNewMovementModalOpen,
    setIsNewMovementModalOpen,
    newExName,
    setNewExName,
    newExEquipment,
    setNewExEquipment,
    newExMuscle,
    setNewExMuscle,
    newExCue,
    setNewExCue,
    newExAlternative,
    setNewExAlternative,
    handleCreateNewExerciseSubmit,
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
    handleSavePlan
  } = builder;

  return (
    <div className="fixed inset-0 z-50 bg-[#070a0f] flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150 select-none text-slate-100 font-sans">
      
      {/* 1. Studio Edge-to-Edge Top Navigation Bar */}
      <header className="flex-shrink-0 border-b border-white/[0.08] bg-[#090d14] px-3 sm:px-5 py-2 z-30 flex items-center justify-between gap-3">
        {/* Left: Back Arrow, Title, Athlete Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex-shrink-0"
            title="Close studio"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0 leading-none hidden md:inline">
              Split Studio
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0 hidden md:inline" />
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[130px] lg:max-w-[200px] leading-none" title={title || 'Untitled Split'}>
              {title || 'Untitled Split'}
            </h2>
            {targetAthlete && (
              <span className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/10 text-[9.5px] font-mono font-bold flex-shrink-0 truncate max-w-[120px] sm:max-w-none leading-none hidden sm:inline-block">
                FOR {targetAthlete.name.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Center: Days Navigation Segmented Bar */}
        <div className="flex-1 min-w-0 flex items-center justify-center px-1 sm:px-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 rounded-xl bg-[#05080e] border border-white/[0.06] flex-shrink-0">
            {days.map((d, index) => {
              const isActive = index === activeDayIndex;
              const daySetsCount = d.isRestDay
                ? 0
                : (d.exercises || []).reduce((sum, ex) => sum + (Number(ex.sets) || 1), 0);

              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setActiveDayIndex(index)}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                  title={`${d.dayName} (${daySetsCount} sets)`}
                >
                  <span>
                    <span className="hidden lg:inline">Day </span>
                    <span className="lg:hidden">D</span>
                    {index + 1}
                  </span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                    d.isRestDay 
                      ? (isActive ? 'bg-white/[0.15] text-white' : 'bg-white/[0.04] text-slate-500')
                      : (isActive ? 'bg-white/[0.2] text-white' : 'bg-white/[0.06] text-slate-400')
                  }`}>
                    {d.isRestDay ? 'Rest' : daySetsCount}
                  </span>
                </button>
              );
            })}

            {days.length < 7 && (
              <button
                type="button"
                onClick={handleAddDay}
                className="px-2 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer active:scale-95 flex-shrink-0"
                title="Add Training Day (Up to 7 Days)"
              >
                +
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsAnalyzerOpen(!isAnalyzerOpen)}
            className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer"
            title="Toggle Volume Analyzer"
          >
            Volume Analyzer
          </button>

          <button
            type="button"
            onClick={onClose}
            className="hidden sm:inline-block px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSavePlan}
            className="px-3.5 sm:px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 active:scale-95 text-[#080c14] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {initialPlan ? 'Save Split' : 'Publish Split'}
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher (Movements vs Settings) */}
      <div className="flex md:hidden items-center justify-center p-1 rounded-lg bg-[#05080e] border border-[#16202e] text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMobileView('movements')}
          className={`flex-1 py-1 rounded text-center transition-all ${
            mobileView === 'movements'
              ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Prescribed Movements ({activeDay?.exercises?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setMobileView('settings')}
          className={`flex-1 py-1 rounded text-center transition-all flex items-center justify-center gap-1 ${
            mobileView === 'settings'
              ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Day Settings
        </button>
      </div>

      {/* 2. Studio Body: Responsive 2-Column Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full relative">
        
        {/* Left Sidebar: Settings & Day Configuration */}
        <aside className={`w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-[#141b26] bg-[#080c14] flex flex-col h-full overflow-hidden ${
          mobileView === 'settings' ? 'flex flex-1 md:flex-none' : 'hidden md:flex'
        }`}>
          {/* Scrollable Form Cards */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-3.5 space-y-3">
            
            {/* Card 1: Split Directives & Target Client */}
            <div className="p-3 rounded-xl bg-[#090e17] border border-[#141b26] space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Split Settings
              </span>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Hypertrophy Split"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-slate-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-start">
                <div className="relative z-30">
                  <SelectDropdown
                    label="Athlete"
                    value={assignToUserId}
                    onChange={(val) => setAssignToUserId(val)}
                    options={trainees.map((t) => ({ value: t.id, label: t.name }))}
                    placeholder="Select Athlete..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">Duration</label>
                  <div className="h-[34px] flex items-center justify-between px-2.5 rounded-lg bg-[#05080e] border border-[#16202e] focus-within:border-slate-500">
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={durationWeeks}
                      onChange={(e) => setDurationWeeks(Number(e.target.value))}
                      className="w-full text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">wks</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">Progression Directives</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 1-2 RIR in compound lifts, strict rest"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>

            {/* Card 2: Active Day Focus & Recovery Toggle */}
            {activeDay && (
              <div className="p-3 rounded-xl bg-[#090e17] border border-[#141b26] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Day {activeDayIndex + 1} Configuration
                  </span>
                  <div className="flex items-center gap-1.5">
                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDay(activeDayIndex)}
                        className="p-1 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                        title="Delete this day from split"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleUpdateActiveDay({ isRestDay: !activeDay.isRestDay })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer ${
                        activeDay.isRestDay
                          ? 'bg-white/[0.1] border-white/20 text-white shadow-xs'
                          : 'bg-[#05080e] border-[#16202e] text-slate-400 hover:text-white hover:border-[#1e293b]'
                      }`}
                    >
                      {activeDay.isRestDay ? 'Rest Day' : 'Training Day'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">Focus / Day Name</label>
                  <input
                    type="text"
                    value={activeDay.dayName}
                    onChange={(e) => handleUpdateActiveDay({ dayName: e.target.value })}
                    placeholder="e.g. Day 1: Chest & Shoulders"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#05080e] border border-[#16202e] text-xs text-white font-semibold focus:outline-none focus:border-slate-500"
                  />
                </div>

                {/* Target Muscles Popover Trigger */}
                {!activeDay.isRestDay && (
                  <div className="relative pt-1 border-t border-[#141b26]" ref={musclesPopoverRef}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Target Muscles
                      </label>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {(activeDay.targetMuscles || []).length} active
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMusclesPopoverOpen(!isMusclesPopoverOpen)}
                      className="w-full h-8 px-2.5 rounded-lg bg-[#05080e] border border-[#16202e] hover:border-slate-500 text-xs text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="truncate text-xs font-medium text-slate-200">
                        {(activeDay.targetMuscles || []).length > 0 
                          ? activeDay.targetMuscles.join(', ')
                          : 'Select target muscles...'}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                        {(activeDay.targetMuscles || []).length > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300 font-mono text-[9px] font-bold">
                            {activeDay.targetMuscles.length}
                          </span>
                        )}
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isMusclesPopoverOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Floating Dropdown Popover */}
                    {isMusclesPopoverOpen && (
                      <div 
                        ref={musclesPopoverDropdownRef}
                        className="fixed z-[100] p-2.5 rounded-xl bg-[#0b101b] border border-[#1c2738] shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150"
                        style={{
                          top: `${popoverCoords.top}px`,
                          left: `${popoverCoords.left}px`,
                          width: `${popoverCoords.width}px`
                        }}
                      >
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#16202e]">
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                            Select Muscles
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsMusclesPopoverOpen(false)}
                            className="text-[10px] font-semibold text-white hover:text-slate-300 cursor-pointer"
                          >
                            Done
                          </button>
                        </div>

                        <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                          {MUSCLE_GROUPS_BY_CATEGORY.map((group) => (
                            <div key={group.category} className="space-y-1">
                              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                                {group.category}
                              </span>
                              <div className="flex items-center gap-1 flex-wrap">
                                {group.muscles.map((muscle) => {
                                  const isSelected = (activeDay.targetMuscles || []).includes(muscle);
                                  return (
                                    <button
                                      key={muscle}
                                      type="button"
                                      onClick={() => toggleDayMuscle(muscle)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-white text-[#080c14] font-bold shadow-xs'
                                          : 'bg-[#05080e] text-slate-400 hover:text-white border border-[#16202e]'
                                      }`}
                                    >
                                      {muscle}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Metrics Footer */}
          <div className="p-3 border-t border-[#141b26] bg-[#090e17] flex items-center justify-between text-[10px] font-mono text-slate-400 flex-shrink-0">
            <span>Weekly: <strong className="text-white font-numeric">{volumeMetrics.totalWeeklySets} sets</strong></span>
            <span>Today: <strong className="text-white font-numeric">{volumeMetrics.activeDaySets} sets</strong></span>
          </div>
        </aside>

        {/* Right Main Canvas: Prescribed Exercises Studio */}
        <main className={`flex-1 flex-col bg-[#05080e] overflow-hidden min-w-0 ${
          mobileView === 'movements' ? 'flex' : 'hidden md:flex'
        }`}>
          
          {/* Canvas Sub-Header */}
          <div className="min-h-11 py-1.5 flex-shrink-0 px-3 sm:px-5 border-b border-[#141b26] bg-[#070a0f] flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Left: Day Title + Copy Day Action + Add Movement Action */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-wrap sm:flex-nowrap">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[150px] sm:max-w-xs">
                {activeDay?.dayName || `Day ${activeDayIndex + 1}`}
              </h3>

              {/* Day Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleDuplicateDay(activeDayIndex)}
                  disabled={days.length >= 7}
                  className="p-1.5 rounded-lg bg-[#080d16] border border-[#152030] text-slate-400 hover:text-white hover:bg-white/[0.06] hover:border-white/20 transition-all cursor-pointer disabled:opacity-25 disabled:pointer-events-none active:scale-95"
                  title="Duplicate this day and its prescribed movements"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDay(activeDayIndex)}
                    className="p-1.5 rounded-lg bg-[#080d16] border border-[#152030] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer active:scale-95"
                    title="Delete this day from split"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {!activeDay?.isRestDay && (
                <button
                  type="button"
                  onClick={() => setIsExercisePickerOpen(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#080c14] bg-white hover:bg-slate-100 transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5 flex-shrink-0"
                  title="Open Exercise Library Drawer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Movement</span>
                </button>
              )}
            </div>

            {/* Right: Total Split Movements Telemetry */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 flex-shrink-0">
              <span className="text-[11px] text-slate-400">
                Total Movements: <strong className="text-white font-numeric font-bold">{volumeMetrics.totalSplitMovements}</strong>
              </span>
            </div>
          </div>

          {/* Canvas Scrollable Exercise List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 custom-scrollbar">
            {activeDay?.isRestDay ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center rounded-xl bg-[#080c14] border border-[#141b26] space-y-2 select-none">
                <h4 className="text-sm font-bold text-white">Active Recovery / Rest Day</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Athlete is scheduled for systemic recovery, light mobility, and hydration routine.
                </p>
              </div>
            ) : (activeDay?.exercises || []).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-xl bg-[#080c14] border border-dashed border-[#16202e] space-y-3 select-none">
                <div>
                  <h4 className="text-sm font-bold text-white">No Movements Prescribed Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                    Click below to search the exercise library or create a custom movement for this day.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExercisePickerOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#080c14] bg-white hover:bg-slate-100 transition-all shadow-sm cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Movement to Day {activeDayIndex + 1}</span>
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Micro Telemetry Header */}
                <div className="hidden xl:grid grid-cols-12 gap-2 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold border-b border-[#141b26]/50 select-none">
                  <div className="col-span-5 flex items-center gap-2">Movement & Muscle</div>
                  <div className="col-span-1 text-center">Sets</div>
                  <div className="col-span-2 text-center">Reps</div>
                  <div className="col-span-1 text-center">RIR</div>
                  <div className="col-span-1 text-center">Rest</div>
                  <div className="col-span-2 text-right pr-2">Details & Actions</div>
                </div>

                {activeDay.exercises.map((item, exIdx) => (
                  <MovementCard
                    key={item.id}
                    item={item}
                    index={exIdx}
                    totalCount={activeDay.exercises.length}
                    isDragging={draggedExerciseIndex === exIdx}
                    isDragOver={dragOverExerciseIndex === exIdx && draggedExerciseIndex !== exIdx}
                    isExpanded={Boolean(expandedExerciseIds[item.id])}
                    onDragStart={() => handleDragStart(exIdx)}
                    onDragEnter={() => handleDragEnter(exIdx)}
                    onDragEnd={handleDragEnd}
                    onMoveUp={() => handleMoveExercise(exIdx, 'up')}
                    onMoveDown={() => handleMoveExercise(exIdx, 'down')}
                    onToggleExpand={() => toggleExerciseExpand(item.id)}
                    onUpdateExercise={(partial) => handleUpdateExercise(item.id, partial)}
                    onRemoveExercise={() => handleRemoveExercise(item.id)}
                    onOpenVideo={(url) => setActiveVideoUrl(url)}
                    onAddAlternative={() => handleAddAlternative(item.id)}
                    onUpdateAlternative={(altIdx, field, val) => handleUpdateAlternative(item.id, altIdx, field, val)}
                    onRemoveAlternative={(altIdx) => handleRemoveAlternative(item.id, altIdx)}
                  />
                ))}
              </>
            )}
          </div>
        </main>

        {/* 3. Slide-Over Drawer: Live Volume Stats & Muscle Breakdown */}
        <VolumeAnalyzerDrawer
          isOpen={isAnalyzerOpen}
          onClose={() => setIsAnalyzerOpen(false)}
          volumeMetrics={volumeMetrics}
        />

        {/* 4. Exercise Library Picker Drawer */}
        <ExercisePickerDrawer
          isOpen={isExercisePickerOpen}
          onClose={() => setIsExercisePickerOpen(false)}
          totalExercisesCount={exercises.length}
          pickerSearch={pickerSearch}
          onSearchChange={setPickerSearch}
          pickerMuscleFilter={pickerMuscleFilter}
          onMuscleFilterChange={setPickerMuscleFilter}
          filteredExercises={filteredExercises}
          onSelectExercise={handleAddExerciseToActiveDay}
          onOpenNewMovementModal={() => setIsNewMovementModalOpen(true)}
        />

        {/* 5. Create New Exercise Modal */}
        <NewMovementModal
          isOpen={isNewMovementModalOpen}
          onClose={() => setIsNewMovementModalOpen(false)}
          name={newExName}
          onNameChange={setNewExName}
          equipment={newExEquipment}
          onEquipmentChange={setNewExEquipment}
          muscle={newExMuscle}
          onMuscleChange={setNewExMuscle}
          cue={newExCue}
          onCueChange={setNewExCue}
          alternative={newExAlternative}
          onAlternativeChange={setNewExAlternative}
          onSubmit={handleCreateNewExerciseSubmit}
        />

        {/* 6. Video Preview Modal */}
        <VideoPreviewModal
          videoUrl={activeVideoUrl}
          onClose={() => setActiveVideoUrl(null)}
        />

      </div>
    </div>
  );
};
