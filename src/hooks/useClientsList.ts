'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { User, WorkoutPlan } from '@/types';
import { clientService } from '@/services/clientService';

export type AthleteComputedStatus = 
  | 'active' 
  | 'needs_plan' 
  | 'needs_diet' 
  | 'needs_setup' 
  | 'on_hold';

/**
 * Headless Hook for Clients Directory (Clean Architecture - Layer 2).
 * 
 * Encapsulates all search filtering, multi-criteria sorting, status evaluations,
 * pagination math, and optimistic deletion with "Undo" safety.
 */
export function useClientsList() {
  const { 
    users, 
    currentUser,
    plans, 
    dietPlans, 
    logs, 
    getUserLogs, 
    getCheckInsForUser,
    deleteUser,
    updateUserProfile,
    getDietPlanForUser
  } = useGym();
  
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AthleteComputedStatus>('all');
  const [planFilter, setPlanFilter] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'weight' | 'adherence'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingTrainee, setEditingTrainee] = useState<User | null>(null);
  const [assignDietTrainee, setAssignDietTrainee] = useState<User | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [menuCoords, setMenuCoords] = useState<{
    top?: number;
    bottom?: number;
    right: number;
    openUpwards: boolean;
  } | null>(null);

  // Close floating menu on outside scroll or window resize
  useEffect(() => {
    if (!activeActionMenuId) return;
    const handleClose = () => {
      setActiveActionMenuId(null);
      setMenuCoords(null);
    };
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [activeActionMenuId]);

  // Filter only athletes/trainees scoped to coach (multi-tenant IDOR protection)
  const trainees = useMemo(() => {
    const coachId = currentUser?.role === 'coach' ? currentUser.id : undefined;
    return clientService.getTrainees(users, coachId);
  }, [users, currentUser]);

  // Calculate real workout completion against weekly plan
  const getWorkoutWeeklyProgress = useCallback((trainee: User) => {
    const assignedPlan = plans.find((p) => p.id === trainee.assignedPlanId);
    if (!assignedPlan) {
      return {
        completedDays: 0,
        targetDays: 0,
        workoutPct: 0,
        hasPlan: false,
        label: 'No Plan'
      };
    }

    const targetDays = assignedPlan.daysPerWeek || assignedPlan.days?.length || 4;
    
    // Check recent logs (last 7 days)
    const userLogs = getUserLogs ? getUserLogs(trainee.id) : (logs || []).filter((l) => l.userId === trainee.id);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = userLogs.filter((l) => new Date(l.date).getTime() >= sevenDaysAgo.getTime());

    let completedDays = recentLogs.length;

    // Fallback if logs are historical/mock: extract day from currentSplitProgress
    if (completedDays === 0 && trainee.currentSplitProgress) {
      const match = trainee.currentSplitProgress.match(/Day\s*(\d+)/i);
      if (match && match[1]) {
        completedDays = parseInt(match[1], 10);
      } else if (userLogs.length > 0) {
        completedDays = ((userLogs.length - 1) % targetDays) + 1;
      }
    }

    completedDays = Math.min(targetDays, Math.max(0, completedDays));
    const workoutPct = targetDays > 0 ? Math.round((completedDays / targetDays) * 100) : 0;

    return {
      completedDays,
      targetDays,
      workoutPct,
      hasPlan: true,
      label: `${completedDays}/${targetDays} Days`
    };
  }, [plans, getUserLogs, logs]);

  // Compute clean, unified athlete status with calm, non-AI micro-indicators
  const getAthleteStatus = useCallback((trainee: User) => {
    const basePill = 'bg-[#0b1018] border-[#161f2e] text-[#cbd5e1]';

    if (trainee.status === 'on_hold') {
      return {
        key: 'on_hold' as AthleteComputedStatus,
        label: 'On Hold',
        dot: 'bg-rose-400/60',
        pillClass: basePill
      };
    }

    const hasPlan = Boolean(trainee.assignedPlanId);
    const hasDiet = Boolean(trainee.assignedDietPlanId);

    if (hasPlan && hasDiet) {
      return {
        key: 'active' as AthleteComputedStatus,
        label: 'All Set',
        dot: 'bg-emerald-400/60',
        pillClass: basePill
      };
    }

    if (!hasPlan && !hasDiet) {
      return {
        key: 'needs_setup' as AthleteComputedStatus,
        label: 'Needs Setup',
        dot: 'bg-[#64748b]',
        pillClass: basePill
      };
    }

    if (!hasPlan) {
      return {
        key: 'needs_plan' as AthleteComputedStatus,
        label: 'Needs Plan',
        dot: 'bg-[#64748b]',
        pillClass: basePill
      };
    }

    return {
      key: 'needs_diet' as AthleteComputedStatus,
      label: 'Needs Diet',
      dot: 'bg-[#64748b]',
      pillClass: basePill
    };
  }, []);

  // Attention formatting with quiet, restrained micro-indicators
  const formatSimpleAttention = useCallback((trainee: User, traineeCheckIns: any[]) => {
    const note = trainee.attentionNote;
    if (note) {
      const raw = note.label.toLowerCase();
      if (raw.includes('check-in') && (raw.includes('overdue') || raw.includes('late') || raw.includes('no'))) {
        return {
          dot: 'bg-rose-400/60',
          label: 'Late Check-in',
          timeframe: note.timeframe ? `${note.timeframe} late` : undefined
        };
      }
      if (raw.includes('physique') || raw.includes('photo')) {
        return {
          dot: 'bg-[#64748b]',
          label: 'Photos Due',
          timeframe: note.timeframe ? `In ${note.timeframe}` : undefined
        };
      }
      if (raw.includes('nutrition') || raw.includes('diet')) {
        if (raw.includes('end') || raw.includes('expir')) {
          return {
            dot: 'bg-[#64748b]',
            label: 'Diet Ending',
            timeframe: note.timeframe ? `In ${note.timeframe}` : undefined
          };
        }
        return {
          dot: 'bg-amber-400/60',
          label: 'Diet Off Track',
          timeframe: note.timeframe || undefined
        };
      }
      if (raw.includes('plan') && (raw.includes('end') || raw.includes('expir'))) {
        return {
          dot: 'bg-[#64748b]',
          label: 'Plan Ending',
          timeframe: note.timeframe ? `In ${note.timeframe}` : undefined
        };
      }
      if (raw.includes('good') || raw.includes('no attention') || raw === 'none') {
        return {
          dot: null,
          label: 'All Good'
        };
      }
      return {
        dot: 'bg-[#64748b]',
        label: note.label,
        timeframe: note.timeframe
      };
    }

    if (traineeCheckIns && traineeCheckIns.some((c) => !c.reviewed)) {
      return {
        dot: 'bg-amber-400/60',
        label: 'Late Check-in',
        timeframe: 'Needs review'
      };
    }

    return {
      dot: null,
      label: 'All Good'
    };
  }, []);

  // Filtered & sorted roster
  const filteredTrainees = useMemo(() => {
    const list = trainees.filter((t) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = 
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        (t.phone && t.phone.toLowerCase().includes(q)) ||
        (t.goal && t.goal.toLowerCase().includes(q));

      const statusInfo = getAthleteStatus(t);
      const matchesStatus = statusFilter === 'all' || statusFilter === statusInfo.key;

      const matchesPlan = 
        planFilter === 'all' ||
        (planFilter === 'none' && !t.assignedPlanId) ||
        t.assignedPlanId === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });

    return list.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'weight') {
        return b.weightKg - a.weightKg;
      }
      if (sortBy === 'adherence') {
        const progA = getWorkoutWeeklyProgress(a).workoutPct;
        const progB = getWorkoutWeeklyProgress(b).workoutPct;
        return progB - progA;
      }
      return 0;
    });
  }, [trainees, searchQuery, statusFilter, planFilter, sortBy, getAthleteStatus, getWorkoutWeeklyProgress]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTrainees.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedTrainees = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredTrainees.slice(start, start + itemsPerPage);
  }, [filteredTrainees, activePage, itemsPerPage]);

  const handleCopyPortalLink = useCallback((traineeId: string, name: string) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/?user=${traineeId}`;
      navigator.clipboard.writeText(url);
      setCopiedId(traineeId);
      showToast(`Copied athlete portal link for ${name}`, 'success');
      setTimeout(() => setCopiedId(null), 2500);
    }
  }, [showToast]);

  return {
    trainees,
    filteredTrainees,
    paginatedTrainees,
    totalPages,
    currentPage: activePage,
    setCurrentPage,
    // Filters & Sorting
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    sortBy,
    setSortBy,
    // Status & Progress calculators
    getWorkoutWeeklyProgress,
    getAthleteStatus,
    formatSimpleAttention,
    // Modals & Menus
    copiedId,
    editingTrainee,
    setEditingTrainee,
    assignDietTrainee,
    setAssignDietTrainee,
    activeActionMenuId,
    setActiveActionMenuId,
    menuCoords,
    setMenuCoords,
    handleCopyPortalLink,
    handleCopyAthleteLink: handleCopyPortalLink,
    plans,
    dietPlans,
    getCheckInsForUser,
    getDietPlanForUser
  };
}
