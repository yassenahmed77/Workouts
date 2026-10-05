'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { User, WorkoutPlan } from '@/types';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { getExerciseProgressAnalysis } from '@/lib/progressEngine';
import { clientService } from '@/services/clientService';
import { sanitizeNotes } from '@/lib/sanitizer';

export type ClientDetailSubTab = 
  | 'overview' 
  | 'workout' 
  | 'nutrition' 
  | 'formchecks' 
  | 'checkins' 
  | 'logs' 
  | 'notes' 
  | 'timeline';

interface UseClientDetailOptions {
  client: User;
  initialSubTab?: ClientDetailSubTab;
}

/**
 * Headless Logic Hook for Client 360 Experience (Clean Architecture - Layer 2).
 * 
 * Extracts all business state, telemetry derivations, note mutations,
 * and subscription lifecycle calculations away from the presentation view.
 */
export function useClientDetail({
  client: propClient,
  initialSubTab = 'overview'
}: UseClientDetailOptions) {
  const { 
    users,
    getCheckInsForUser, 
    updateUserProfile, 
    getUserLogs, 
    getPlanForUser, 
    getDietPlanForUser, 
    updateUserNotes,
    getFormCheckVideosForUser 
  } = useGym();
  
  const { showToast } = useToast();

  // Resolve reactive client entity from state store
  const client = useMemo(() => {
    return users.find((u) => u.id === propClient.id) || propClient;
  }, [users, propClient]);

  // Tab & Scroll navigation
  const [activeSubTab, setActiveSubTab] = useState<ClientDetailSubTab>(initialSubTab);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleSelectSubTab = useCallback((tab: ClientDetailSubTab) => {
    setActiveSubTab(tab);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  // Modals & Graph navigation state
  const [isBrokenRecordsOpen, setIsBrokenRecordsOpen] = useState(false);
  const [selectedExerciseForGraph, setSelectedExerciseForGraph] = useState<string | undefined>(undefined);

  // Notes Modal state & actions
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [notesInput, setNotesInput] = useState(client.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    setNotesInput(client.notes || '');
  }, [client.notes]);

  const handleSaveNotes = useCallback(async () => {
    const cleanNotes = sanitizeNotes(notesInput);
    const validation = clientService.validateNoteUpdate({
      clientId: client.id,
      privateCoachNotes: cleanNotes
    });

    if (!validation.success) {
      showToast('Notes must be under 3000 characters', 'error');
      return;
    }

    setIsSavingNotes(true);
    try {
      await updateUserNotes(client.id, cleanNotes);
      showToast('Coach directives saved', 'success');
      setIsNotesModalOpen(false);
    } catch {
      showToast('Failed to save notes', 'error');
    } finally {
      setIsSavingNotes(false);
    }
  }, [notesInput, client.id, updateUserNotes, showToast]);

  // Inline Weight Edit state & actions
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState(String(client.weightKg));

  useEffect(() => {
    setWeightInput(String(client.weightKg));
  }, [client.weightKg]);

  const handleSaveWeight = useCallback(async () => {
    const val = parseFloat(weightInput);
    if (isNaN(val) || val < 30 || val > 300) {
      showToast('Weight must be between 30 and 300 kg', 'error');
      return;
    }

    try {
      await updateUserProfile(client.id, { weightKg: val });
      showToast(`Updated weight to ${val} kg`, 'success');
      setIsEditingWeight(false);
    } catch {
      showToast('Failed to update weight', 'error');
    }
  }, [weightInput, client.id, updateUserProfile, showToast]);

  // Form Check Videos & Pending count
  const clientVideos = useMemo(() => {
    return getFormCheckVideosForUser ? getFormCheckVideosForUser(client.id) : [];
  }, [getFormCheckVideosForUser, client.id]);

  const pendingFormChecksCount = useMemo(() => {
    return clientVideos.filter((v) => v.status === 'pending').length;
  }, [clientVideos]);

  // Check-ins & Pending count
  const clientCheckIns = useMemo(() => {
    return getCheckInsForUser(client.id);
  }, [getCheckInsForUser, client.id]);

  const pendingCheckInsCount = useMemo(() => {
    return clientCheckIns.filter((c) => !c.reviewed).length;
  }, [clientCheckIns]);

  // Dynamic Strength Progression & Overload Analysis
  const clientLogs = useMemo(() => getUserLogs(client.id), [getUserLogs, client.id]);
  const clientPlan = useMemo(() => getPlanForUser(client.id), [getPlanForUser, client.id]);
  const clientDiet = useMemo(() => getDietPlanForUser(client.id), [getDietPlanForUser, client.id, client.assignedDietPlanId]);

  const exerciseSummaries = useMemo(() => {
    return getExerciseProgressAnalysis(clientLogs, clientPlan);
  }, [clientLogs, clientPlan]);

  const prsCount = useMemo(() => {
    return exerciseSummaries.reduce(
      (sum, ex) => sum + (ex.allTimePRWeightKg > ex.firstWeightKg ? 1 : 0),
      0
    );
  }, [exerciseSummaries]);

  const totalCompoundOverloadDelta = useMemo(() => {
    return (
      Math.round(
        exerciseSummaries.reduce((sum, ex) => sum + Math.max(0, ex.netWeightGainKg), 0) * 10
      ) / 10
    );
  }, [exerciseSummaries]);

  // Dynamic Subscription Days Left
  const subDaysLeft = useMemo(() => {
    if (!client.subscription?.endDate) return null;
    const end = new Date(client.subscription.endDate);
    if (isNaN(end.getTime())) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }, [client.subscription]);

  // Direct WhatsApp Link
  const whatsappUrl = useMemo(() => {
    const formattedPhone = client.phone ? client.phone.replace(/[^0-9]/g, '') : null;
    return formattedPhone ? `https://wa.me/${formattedPhone}` : null;
  }, [client.phone]);

  return {
    client,
    activeSubTab,
    setActiveSubTab: handleSelectSubTab,
    scrollContainerRef,
    handleSelectSubTab,
    // Notes
    isNotesModalOpen,
    setIsNotesModalOpen,
    notesInput,
    setNotesInput,
    isSavingNotes,
    handleSaveNotes,
    // Weight
    isEditingWeight,
    setIsEditingWeight,
    weightInput,
    setWeightInput,
    handleSaveWeight,
    // Modals
    isBrokenRecordsOpen,
    setIsBrokenRecordsOpen,
    selectedExerciseForGraph,
    setSelectedExerciseForGraph,
    // Telemetry & Badges
    pendingFormChecksCount,
    pendingCheckInsCount,
    prsCount,
    totalCompoundOverloadDelta,
    subDaysLeft,
    whatsappUrl,
    exerciseSummaries
  };
}
