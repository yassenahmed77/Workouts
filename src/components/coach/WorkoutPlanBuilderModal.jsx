'use client';
import React from 'react';
import { ArrowLeft, Trash2, Copy, Plus, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { SelectDropdown } from '@/components/ui/SelectDropdown';
import { useWorkoutPlanBuilder } from '@/hooks/useWorkoutPlanBuilder';
import { VolumeAnalyzerDrawer } from './workout-builder/VolumeAnalyzerDrawer';
import { ExercisePickerDrawer } from './workout-builder/ExercisePickerDrawer';
import { NewMovementModal } from './workout-builder/NewMovementModal';
import { VideoPreviewModal } from './workout-builder/VideoPreviewModal';
import { MovementCard } from './workout-builder/MovementCard';
const MUSCLE_GROUPS_BY_CATEGORY = [
    {
        category: 'Upper Body',
        muscles: ['Chest', 'Back', 'Shoulders', 'Arms', 'Biceps', 'Triceps', 'Forearms', 'Traps']
    },
    {
        category: 'Lower Body',
        muscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves']
    },
    {
        category: 'Core & Other',
        muscles: ['Core', 'Full Body']
    }
];
export const WorkoutPlanBuilderModal = (props) => {
    const { isOpen, onClose, initialPlan } = props;
    const builder = useWorkoutPlanBuilder(props);
    if (!isOpen)
        return null;
    const { title, setTitle, description, setDescription, durationWeeks, setDurationWeeks, days, activeDay, activeDayIndex, setActiveDayIndex, assignToUserId, setAssignToUserId, trainees, targetAthlete, exercises, mobileView, setMobileView, isMusclesPopoverOpen, setIsMusclesPopoverOpen, musclesPopoverRef, musclesPopoverDropdownRef, popoverCoords, toggleDayMuscle, volumeMetrics, isAnalyzerOpen, setIsAnalyzerOpen, activeVideoUrl, setActiveVideoUrl, isExercisePickerOpen, setIsExercisePickerOpen, pickerMuscleFilter, setPickerMuscleFilter, pickerSearch, setPickerSearch, filteredExercises, draggedExerciseIndex, dragOverExerciseIndex, handleDragStart, handleDragEnter, handleDragEnd, handleMoveExercise, expandedExerciseIds, toggleExerciseExpand, isNewMovementModalOpen, setIsNewMovementModalOpen, newExName, setNewExName, newExEquipment, setNewExEquipment, newExMuscle, setNewExMuscle, newExCue, setNewExCue, newExAlternative, setNewExAlternative, handleCreateNewExerciseSubmit, handleAddDay, handleDuplicateDay, handleRemoveDay, handleUpdateActiveDay, handleAddExerciseToActiveDay, handleRemoveExercise, handleUpdateExercise, handleAddAlternative, handleUpdateAlternative, handleRemoveAlternative, handleSavePlan } = builder;
    return (<div className="fixed inset-0 z-50 bg-[var(--card-bg)] flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150 select-none text-slate-100 font-sans">
      
      {/* 1. Studio Edge-to-Edge Top Navigation Bar */}
      <header className="flex-shrink-0 border-b border-[var(--card-border)] bg-[var(--card-subtle-bg)] px-3 sm:px-5 py-2 z-30 flex items-center justify-between gap-3">
        {/* Left: Back Arrow, Title, Athlete Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-shrink-0">
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex-shrink-0" title="Close studio">
            <ArrowLeft className="w-4 h-4"/>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0 leading-none hidden md:inline">
              Split Studio
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0 hidden md:inline"/>
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[130px] lg:max-w-[200px] leading-none" title={title || 'Untitled Split'}>
              {title || 'Untitled Split'}
            </h2>
            {targetAthlete && (<span className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/10 text-[9.5px] font-mono font-bold flex-shrink-0 truncate max-w-[120px] sm:max-w-none leading-none hidden sm:inline-block">
                FOR {targetAthlete.name.toUpperCase()}
              </span>)}
          </div>
        </div>

        {/* Center: Days Navigation Segmented Bar (Desktop Only - lg:flex) */}
        <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center px-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex-shrink-0">
            {days.map((d, index) => {
            const isActive = index === activeDayIndex;
            const daySetsCount = d.isRestDay
                ? 0
                : (d.exercises || []).reduce((sum, ex) => sum + (Number(ex.sets) || 1), 0);
            return (<button key={d.id} type="button" onClick={() => setActiveDayIndex(index)} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                    ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'}`} title={`${d.dayName} (${daySetsCount} sets)`}>
                  <span>Day {index + 1}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${d.isRestDay
                    ? (isActive ? 'bg-white/[0.15] text-white' : 'bg-white/[0.04] text-slate-500')
                    : (isActive ? 'bg-white/[0.2] text-white' : 'bg-white/[0.06] text-slate-400')}`}>
                    {d.isRestDay ? 'Rest' : daySetsCount}
                  </span>
                </button>);
        })}

            {days.length < 7 && (<button type="button" onClick={handleAddDay} className="px-2 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer active:scale-95 flex-shrink-0" title="Add Training Day (Up to 7 Days)">
                +
              </button>)}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button type="button" onClick={() => setIsAnalyzerOpen(!isAnalyzerOpen)} className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer" title="Toggle Volume Analyzer">
            Volume Analyzer
          </button>

          <button type="button" onClick={onClose} className="hidden sm:inline-block px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer">
            Cancel
          </button>

          {/* Mobile-Only Day Settings Trigger (Moved up to top header to free full width for Days row!) */}
          <button type="button" onClick={() => setMobileView(mobileView === 'settings' ? 'movements' : 'settings')} className={`flex md:hidden items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${mobileView === 'settings'
            ? 'bg-white/[0.12] border border-white/20 text-white font-bold shadow-xs'
            : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white'}`} title="Toggle Day Settings">
            {mobileView === 'settings' ? (<>
                <X className="w-3.5 h-3.5 text-slate-300"/>
                <span>Movements</span>
              </>) : (<>
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400"/>
                <span>Day Settings</span>
              </>)}
          </button>
        </div>
      </header>

      {/* Mobile-Only Dedicated Days Row (w-fit hugs content & extends dynamically; compact spacing fits all 7 days together) */}
      <div className="flex md:hidden items-center px-2.5 py-1.5 border-b border-[var(--card-border)] bg-[var(--card-subtle-bg)] flex-shrink-0 overflow-x-auto no-scrollbar">
        <div className="inline-flex items-center gap-0.5 xs:gap-1 p-0.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] w-fit flex-shrink-0">
          {days.map((d, index) => {
            const isActive = index === activeDayIndex;
            const daySetsCount = d.isRestDay
                ? 0
                : (d.exercises || []).reduce((sum, ex) => sum + (Number(ex.sets) || 1), 0);
            return (<button key={d.id} type="button" onClick={() => setActiveDayIndex(index)} className={`flex items-center gap-1 px-1.5 xs:px-2 py-0.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${isActive
                    ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'}`} title={`${d.dayName} (${daySetsCount} sets)`}>
                <span>D{index + 1}</span>
                <span className={`text-[8.5px] px-1 py-0.2 rounded font-mono font-bold ${d.isRestDay
                    ? (isActive ? 'bg-white/[0.15] text-white' : 'bg-white/[0.04] text-slate-500')
                    : (isActive ? 'bg-white/[0.2] text-white' : 'bg-white/[0.06] text-slate-400')}`}>
                  {d.isRestDay ? 'Rest' : daySetsCount}
                </span>
              </button>);
        })}

          {days.length < 7 && (<button type="button" onClick={handleAddDay} className="px-1.5 xs:px-2 py-0.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer active:scale-95 flex-shrink-0" title="Add Training Day">
              +
            </button>)}
        </div>
      </div>

      {/* 2. Studio Body: Responsive 2-Column Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full relative">
        
        {/* Left Sidebar: Settings & Day Configuration (Narrower on tablet to give exercise canvas more room) */}
        <aside className={`w-full md:w-[260px] lg:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col h-full overflow-hidden ${mobileView === 'settings' ? 'flex flex-1 md:flex-none' : 'hidden md:flex'}`}>
          {/* Mobile-Only Header inside Day Settings with 'X' return button */}
          <div className="flex md:hidden items-center justify-between px-3 py-2 border-b border-[var(--card-border)] bg-[var(--card-subtle-bg)] flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400"/>
              <span className="text-xs font-bold text-white">Day Settings</span>
              <span className="text-[10px] font-mono text-slate-400">({activeDay?.dayName || `Day ${activeDayIndex + 1}`})</span>
            </div>
            <button type="button" onClick={() => setMobileView('movements')} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center gap-1" title="Return to Prescribed Movements">
              <span className="text-[10px] font-medium text-slate-400">Back</span>
              <X className="w-4 h-4"/>
            </button>
          </div>
          {/* Tablet-Only Header: Days Navigation at the top of Left Navbar so Coach can freely add 7 days */}
          <div className="hidden md:flex lg:hidden px-3 py-2 border-b border-[var(--card-border)] bg-[var(--card-subtle-bg)] flex-col gap-1.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Split Days ({days.length}/7)
              </span>
              {days.length < 7 && (<button type="button" onClick={handleAddDay} className="px-2 py-0.5 rounded-md bg-[var(--main-color)]/20 hover:bg-[var(--main-color)]/30 text-[var(--main-color)] text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1" title="Add Training Day">
                  <Plus className="w-3 h-3 stroke-[2.5]"/>
                  <span>Add Day</span>
                </button>)}
            </div>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-0.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
              {days.map((d, index) => {
            const isActive = index === activeDayIndex;
            const daySetsCount = d.isRestDay
                ? 0
                : (d.exercises || []).reduce((sum, ex) => sum + (Number(ex.sets) || 1), 0);
            return (<button key={d.id} type="button" onClick={() => setActiveDayIndex(index)} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${isActive
                    ? 'bg-white/[0.1] border border-white/20 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'}`} title={`${d.dayName} (${daySetsCount} sets)`}>
                    <span>Day {index + 1}</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${d.isRestDay
                    ? (isActive ? 'bg-white/[0.15] text-white' : 'bg-white/[0.04] text-slate-500')
                    : (isActive ? 'bg-white/[0.2] text-white' : 'bg-white/[0.06] text-slate-400')}`}>
                      {d.isRestDay ? 'Rest' : daySetsCount}
                    </span>
                  </button>);
        })}
            </div>
          </div>

          {/* Scrollable Form Cards */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-3.5 space-y-3">
            
            {/* Card 1: Split Directives & Target Client */}
            <div className="p-3 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Split Settings
              </span>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hypertrophy Split" className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[var(--main-color)] font-medium"/>
              </div>

              <div className="grid grid-cols-2 gap-2 items-start">
                <div className="relative z-30">
                  <SelectDropdown label="Athlete" value={assignToUserId} onChange={(val) => setAssignToUserId(val)} options={trainees.map((t) => ({ value: t.id, label: t.name }))} placeholder="Select Athlete..."/>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">Duration</label>
                  <div className="h-[34px] flex items-center justify-between px-2.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] focus-within:border-[var(--main-color)]">
                    <input type="number" min="1" max="52" value={durationWeeks} onChange={(e) => setDurationWeeks(Number(e.target.value))} className="w-full text-xs font-numeric font-bold text-white bg-transparent focus:outline-none"/>
                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">wks</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">Progression Directives</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. 1-2 RIR in compound lifts, strict rest" className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-[var(--main-color)]"/>
              </div>
            </div>

            {/* Card 2: Active Day Focus & Recovery Toggle */}
            {activeDay && (<div className="p-3 rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-2.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold truncate whitespace-nowrap">
                    Day {activeDayIndex + 1}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {days.length > 1 && (<button type="button" onClick={() => handleRemoveDay(activeDayIndex)} className="p-1 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer shrink-0" title="Delete this day from split">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>)}
                    <button type="button" onClick={() => handleUpdateActiveDay({ isRestDay: !activeDay.isRestDay })} className={`px-2 py-0.5 rounded-md text-[9.5px] font-mono uppercase font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${activeDay.isRestDay
                ? 'bg-white/[0.1] border-white/20 text-white shadow-xs'
                : 'bg-[var(--input-bg)] border-[var(--input-border)] text-slate-400 hover:text-white hover:border-white/20'}`}>
                      {activeDay.isRestDay ? 'Rest' : 'Training'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 font-semibold">Focus / Day Name</label>
                  <input type="text" value={activeDay.dayName} onChange={(e) => handleUpdateActiveDay({ dayName: e.target.value })} placeholder="e.g. Day 1: Chest & Shoulders" className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white font-semibold focus:outline-none focus:border-[var(--main-color)]"/>
                </div>

                {/* Target Muscles Popover Trigger */}
                {!activeDay.isRestDay && (<div className="relative pt-1 border-t border-[var(--card-border)]" ref={musclesPopoverRef}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Target Muscles
                      </label>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {(activeDay.targetMuscles || []).length} active
                      </span>
                    </div>

                    <button type="button" onClick={() => setIsMusclesPopoverOpen(!isMusclesPopoverOpen)} className="w-full h-8 px-2.5 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] hover:border-[var(--main-color)] text-xs text-left flex items-center justify-between transition-colors cursor-pointer">
                      <span className="truncate text-xs font-medium text-slate-200">
                        {(activeDay.targetMuscles || []).length > 0
                    ? activeDay.targetMuscles.join(', ')
                    : 'Select target muscles...'}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                        {(activeDay.targetMuscles || []).length > 0 && (<span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300 font-mono text-[9px] font-bold">
                            {activeDay.targetMuscles.length}
                          </span>)}
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isMusclesPopoverOpen ? 'rotate-180' : ''}`}/>
                      </div>
                    </button>

                    {/* Floating Dropdown Popover */}
                    {isMusclesPopoverOpen && (<div ref={musclesPopoverDropdownRef} className="fixed z-[100] p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150" style={{
                        top: `${popoverCoords.top}px`,
                        left: `${popoverCoords.left}px`,
                        width: `${popoverCoords.width}px`
                    }}>
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[var(--card-border)]">
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                            Select Muscles
                          </span>
                          <button type="button" onClick={() => setIsMusclesPopoverOpen(false)} className="text-[10px] font-semibold text-white hover:text-slate-300 cursor-pointer">
                            Done
                          </button>
                        </div>

                        <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                          {MUSCLE_GROUPS_BY_CATEGORY.map((group) => (<div key={group.category} className="space-y-1">
                              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                                {group.category}
                              </span>
                              <div className="flex items-center gap-1 flex-wrap">
                                {group.muscles.map((muscle) => {
                            const isSelected = (activeDay.targetMuscles || []).includes(muscle);
                            return (<button key={muscle} type="button" onClick={() => toggleDayMuscle(muscle)} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${isSelected
                                    ? 'bg-white text-[var(--card-bg)] font-bold shadow-xs'
                                    : 'bg-[var(--input-bg)] text-slate-400 hover:text-white border border-[var(--input-border)]'}`}>
                                      {muscle}
                                    </button>);
                        })}
                              </div>
                            </div>))}
                        </div>
                      </div>)}
                  </div>)}
              </div>)}
          </div>

          {/* Publish Split Action in Left Sidebar (Tablet & Desktop: md and above, full width above metrics) */}
          <div className="p-3 border-t border-[var(--card-border)] bg-[var(--card-bg)] hidden md:block flex-shrink-0">
            <button type="button" onClick={handleSavePlan} className="gym-btn-primary w-full text-xs font-bold py-2 shadow-sm cursor-pointer">
              {initialPlan ? 'Save Split' : 'Publish Split'}
            </button>
          </div>

          {/* Quick Metrics Footer */}
          <div className="p-3 border-t border-[var(--card-border)] bg-[var(--card-subtle-bg)] flex items-center justify-between text-[10px] font-mono text-slate-400 flex-shrink-0">
            <span>Weekly: <strong className="text-white font-numeric">{volumeMetrics.totalWeeklySets} sets</strong></span>
            <span>Today: <strong className="text-white font-numeric">{volumeMetrics.activeDaySets} sets</strong></span>
          </div>
        </aside>

        {/* Right Main Canvas: Prescribed Exercises Studio */}
        <main className={`flex-1 flex-col bg-[var(--card-bg)] overflow-hidden min-w-0 ${mobileView === 'movements' ? 'flex' : 'hidden md:flex'}`}>
          
          {/* Canvas Sub-Header */}
          <div className="min-h-10 py-1.5 flex-shrink-0 px-2.5 sm:px-5 border-b border-[var(--card-border)] bg-[var(--card-subtle-bg)] flex items-center justify-between gap-2">
            {/* Left: Day Title (takes remaining space so long day names are fully visible) */}
            <div className="flex items-center min-w-0 flex-1 mr-1 sm:mr-2">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate" title={activeDay?.dayName || `Day ${activeDayIndex + 1}`}>
                {activeDay?.dayName || `Day ${activeDayIndex + 1}`}
              </h3>
            </div>

            {/* Right: Actions Group (Copy, Delete, and Compact Add Movement) */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              <button type="button" onClick={() => handleDuplicateDay(activeDayIndex)} disabled={days.length >= 7} className="p-1 sm:p-1.5 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white hover:bg-white/[0.06] hover:border-white/20 transition-all cursor-pointer disabled:opacity-25 disabled:pointer-events-none active:scale-95" title="Duplicate this day and its prescribed movements">
                <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>
              </button>

              {days.length > 1 && (<button type="button" onClick={() => handleRemoveDay(activeDayIndex)} className="p-1 sm:p-1.5 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer active:scale-95" title="Delete this day from split">
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>
                </button>)}

              <span className="text-[11px] font-mono text-slate-400 hidden lg:inline mr-0.5">
                Total: <strong className="text-white font-numeric font-bold">{volumeMetrics.totalSplitMovements}</strong>
              </span>

              {!activeDay?.isRestDay && (<button type="button" onClick={() => setIsExercisePickerOpen(true)} className="gym-btn-primary !h-6 sm:!h-7 !px-2 sm:!px-2.5 !text-[10px] sm:!text-xs flex items-center justify-center gap-1 flex-shrink-0 font-bold" title="Add Movement">
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]"/>
                  <span>Add Movement</span>
                </button>)}
            </div>
          </div>

          {/* Canvas Scrollable Exercise List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 custom-scrollbar">
            {activeDay?.isRestDay ? (<div className="h-full flex flex-col items-center justify-center p-8 text-center rounded-xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-2 select-none">
                <h4 className="text-sm font-bold text-white">Active Recovery / Rest Day</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Athlete is scheduled for systemic recovery, light mobility, and hydration routine.
                </p>
              </div>) : (activeDay?.exercises || []).length === 0 ? (<div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-xl bg-[var(--card-subtle-bg)] border border-dashed border-[var(--card-border)] space-y-3 select-none">
                <div>
                  <h4 className="text-sm font-bold text-white">No Movements Prescribed Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                    Click below to search the exercise library or create a custom movement for this day.
                  </p>
                </div>
                <button type="button" onClick={() => setIsExercisePickerOpen(true)} className="gym-btn-primary text-xs flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]"/>
                  <span>Add Movement to Day {activeDayIndex + 1}</span>
                </button>
              </div>) : (<>
                {activeDay.exercises.map((item, exIdx) => (<MovementCard key={item.id} item={item} index={exIdx} totalCount={activeDay.exercises.length} isDragging={draggedExerciseIndex === exIdx} isDragOver={dragOverExerciseIndex === exIdx && draggedExerciseIndex !== exIdx} isExpanded={Boolean(expandedExerciseIds[item.id])} onDragStart={() => handleDragStart(exIdx)} onDragEnter={() => handleDragEnter(exIdx)} onDragEnd={handleDragEnd} onMoveUp={() => handleMoveExercise(exIdx, 'up')} onMoveDown={() => handleMoveExercise(exIdx, 'down')} onToggleExpand={() => toggleExerciseExpand(item.id)} onUpdateExercise={(partial) => handleUpdateExercise(item.id, partial)} onRemoveExercise={() => handleRemoveExercise(item.id)} onOpenVideo={(url) => setActiveVideoUrl(url)} onAddAlternative={() => handleAddAlternative(item.id)} onUpdateAlternative={(altIdx, field, val) => handleUpdateAlternative(item.id, altIdx, field, val)} onRemoveAlternative={(altIdx) => handleRemoveAlternative(item.id, altIdx)}/>))}
              </>)}
          </div>
        </main>

        {/* 3. Slide-Over Drawer: Live Volume Stats & Muscle Breakdown */}
        <VolumeAnalyzerDrawer isOpen={isAnalyzerOpen} onClose={() => setIsAnalyzerOpen(false)} volumeMetrics={volumeMetrics}/>

        {/* 4. Exercise Library Picker Drawer */}
        <ExercisePickerDrawer isOpen={isExercisePickerOpen} onClose={() => setIsExercisePickerOpen(false)} totalExercisesCount={exercises.length} pickerSearch={pickerSearch} onSearchChange={setPickerSearch} pickerMuscleFilter={pickerMuscleFilter} onMuscleFilterChange={setPickerMuscleFilter} filteredExercises={filteredExercises} onSelectExercise={handleAddExerciseToActiveDay} onOpenNewMovementModal={() => setIsNewMovementModalOpen(true)}/>

        {/* 5. Create New Exercise Modal (Shared ExerciseFormModal Component) */}
        <NewMovementModal isOpen={isNewMovementModalOpen} onClose={() => setIsNewMovementModalOpen(false)} onSubmitMovement={handleCreateNewExerciseSubmit}/>

        {/* 6. Video Preview Modal */}
        <VideoPreviewModal videoUrl={activeVideoUrl} onClose={() => setActiveVideoUrl(null)}/>

      </div>

      {/* Mobile-Only Fixed Bottom Dock / Action Bar (Thumb-Friendly, eliminates top 3-button stack) */}
      <div className="flex md:hidden p-3 border-t border-[var(--card-border)] bg-[var(--card-subtle-bg)]/95 backdrop-blur-md flex-shrink-0 z-30 pb-[max(0.75rem,var(--sab))]">
        <button type="button" onClick={handleSavePlan} className="gym-btn-primary w-full py-2.5 text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]">
          <span>{initialPlan ? 'Save Split' : 'Publish Split'}</span>
        </button>
      </div>
    </div>);
};
