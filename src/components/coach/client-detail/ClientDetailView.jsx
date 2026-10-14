'use client';
import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { ClientOverviewTab } from './ClientOverviewTab';
import { ClientCheckInsTab } from './ClientCheckInsTab';
import { ClientNutritionTab } from './ClientNutritionTab';
import { ClientWorkoutTab } from './ClientWorkoutTab';
import { ClientLogsTab } from './ClientLogsTab';
import { ClientNotesTab } from './ClientNotesTab';
import { ClientTimelineTab } from './ClientTimelineTab';
import { ClientFormChecksTab } from './ClientFormChecksTab';
import { BrokenRecordsModal } from './BrokenRecordsModal';
import { SegmentedTabs, ErrorBoundary } from '@/components/ui';
import { useClientDetail } from '@/hooks/useClientDetail';
/**
 * ClientDetailView (Clean Architecture - Presentation Layer)
 *
 * Pure presentation component. All business logic, state machines,
 * and calculations are encapsulated inside the headless `useClientDetail` hook.
 */
export const ClientDetailView = ({ client: propClient, initialSubTab = 'overview', onBack, onOpenAssignPlan, onOpenPlanBuilderForUser, onSwitchToTrainee }) => {
    const { client, activeSubTab, setActiveSubTab, scrollContainerRef, handleSelectSubTab, isNotesModalOpen, setIsNotesModalOpen, notesInput, setNotesInput, isSavingNotes, handleSaveNotes, isEditingWeight, setIsEditingWeight, weightInput, setWeightInput, handleSaveWeight, isBrokenRecordsOpen, setIsBrokenRecordsOpen, selectedExerciseForGraph, setSelectedExerciseForGraph, pendingFormChecksCount, pendingCheckInsCount, prsCount, totalCompoundOverloadDelta, subDaysLeft, whatsappUrl, exerciseSummaries } = useClientDetail({ client: propClient, initialSubTab });
    // Escape key listener for Notes Modal
    React.useEffect(() => {
        if (!isNotesModalOpen)
            return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape')
                setIsNotesModalOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isNotesModalOpen, setIsNotesModalOpen]);
    return (<ErrorBoundary fallbackTitle="Unable to render Client 360 profile">
      <div className="flex flex-col h-full space-y-1.5 w-full max-w-none select-none overflow-hidden">
        {/* 1. ZONE 1: Ultra-Slim Executive Command Bar (Typography-First, Zero Banner Bloat) */}
        <div className="flex items-center justify-between fluid-gap-controls fluid-card-p rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex-shrink-0">
        {/* Left: Back + Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button type="button" onClick={onBack} className="gym-btn-secondary gym-btn-sm">
            <ArrowLeft className="w-3.5 h-3.5"/>
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            {client.avatarUrl ? (<img src={client.avatarUrl} alt={client.name} className="w-6 h-6 rounded-md object-cover border border-white/10 flex-shrink-0"/>) : (<div className="w-6 h-6 rounded-md bg-white/[0.06] border border-white/10 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 font-mono">
                {client.avatarText || client.name.substring(0, 2).toUpperCase()}
              </div>)}

            <h2 className="gym-heading-card truncate">
              {client.name}
            </h2>

            <span className="gym-delta-neutral text-[10px]">
              <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`}/>
              <span className="capitalize">{client.status}</span>
            </span>
          </div>
        </div>

        {/* Center: The Unified Telemetry Capsule (Linear-Grade Segmented Capsule) */}
        <div className="hidden md:flex items-center rounded-lg bg-[var(--bg-main)] border border-[var(--card-border)] divide-x divide-[var(--card-border)] text-xs font-mono overflow-hidden shadow-inner">
          {/* Height */}
          {client.heightCm > 0 && (<div className="px-2.5 py-1 flex items-center gap-1">
              <span className="text-slate-500 text-[10px]">H:</span>
              <span className="text-slate-200 font-semibold">{client.heightCm}cm</span>
            </div>)}

          {/* Current Weight */}
          <div className="px-2.5 py-1 flex items-center gap-1">
            <span className="text-slate-500 text-[10px]">W:</span>
            <span className="gym-num text-white">{client.weightKg}kg</span>
          </div>

          {/* Goal Weight (Zero Arrows) */}
          {client.targetWeightKg && client.targetWeightKg !== client.weightKg && (<div className="px-2.5 py-1 flex items-center gap-1">
              <span className="text-slate-500 text-[10px]">Goal:</span>
              <span className="text-[var(--main-color)] font-semibold">{client.targetWeightKg}kg</span>
            </div>)}

          {/* Demographics */}
          {(client.age || client.gender) && (<div className="px-2.5 py-1 text-slate-400 flex items-center gap-1">
              {client.age && <span>{client.age}y</span>}
              {client.age && client.gender && <span className="text-slate-600">•</span>}
              {client.gender && <span>{client.gender === 'Female' ? 'F' : 'M'}</span>}
            </div>)}

          {/* Goal */}
          {client.goal && (<div className="px-2.5 py-1 text-slate-300 font-sans text-xs truncate max-w-[130px]" title={client.goal}>
              {client.goal.replace(' & Conditioning', '').replace(' / Muscle Gain', '')}
            </div>)}

          {/* Subscription */}
          {client.subscription && (<div className="px-2.5 py-1 flex items-center gap-1.5">
              <span className="text-slate-300 truncate max-w-[110px]">
                {client.subscription.planType?.replace(' Coaching', '') || 'VIP'}
              </span>
              {subDaysLeft !== null && (<span className={`text-[10px] font-bold ${subDaysLeft <= 7 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {subDaysLeft}d
                </span>)}
            </div>)}
        </div>

        {/* Right: Quick Directives & Actions (Pure Clean Typography) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {whatsappUrl && (<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="gym-btn-secondary gym-btn-sm">
              WhatsApp
            </a>)}

          <button type="button" onClick={() => setIsNotesModalOpen(true)} className="gym-btn-secondary gym-btn-sm relative">
            <span>Notes</span>
            {client.notes && client.notes.trim().length > 0 && (<span className="w-1.5 h-1.5 rounded-full bg-[var(--main-color)] ml-1.5 inline-block"/>)}
          </button>

          <button type="button" onClick={() => onSwitchToTrainee(client.id)} className="gym-btn-primary gym-btn-sm">
            Athlete View
          </button>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs Strip (Clean Linear-grade Typography, No Icon Clutter, No Text Clipping) */}
      <SegmentedTabs items={[
            { key: 'overview', label: 'Overview' },
            { key: 'workout', label: 'Workout Plan' },
            { key: 'nutrition', label: 'Diet Plan' },
            { key: 'formchecks', label: 'Form Checks', badge: pendingFormChecksCount },
            { key: 'checkins', label: 'Check-ins', badge: pendingCheckInsCount },
            { key: 'timeline', label: 'Timeline' },
            { key: 'logs', label: 'Exercise History' },
            { key: 'notes', label: 'Notes' }
        ]} value={activeSubTab} onChange={(key) => handleSelectSubTab(key)} variant="glass" className="flex-shrink-0 bg-[var(--card-bg)] border-[var(--card-border)]"/>

      {/* 3. Active Tab Content Rendering */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-0.5">
        {activeSubTab === 'overview' && (<ClientOverviewTab client={client} onNavigateSubTab={(tab, exerciseName) => {
                if (exerciseName)
                    setSelectedExerciseForGraph(exerciseName);
                setActiveSubTab(tab);
            }} onOpenAssignPlan={onOpenAssignPlan} onOpenNotes={() => setIsNotesModalOpen(true)}/>)}
        {activeSubTab === 'formchecks' && <ClientFormChecksTab client={client}/>}
        {activeSubTab === 'checkins' && <ClientCheckInsTab client={client}/>}
        {activeSubTab === 'workout' && (<ClientWorkoutTab client={client} onOpenPlanBuilderForUser={onOpenPlanBuilderForUser}/>)}
        {activeSubTab === 'nutrition' && <ClientNutritionTab client={client}/>}
        {activeSubTab === 'timeline' && <ClientTimelineTab client={client}/>}
        {activeSubTab === 'logs' && (<ClientLogsTab client={client} initialExerciseName={selectedExerciseForGraph}/>)}
        {activeSubTab === 'notes' && <ClientNotesTab client={client}/>}
      </div>

      {/* Broken Records & Milestones Modal */}
      <BrokenRecordsModal client={client} isOpen={isBrokenRecordsOpen} onClose={() => setIsBrokenRecordsOpen(false)} summaries={exerciseSummaries} onViewExerciseGraph={(exerciseName) => {
            setSelectedExerciseForGraph(exerciseName);
            setActiveSubTab('logs');
        }}/>

      {/* Real Notepad / Coach Directives Modal */}
      {isNotesModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150" onClick={(e) => {
                if (e.target === e.currentTarget)
                    setIsNotesModalOpen(false);
            }}>
          <div className="w-full max-w-lg rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            {/* Notes Header */}
            <div className="p-3.5 sm:p-4 bg-[var(--card-subtle-bg)] border-b border-[var(--card-border)] flex items-center justify-between">
              <div>
                <h3 className="gym-heading-section text-white tracking-wide">
                  Coach Notes
                </h3>
                <p className="text-[11px] font-mono text-[var(--main-color)] font-medium">
                  {client.name}
                </p>
              </div>
              <button type="button" onClick={() => setIsNotesModalOpen(false)} className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer" title="Close">
                <X className="w-3.5 h-3.5"/>
              </button>
            </div>

            {/* Notes Body */}
            <div className="p-4 sm:p-5 bg-[var(--bg-main)] relative">
              <div className="relative rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] overflow-hidden focus-within:border-[var(--main-color)]/40 transition-colors">
                <div className="absolute left-3.5 top-0 bottom-0 w-[1px] bg-red-500/20 pointer-events-none"/>
                <textarea value={notesInput} onChange={(e) => setNotesInput(e.target.value)} placeholder={`Write coach notes for ${client.name}...`} rows={8} className="w-full py-3.5 pl-6 pr-3 bg-transparent text-xs sm:text-[13px] text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-sans leading-relaxed custom-scrollbar" autoFocus/>
              </div>
            </div>

            {/* Notes Bottom Action Bar */}
            <div className="px-4 py-3 bg-[var(--card-subtle-bg)] border-t border-[var(--card-border)] flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Visible to coach only
              </span>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setIsNotesModalOpen(false)} className="gym-btn-ghost text-xs">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveNotes} disabled={isSavingNotes} className="gym-btn-primary text-xs">
                  <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>)}
    </div>
  </ErrorBoundary>);
};
