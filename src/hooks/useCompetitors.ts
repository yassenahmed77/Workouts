'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { User, CompetitorDivision } from '@/types';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/context/ToastContext';
import { INITIAL_USERS } from '@/lib/initialData';
import { competitorService } from '@/services/competitorService';

export type CompetitorPhaseFilter = 'All' | 'Classic Physique' | "Men's Physique" | 'Open Bodybuilding' | 'Bikini Pro' | 'Figure' | 'Peak Week';

export function useCompetitors() {
  const { users, plans, currentUser, updateUserProfile } = useGym();
  const { showToast } = useToast();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<CompetitorPhaseFilter>('All');
  const [showFilter, setShowFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'days_out' | 'weight' | 'readiness' | 'workout'>('days_out');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter athletes marked as competitors with multi-tenant scoping
  const competitors = useMemo(() => {
    const coachId = currentUser?.role === 'coach' ? currentUser.id : undefined;
    const pool = users.length > 0 ? users : INITIAL_USERS;
    return pool.filter((u) => {
      if (u.role !== 'trainee') return false;
      if (coachId && u.coachId && u.coachId !== coachId) return false;
      return u.isCompetitor || !!u.competitionProfile;
    });
  }, [users, currentUser]);

  // Non-competitor trainees available for assignment
  const nonCompetitorTrainees = useMemo(() => {
    const coachId = currentUser?.role === 'coach' ? currentUser.id : undefined;
    return users.filter((u) => {
      if (u.role !== 'trainee') return false;
      if (coachId && u.coachId && u.coachId !== coachId) return false;
      return !u.isCompetitor && !u.competitionProfile;
    });
  }, [users, currentUser]);

  // Unique show list for dropdown filter
  const uniqueShows = useMemo(() => {
    const shows = new Set<string>();
    competitors.forEach((c) => {
      if (c.competitionProfile?.targetShow) {
        shows.add(c.competitionProfile.targetShow);
      }
    });
    return Array.from(shows);
  }, [competitors]);

  // Filtered and sorted competitors using competitorService domain function
  const filteredCompetitors = useMemo(() => {
    return competitorService.filterAndSort(competitors, {
      searchQuery,
      division: divisionFilter,
      targetShow: showFilter,
      sortBy
    });
  }, [competitors, searchQuery, divisionFilter, showFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCompetitors.length / itemsPerPage));
  const paginatedCompetitors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCompetitors.slice(start, start + itemsPerPage);
  }, [filteredCompetitors, currentPage, itemsPerPage]);

  // Active Dropdown & Modal states
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

  const [auditCompetitor, setAuditCompetitor] = useState<User | null>(null);
  const [isAddCompetitorModalOpen, setIsAddCompetitorModalOpen] = useState(false);

  // Save private notes
  const handleSavePrivateNotes = useCallback(async (comp: User, notes: string) => {
    const updatedProfile = comp.competitionProfile
      ? { ...comp.competitionProfile, privateCoachNotes: notes }
      : undefined;

    await updateUserProfile(comp.id, {
      privateCoachNotes: notes,
      competitionProfile: updatedProfile
    });

    showToast(`Saved private coach notes for ${comp.name}`, 'success');
  }, [updateUserProfile, showToast]);

  // Add new competitor
  const handleAddCompetitor = useCallback(async (
    userId: string,
    showData: {
      targetShow: string;
      division: CompetitorDivision;
      targetWeightClassKg: number;
      daysOut: number;
      prepPhase: 'Off-Season' | 'Prep Phase (16w)' | 'Cutting Phase (8w)' | 'Peak Week' | 'Show Day';
    }
  ) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    await updateUserProfile(userId, {
      isCompetitor: true,
      competitionProfile: {
        targetShow: showData.targetShow,
        showDate: new Date(Date.now() + showData.daysOut * 86400000).toISOString().split('T')[0],
        division: showData.division,
        targetWeightClassKg: showData.targetWeightClassKg,
        currentWeightKg: targetUser.weightKg,
        prepPhase: showData.prepPhase,
        stageReadinessScore: 75,
        posingApproval: 'Pending Review',
        daysOut: showData.daysOut,
        waterIntakeLiters: 4,
        carbLoadGrams: 300
      }
    });

    showToast(`Added ${targetUser.name} to active stage competitors roster`, 'success');
  }, [users, updateUserProfile, showToast]);

  // Copy portal link
  const handleCopyAthleteLink = useCallback((athleteId: string, athleteName: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}?traineeId=${athleteId}`;
    navigator.clipboard.writeText(url);
    showToast(`Direct access link for ${athleteName} copied to clipboard!`, 'info');
  }, [showToast]);

  return {
    competitors,
    nonCompetitorTrainees,
    uniqueShows,
    filteredCompetitors,
    paginatedCompetitors,
    totalPages,
    searchQuery,
    setSearchQuery,
    divisionFilter,
    setDivisionFilter,
    showFilter,
    setShowFilter,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    activeActionMenuId,
    setActiveActionMenuId,
    menuCoords,
    setMenuCoords,
    auditCompetitor,
    setAuditCompetitor,
    isAddCompetitorModalOpen,
    setIsAddCompetitorModalOpen,
    handleSavePrivateNotes,
    handleAddCompetitor,
    handleCopyAthleteLink,
    plans
  };
}
