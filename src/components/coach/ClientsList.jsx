/**
 * @file ClientsList.jsx
 * @description شاشة قائمة المتدربين الرئيسية للكوتش (Clean Architecture Presentation Component)
 * بعد تفكيك الملف العملاق (71KB) إلى مكونات عرض صغيرة ومستقلة وقابلة لإعادة الاستخدام.
 */

'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Plus, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  User as UserIcon,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { EditTraineeModal } from '@/components/modals/EditTraineeModal';
import { AssignDietModal } from '@/components/coach/AssignDietModal';
import { SegmentedTabs, ErrorBoundary } from '@/components/ui';
import { clientService } from '@/services/clientService';
import { useClientsList } from '@/hooks/useClientsList';

import { ClientsHeader } from './clients/ClientsHeader';
import { ClientFilterSheet } from './clients/ClientFilterSheet';
import { ClientMobileAccordion } from './clients/ClientMobileAccordion';
import { ClientMobileRow } from './clients/ClientMobileRow';
import { ClientsTable } from './clients/ClientsTable';
import { ClientActionMenu } from './clients/ClientActionMenu';

export const ClientsList = ({
  onOpenAssignModal,
  onOpenPlanBuilderForUser,
  onOpenNewTraineeModal,
  onSelectTraineeDetails,
  onSwitchToTrainee,
  onNavigateToDiet,
  isSidebarOpen,
  onToggleSidebar
}) => {
  const {
    trainees,
    filteredTrainees,
    paginatedTrainees,
    totalPages,
    currentPage,
    setCurrentPage,
    setItemsPerPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    sortBy,
    setSortBy,
    getWorkoutWeeklyProgress,
    getAthleteStatus,
    formatSimpleAttention,
    copiedId,
    editingTrainee,
    setEditingTrainee,
    assignDietTrainee,
    setAssignDietTrainee,
    activeActionMenuId,
    setActiveActionMenuId,
    menuCoords,
    setMenuCoords,
    handleCopyAthleteLink,
    plans,
    dietPlans,
    getCheckInsForUser,
    getDietPlanForUser
  } = useClientsList({ customItemsPerPage: 10 });

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [expandedTraineeId, setExpandedTraineeId] = useState(null);
  const [mobileActionTrainee, setMobileActionTrainee] = useState(null);
  const listContainerRef = useRef(null);

  const statusFilterTabs = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'All Set' },
    { key: 'needs_plan', label: 'Needs Plan' },
    { key: 'needs_diet', label: 'Needs Diet' },
    { key: 'needs_setup', label: 'Needs Setup' },
    { key: 'on_hold', label: 'On Hold' }
  ];

  const statusCounts = useMemo(() => {
    const counts = {
      all: trainees.length,
      active: 0,
      needs_plan: 0,
      needs_diet: 0,
      needs_setup: 0,
      on_hold: 0
    };
    trainees.forEach((t) => {
      const statusKey = getAthleteStatus(t).key;
      if (counts[statusKey] !== undefined) {
        counts[statusKey]++;
      }
    });
    return counts;
  }, [trainees, getAthleteStatus]);

  // Smart Viewport Pagination Engine: Dynamically calculates optimal itemsPerPage
  // to perfectly fit any device height (iPhone SE, iPhone 15, Pro Max, Tablet, Desktop)
  // with ZERO vertical scroll and ZERO empty space.
  useEffect(() => {
    const calculateCapacity = () => {
      if (typeof window === 'undefined') return;
      const windowW = window.innerWidth;
      const windowH = window.innerHeight;
      const isMobile = windowW < 768;

      let nextCount = 10;
      const containerHeight = listContainerRef.current?.clientHeight || 0;

      if (containerHeight > 80) {
        if (isMobile) {
          // containerHeight is already purely the space for listContainerRef (between filters and pagination bar).
          // Mobile card is ~58px + 6px gap = 64px total slot.
          const available = Math.max(0, containerHeight - 6);
          nextCount = Math.max(3, Math.floor(available / 64));
        } else {
          // Table header is ~38px, table row is ~48px
          const available = Math.max(0, containerHeight - 40);
          nextCount = Math.max(4, Math.floor(available / 48));
        }
      } else {
        // Viewport height fallback before container ref measurement
        if (isMobile) {
          if (windowH < 700) nextCount = 6;
          else if (windowH < 800) nextCount = 7;
          else if (windowH < 900) nextCount = 8;
          else nextCount = 9;
        } else {
          if (windowH < 750) nextCount = 7;
          else if (windowH < 900) nextCount = 10;
          else if (windowH < 1100) nextCount = 13;
          else nextCount = 16;
        }
      }

      setItemsPerPage((prev) => (prev !== nextCount ? nextCount : prev));
    };

    calculateCapacity();

    const element = listContainerRef.current;
    let observer = null;
    if (element && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        calculateCapacity();
      });
      observer.observe(element);
    }

    window.addEventListener('resize', calculateCapacity);
    return () => {
      window.removeEventListener('resize', calculateCapacity);
      if (observer) observer.disconnect();
    };
  }, [setItemsPerPage]);

  // إغلاق الكارت المفتوح في الموبايل عند النقر خارجه
  useEffect(() => {
    if (!expandedTraineeId) return;

    const handlePointerDown = (e) => {
      const target = e.target;
      if (!target) return;
      if (
        target.closest('[data-expanded-client="true"]') ||
        target.closest('[data-accordion-header]') ||
        target.closest('.fixed')
      ) {
        return;
      }
      setExpandedTraineeId(null);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [expandedTraineeId]);

  const handleOpenMenu = (e, trainee) => {
    e.stopPropagation();
    if (activeActionMenuId === trainee.id) {
      setActiveActionMenuId(null);
      setMenuCoords(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < 250;
      setMenuCoords({
        top: openUpwards ? undefined : rect.bottom + 6,
        bottom: openUpwards ? window.innerHeight - rect.top + 6 : undefined,
        right: window.innerWidth - rect.right,
        openUpwards,
      });
      setActiveActionMenuId(trainee.id);
    }
  };

  const selectedMenuTrainee = trainees.find((t) => t.id === activeActionMenuId);

  return (
    <ErrorBoundary fallbackTitle="Unable to load Athletes Directory">
      <div className="flex flex-col flex-1 h-full min-h-0 w-full max-w-none select-none gap-2">
        {/* 1. شريط الرأس والبحث */}
        <ClientsHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onResetPage={() => setCurrentPage(1)}
          isMobileSearchOpen={isMobileSearchOpen}
          setIsMobileSearchOpen={setIsMobileSearchOpen}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={onToggleSidebar}
          onOpenNewTraineeModal={onOpenNewTraineeModal}
        />

        {/* 2. شريط فلاتر الموبايل الأفقية (< 768px) */}
        <div className="md:hidden relative w-full shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 scroll-smooth">
            {statusFilterTabs.map((tab) => {
              const isSelected = statusFilter === tab.key;
              const count = statusCounts[tab.key] ?? 0;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 shrink-0 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs transition-all cursor-pointer border select-none active:scale-95 ${
                    isSelected
                      ? 'bg-[var(--main-color)] text-black border-[var(--main-color)] font-bold shadow-sm shadow-[var(--main-color)]/25'
                      : 'bg-[var(--card-bg)] text-slate-300 hover:text-white border-[var(--card-border)] hover:border-white/20 font-medium'
                  }`}
                >
                  <span className="whitespace-nowrap">{tab.label}</span>
                  <span
                    className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-full leading-none font-bold ${
                      isSelected
                        ? 'bg-black/20 text-black'
                        : 'bg-white/[0.08] text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[var(--bg-page)] to-transparent" />
        </div>

        {/* 3. شريط فلاتر التابلت وسطح المكتب (768px+) */}
        <div className="hidden md:flex items-center justify-between gap-2 shrink-0">
          <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar py-0.5">
            <SegmentedTabs
              items={[
                { key: 'all', label: 'All' },
                { key: 'active', label: 'All Set' },
                { key: 'needs_plan', label: 'Needs Plan' },
                { key: 'needs_diet', label: 'Needs Diet' },
                { key: 'needs_setup', label: 'Needs Setup' },
                { key: 'on_hold', label: 'On Hold' }
              ]}
              value={statusFilter}
              onChange={(key) => {
                setStatusFilter(key);
                setCurrentPage(1);
              }}
              buttonClassName="whitespace-nowrap text-center justify-center text-[11px] xl:text-[11.5px] px-2.5 xl:px-3 py-1"
            />
          </div>

          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0">
            {/* قائمة الترتيب */}
            <div className="flex items-center gap-1.5 xl:gap-2 gym-card-subtle px-2 xl:px-2.5 py-1 text-[11px] xl:text-xs">
              <span className="gym-label-mono text-slate-400 whitespace-nowrap text-[9.5px] xl:text-[10px]">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-200 font-medium text-[11px] xl:text-xs focus:outline-none cursor-pointer pr-1 whitespace-nowrap"
              >
                <option value="name" className="bg-[var(--card-bg)] text-white">Name</option>
                <option value="weight" className="bg-[var(--card-bg)] text-white">Weight</option>
                <option value="adherence" className="bg-[var(--card-bg)] text-white">Workout Progress</option>
              </select>
              <ChevronDown className="w-3 xl:w-3.5 h-3 xl:h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* قائمة فلترة الخطط */}
            <div className="flex items-center gap-1.5 xl:gap-2 gym-card-subtle px-2 xl:px-2.5 py-1 text-[11px] xl:text-xs">
              <span className="gym-label-mono text-slate-400 whitespace-nowrap text-[9.5px] xl:text-[10px]">Plan</span>
              <select
                value={planFilter}
                onChange={(e) => {
                  setPlanFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-slate-200 font-medium text-[11px] xl:text-xs focus:outline-none cursor-pointer pr-1 whitespace-nowrap max-w-[85px] xl:max-w-none"
              >
                <option value="all" className="bg-[var(--card-bg)] text-white">All Plans</option>
                {(plans || []).map((p) => (
                  <option key={p.id} value={p.id} className="bg-[var(--card-bg)] text-white">
                    {p.title}
                  </option>
                ))}
                <option value="none" className="bg-[var(--card-bg)] text-white">No Plan</option>
              </select>
              <ChevronDown className="w-3 xl:w-3.5 h-3 xl:h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className="lg:hidden gym-card-subtle px-2.5 py-1.5 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            aria-label="Open Sort & Filter menu"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--main-color)]" />
            <span className="font-medium text-[11px] sm:text-xs whitespace-nowrap">Sort & Filter</span>
            {(sortBy !== 'name' || planFilter !== 'all') && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--main-color)]" />
            )}
          </button>
        </div>

        {/* نافذة الفلاتر المنبثقة من الأسفل للموبايل */}
        <ClientFilterSheet
          isOpen={isFilterSheetOpen}
          onClose={() => setIsFilterSheetOpen(false)}
          sortBy={sortBy}
          setSortBy={setSortBy}
          planFilter={planFilter}
          setPlanFilter={setPlanFilter}
          plans={plans}
          onReset={() => {
            setSortBy('name');
            setPlanFilter('all');
            setCurrentPage(1);
          }}
        />

        {/* حالة القائمة الفارغة أو عرض البيانات */}
        {filteredTrainees.length === 0 ? (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-[var(--card-subtle-bg)] border border-[var(--card-border)] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--card-bg)] text-slate-400 border border-[var(--card-border)] flex items-center justify-center mx-auto">
              <UserIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No Athletes Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No clients match your filter criteria. Reset your filters or register a new athlete.
            </p>
            <button
              onClick={onOpenNewTraineeModal}
              className="gym-btn-primary text-xs inline-flex items-center gap-2 mt-2 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Athlete</span>
            </button>
          </div>
        ) : (
          <>
            {/* List and Table Container (Monitored by Smart Viewport Pagination Engine) */}
            <div ref={listContainerRef} className="flex-1 min-h-0 flex flex-col justify-start overflow-hidden">
              {/* عرض الموبايل للشاشات الصغيرة (< 375px) */}
              <div className="viewport-mobile-compact space-y-1 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                {paginatedTrainees.map((trainee) => (
                  <ClientMobileAccordion
                    key={trainee.id}
                    trainee={trainee}
                    isExpanded={expandedTraineeId === trainee.id}
                    onToggleExpand={() => setExpandedTraineeId(expandedTraineeId === trainee.id ? null : trainee.id)}
                    assignedPlan={plans.find((p) => p.id === trainee.assignedPlanId)}
                    assignedDiet={getDietPlanForUser(trainee.id)}
                    workoutProg={getWorkoutWeeklyProgress(trainee)}
                    statusBadge={getAthleteStatus(trainee)}
                    membershipBadge={clientService.getMembershipBadge(trainee)}
                    attention={formatSimpleAttention(trainee, getCheckInsForUser(trainee.id))}
                    onSelectDetails={onSelectTraineeDetails}
                    onOpenActionSheet={setMobileActionTrainee}
                  />
                ))}
              </div>

              {/* عرض الموبايل القياسي (375px - 767px) */}
              <div className="viewport-mobile-standard space-y-1.5 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                {paginatedTrainees.map((trainee) => (
                  <ClientMobileRow
                    key={trainee.id}
                    trainee={trainee}
                    assignedPlan={plans.find((p) => p.id === trainee.assignedPlanId)}
                    assignedDiet={getDietPlanForUser(trainee.id)}
                    workoutProg={getWorkoutWeeklyProgress(trainee)}
                    statusBadge={getAthleteStatus(trainee)}
                    membershipBadge={clientService.getMembershipBadge(trainee)}
                    attention={formatSimpleAttention(trainee, getCheckInsForUser(trainee.id))}
                    onSelectDetails={onSelectTraineeDetails}
                    onOpenActionSheet={setMobileActionTrainee}
                  />
                ))}
              </div>

              {/* جدول سطح المكتب والتابلت (768px+) */}
              <ClientsTable
                trainees={paginatedTrainees}
                plans={plans}
                getDietPlanForUser={getDietPlanForUser}
                getCheckInsForUser={getCheckInsForUser}
                getWorkoutWeeklyProgress={getWorkoutWeeklyProgress}
                getAthleteStatus={getAthleteStatus}
                formatSimpleAttention={formatSimpleAttention}
                activeActionMenuId={activeActionMenuId}
                onOpenMenu={handleOpenMenu}
                onSelectTraineeDetails={onSelectTraineeDetails}
                onOpenAssignModal={onOpenAssignModal}
                onOpenAssignDiet={setAssignDietTrainee}
              />
            </div>

            {/* القائمة العائمة لإجراءات المتدرب */}
            <ClientActionMenu
              isOpen={Boolean(activeActionMenuId && menuCoords)}
              coords={menuCoords}
              onClose={() => {
                setActiveActionMenuId(null);
                setMenuCoords(null);
              }}
              trainee={selectedMenuTrainee}
              hasPlan={Boolean(selectedMenuTrainee?.assignedPlanId)}
              onOpenAssignPlan={onOpenAssignModal}
              onOpenAssignDiet={setAssignDietTrainee}
              onSwitchToTrainee={onSwitchToTrainee}
              onCopyAthleteLink={handleCopyAthleteLink}
              onEditProfile={setEditingTrainee}
            />

            {/* شريط ترقيم الصفحات (Pagination) */}
            <div className="shrink-0 flex items-center justify-between gap-1.5 pt-1 px-0.5 mt-0.5 sm:mt-1.5">
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal whitespace-nowrap">
                Showing {paginatedTrainees.length} of {filteredTrainees.length}
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[var(--main-color)]/20 text-[var(--main-color)] border border-[var(--main-color)]/40 shadow-sm'
                        : 'bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* المودالات المرفقة */}
        {assignDietTrainee && (
          <AssignDietModal
            isOpen={true}
            onClose={() => setAssignDietTrainee(null)}
            targetUser={assignDietTrainee}
          />
        )}

        {editingTrainee && (
          <EditTraineeModal
            isOpen={true}
            onClose={() => setEditingTrainee(null)}
            user={editingTrainee}
          />
        )}

        {/* قائمة إجراءات الموبايل السفلية */}
        {mobileActionTrainee && (
          <div 
            className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/80 backdrop-blur-md animate-in fade-in md:hidden"
            onClick={() => setMobileActionTrainee(null)}
          >
            <div 
              className="w-full gym-card-elevated rounded-t-3xl shadow-2xl border border-[var(--card-border)] overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-2.5 mb-2 shrink-0" />
              
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)] shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[var(--card-subtle-bg)] border border-[var(--card-border)] flex items-center justify-center font-mono text-xs font-bold text-white shrink-0">
                    {mobileActionTrainee.avatarText}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-white truncate">{mobileActionTrainee.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{mobileActionTrainee.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileActionTrainee(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    const t = mobileActionTrainee;
                    setMobileActionTrainee(null);
                    onSelectTraineeDetails(t, 'overview');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-left text-xs font-medium text-white block cursor-pointer transition-colors"
                >
                  <span>Full Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const t = mobileActionTrainee;
                    setMobileActionTrainee(null);
                    onOpenAssignModal(t);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-left text-xs font-medium text-white block cursor-pointer transition-colors"
                >
                  <span>{mobileActionTrainee.assignedPlanId ? 'Edit Workout Routine' : 'Build Workout Routine'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const t = mobileActionTrainee;
                    setMobileActionTrainee(null);
                    setAssignDietTrainee(t);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-left text-xs font-medium text-white block cursor-pointer transition-colors"
                >
                  <span>Assign / Edit Diet Plan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const t = mobileActionTrainee;
                    setMobileActionTrainee(null);
                    onSwitchToTrainee(t.id);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-left text-xs font-medium text-slate-300 block cursor-pointer transition-colors"
                >
                  <span>Switch to Athlete View</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const t = mobileActionTrainee;
                    setMobileActionTrainee(null);
                    handleCopyAthleteLink(t.id, t.name);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-left text-xs font-medium text-slate-300 block cursor-pointer transition-colors"
                >
                  <span>Copy Portal Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const t = mobileActionTrainee;
                    setMobileActionTrainee(null);
                    setEditingTrainee(t);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--card-subtle-bg)] hover:bg-white/[0.06] border border-[var(--card-border)] text-left text-xs font-medium text-slate-400 block cursor-pointer transition-colors"
                >
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
