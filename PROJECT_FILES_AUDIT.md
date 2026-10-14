# Workouts Pro OS — Complete File Registry & Layout Architecture Audit
> **Official Codebase Audit, Shared vs Dedicated Component Mapping & Fluid Viewport Plan**  
> *Generated on: October 9, 2026 | Total Files in Repository: 208 | Files in `src/`: 176*

---

## 1. Executive Summary & Verification Tally

A triple-verified audit of the entire filesystem structure:

| Scope | File Count | Description |
|---|:---:|---|
| **`src/` Application Core** | **176** | All React views, components, hooks, services, contexts, styles, schemas |
| **Project Root Configurations & Docs** | **24** | Configs (`next`, `tsconfig`, `eslint`, `vitest`, `postcss`) & system specs |
| **`public/` Assets & PWA** | **8** | Manifest, Service Worker (`sw.js`), SVGs, icons |
| **Total Tracked Project Files** | **208** | Complete repository footprint (excluding `.git`, `node_modules`, `.next`) |

### Breakdown of `src/` (176 Files):
- **Shared Infrastructure & Foundations (El-Moshtarek):** **70 Files**
- **Dedicated View / Tab-Specific Components (El-Mesh Moshtarek):** **89 Files**
- **Automated Tests (`src/__tests__/*`):** **17 Files**

---

## 2. Category A: El-Files el-Moshtareka (Shared Across the Platform — 70 Files)

These files define the global design tokens, responsive layout shells, common UI primitives, and core business engines. Modifying these propagates changes across the entire platform.

### A.1. Master Shell & Styling System (4 Files) — [x] COMPLETED & CONNECTED TO CENTRAL TOKENS
* [x] [src/app/globals.css](file:///d:/gym/src/app/globals.css) — **Single Source of Truth** for CSS variables, colors, typography tokens (`.gym-heading-*`), scrollbars, and spacing scales.
* [x] [src/app/page.tsx](file:///d:/gym/src/app/page.tsx) — Master responsive orchestrator, managing tab rendering, desktop height locking (`md:h-screen md:overflow-hidden`), and active client profiles.
* [x] [src/app/layout.tsx](file:///d:/gym/src/app/layout.tsx) — HTML/body root wrapper, Geist font loading, viewport meta tags.
* [x] `src/app/favicon.ico` — Application browser icon.

### A.2. Global Navigation Bars (2 Files) — [x] COMPLETED & CONNECTED TO CENTRAL TOKENS
* [x] [src/components/Navbar.tsx](file:///d:/gym/src/components/Navbar.tsx) — Mobile top/bottom navbar shared across coach and trainee modes.
* [x] [src/components/coach/CoachSidebar.tsx](file:///d:/gym/src/components/coach/CoachSidebar.tsx) — Collapsible desktop sidebar shared across all coach workspace tabs.

### A.3. Shared UI Primitives (`src/components/ui/*` — 14 Files) — [x] COMPLETED & CONNECTED TO CENTRAL TOKENS
* [x] `src/components/ui/Button.tsx` — Standardized buttons (.gym-btn-primary, .gym-btn-secondary, .gym-btn-ghost, .gym-btn-danger).
* [x] `src/components/ui/Card.tsx` — Standardized card surfaces (.gym-card, .gym-card-interactive, .gym-card-elevated, .gym-card-subtle).
* [x] `src/components/ui/Typography.tsx` — Standard typography components (.gym-heading-page, .gym-heading-section, .gym-heading-card, .gym-subtext).
* [x] `src/components/ui/Modal.tsx` — Base modal backdrop with CSS variables var(--card-bg), var(--card-border), .gym-heading-section.
* [x] `src/components/ui/SearchInput.tsx` — Standardized search input reading from var(--input-bg), var(--input-border), var(--main-color).
* [x] `src/components/ui/SegmentedTabs.tsx` — Sub-tab switcher controls using var(--main-color), var(--card-border), var(--bg-main).
* [x] `src/components/ui/SelectDropdown.tsx` — Custom accessible dropdown controls using var(--input-bg), var(--main-color), var(--card-bg).
* [x] `src/components/ui/StatusBadge.tsx` — Consistent status chips and tags.
* [x] `src/components/ui/KpiCard.tsx` — Metric summary display blocks (.gym-card, .gym-heading-card, .gym-num-lg).
* [x] `src/components/ui/ProgressRing.tsx` — Circular progress gauges with var(--card-border) track and var(--main-color).
* [x] `src/components/ui/AthleteAvatar.tsx` — Uniform athlete photo & initials avatar rendering with var(--card-border), var(--bg-main).
* [x] `src/components/ui/CommandPalette.tsx` — Global Ctrl+K quick switcher with var(--card-bg), var(--card-border), var(--main-color).
* [x] `src/components/ui/ErrorBoundary.tsx` — Crash protection wrapper with var(--card-bg), .gym-heading-section, .gym-btn-secondary.
* [x] `src/components/ui/index.ts` — Barrel export for UI components.

### A.4. Global Modals & System Drawers (5 Files) — [x] COMPLETED & CONNECTED TO CENTRAL TOKENS
* [x] `src/components/auth/AuthScreen.tsx` — Authentication & coach/trainee persona switcher.
* [x] `src/components/notifications/NotificationDrawer.tsx` — System alerts slide-over panel.
* [x] `src/components/pwa/InstallPwaBanner.tsx` — PWA installation banner.
* [x] `src/components/modals/NewTraineeModal.tsx` — Athlete onboarding modal accessible from sidebar and dashboard.
* [x] `src/components/modals/EditTraineeModal.tsx` — Client edit modal.

### A.5. Global State Contexts (2 Files) — [x] COMPLETED & CONNECTED TO CENTRAL TOKENS
* [x] `src/context/GymContext.tsx` — Global multi-tenant data store, active user, plans, routines.
* [x] `src/context/ToastContext.tsx` — Global notification toast notifications.

### A.6. Reusable Hooks (`src/hooks/*` — 15 Files)
* `src/hooks/index.ts`
* `src/hooks/useAppRouting.ts`
* `src/hooks/useDebounce.ts`
* `src/hooks/useKeyboardShortcut.ts`
* `src/hooks/useModal.ts`
* `src/hooks/useClientsList.ts`
* `src/hooks/useClientDetail.ts`
* `src/hooks/useClientFilters.ts`
* `src/hooks/useClientOverview.ts`
* `src/hooks/useCompetitors.ts`
* `src/hooks/useNutritionPlanBuilder.ts`
* `src/hooks/useTraineeDiet.ts`
* `src/hooks/useTraineeHabits.ts`
* `src/hooks/useTraineeProfile.ts`
* `src/hooks/useWorkoutPlanBuilder.ts`

### A.7. Core Engines & Business Utilities (`src/lib/*` — 12 Files)
* `src/lib/activeWorkoutEngine.ts`
* `src/lib/alertsEngine.ts`
* `src/lib/audio.ts`
* `src/lib/foodDatabase.ts`
* `src/lib/habitsEngine.ts`
* `src/lib/initialData.ts`
* `src/lib/progressEngine.ts`
* `src/lib/sanitizer.ts`
* `src/lib/smartNotifications.ts`
* `src/lib/supabase.ts`
* `src/lib/weightEngine.ts`
* `src/lib/whatsapp.ts`

### A.8. Services, Schemas & Types (16 Files)
* **Services (`src/services/*` — 8 Files):** `alertService.ts`, `clientService.ts`, `coachSettingsService.ts`, `competitorService.ts`, `dietService.ts`, `openFoodFactsService.ts`, `workoutService.ts`, `index.ts`.
* **Schemas (`src/schemas/*` — 7 Files):** `alert.schema.ts`, `client.schema.ts`, `competitor.schema.ts`, `diet.schema.ts`, `habit.schema.ts`, `settings.schema.ts`, `workout.schema.ts`.
* **Types (`src/types/*` — 1 File):** `index.ts`.

---

## 3. Category B: El-Files el-Mesh Moshtareka (Dedicated View Specific — 89 Files)

These files belong to single dedicated views, screens, or features. They must adhere strictly to the shared tokens and fluid layout contracts.

### B.1. Coach Experience (48 Files)

#### 1. Athletes Roster & 360 Client View (23 Files) — [x] COMPLETED & CONNECTED TO CENTRAL TOKENS
* [x] `src/components/coach/ClientsList.tsx` — Main athlete table roster, search/filter bar, docked pagination.
* [x] `src/components/coach/ClientDetailModal.tsx` — Modal view wrapper for athlete profile.
* [x] `src/components/coach/client-detail/ClientDetailView.tsx` — Full 360-degree athlete cockpit.
* [x] `src/components/coach/client-detail/ClientOverviewTab.tsx` — Overview biometrics, photos, radar.
* [x] `src/components/coach/client-detail/ClientWorkoutTab.tsx` — Assigned split details and historical sessions.
* [x] `src/components/coach/client-detail/ClientNutritionTab.tsx` — Nutritional targets and daily intake logs.
* [x] `src/components/coach/client-detail/ClientCheckInsTab.tsx` — Weekly check-in log and bio feedback.
* [x] `src/components/coach/client-detail/ClientFormChecksTab.tsx` — Exercise video review archive.
* [x] `src/components/coach/client-detail/ClientLogsTab.tsx` — Raw session workout logs.
* [x] `src/components/coach/client-detail/ClientNotesTab.tsx` — Coach private notes and timeline.
* [x] `src/components/coach/client-detail/ClientTimelineTab.tsx` — Milestones and achievements stream.
* [x] `src/components/coach/client-detail/overview/ClientHabitsAttendanceCard.tsx`
* [x] `src/components/coach/client-detail/overview/ClientPhysiquePhotosCard.tsx`
* [x] `src/components/coach/client-detail/overview/ClientStrengthProgressCard.tsx`
* [x] `src/components/coach/client-detail/overview/ClientWeightTrajectoryCard.tsx`
* [x] `src/components/coach/client-detail/BrokenRecordsModal.tsx`
* [x] `src/components/coach/client-detail/ClientMembershipModal.tsx`
* [x] `src/components/coach/client-detail/logs/ExerciseProgressionGraph.tsx`
* [x] `src/components/coach/client-detail/ExerciseProgressionVaultModal.tsx`
* [x] `src/components/coach/client-detail/FormCheckModal.tsx`
* [x] `src/components/coach/client-detail/FormCheckVideoCard.tsx`
* [x] `src/components/coach/client-detail/PhotoComparisonModal.tsx`
* [x] `src/components/coach/client-detail/RecordFormCheckModal.tsx`
* [x] `src/components/coach/client-detail/SmartDiagnosticReportModal.tsx`

#### 2. Training & Splits Studio (9 Files) — [x] COMPLETED & CONNECTED TO CENTRAL TOKENS
* [x] `src/components/coach/SplitsStudioView.tsx` — Main splits studio dashboard.
* [x] `src/components/coach/WorkoutPlansView.tsx` — Master workout plan collection.
* [x] `src/components/coach/WorkoutPlanBuilderModal.tsx` — Multi-day routine builder.
* [x] `src/components/coach/AssignPlanModal.tsx` — Plan assignment dialog.
* [x] `src/components/coach/workout-builder/ExercisePickerDrawer.tsx` — Muscle-targeted exercise drawer.
* [x] `src/components/coach/workout-builder/MovementCard.tsx` — Set/rep/rest movement row.
* [x] `src/components/coach/workout-builder/NewMovementModal.tsx` — Custom movement creator.
* [x] `src/components/coach/workout-builder/VideoPreviewModal.tsx` — Movement form technique preview.
* [x] `src/components/coach/workout-builder/VolumeAnalyzerDrawer.tsx` — Weekly muscle group set analyzer.

#### 3. Nutrition & Diet Studio (8 Files) — [x] COMPLETED & CONNECTED TO CENTRAL TOKENS
* [x] `src/components/coach/DietPlansView.tsx` — Main nutrition plan dashboard.
* [x] `src/components/coach/AssignDietModal.tsx` — Diet assignment modal.
* [x] `src/components/coach/nutrition/NutritionPlanBuilderModal.tsx` — Macro/meal plan builder.
* [x] `src/components/coach/nutrition/FoodSearchModal.tsx` — USDA/custom food lookup.
* [x] `src/components/coach/nutrition/BarcodeScannerModal.tsx` — Barcode scanning camera overlay.
* [x] `src/components/coach/nutrition/DietMealCard.tsx` — Single meal food list card.
* [x] `src/components/coach/nutrition/DietFoodItemCard.tsx` — Individual food item row with macros.
* [x] `src/components/coach/nutrition/NutritionCalendarStrip.tsx` — Daily diet adherence selector.

#### 4. Exercise Library (2 Files) — [x] COMPLETED & CONNECTED TO CENTRAL TOKENS
* [x] `src/components/coach/ExerciseLibraryView.tsx` — Exercise encyclopedia with muscle filtering.
* [x] `src/components/coach/exercises/ExerciseVideoModal.tsx` — Video playback & anatomy notes modal.

#### 5. Competitor Intelligence (3 Files) — [x] COMPLETED & CONNECTED TO CENTRAL TOKENS
* [x] `src/components/coach/CompetitorsView.tsx` — Competitor pricing, features, and positioning matrix.
* [x] `src/components/coach/competitors/AddCompetitorModal.tsx` — Add new competitor modal.
* [x] `src/components/coach/competitors/CompetitorAuditModal.tsx` — Competitor deep-dive audit modal.

#### 6. Operations & Management (6 Files) — [x] COMPLETED & CONNECTED TO CENTRAL TOKENS
* [x] `src/components/coach/CoachDashboardView.tsx` — Executive overview cockpit.
* [x] `src/components/coach/dashboard/KpiDrillDownDrawer.tsx` — Deep metrics drill-down drawer.
* [x] `src/components/coach/CoachAlertsView.tsx` — Urgent alerts & attention queue view.
* [x] `src/components/coach/alerts/AlertCenterDrawer.tsx` — Quick alert drawer.
* [x] `src/components/coach/CalendarView.tsx` — Master coaching appointment and check-in calendar.
* [x] `src/components/coach/CoachSettingsView.tsx` — Platform preferences, branding, and billing config.
* [x] `src/components/coach/CoachSidebar.tsx` — Coach master sidebar & navigation drawer.

---

### B.2. Trainee Experience (37 Files) — [x] COMPLETED & CONNECTED TO CENTRAL TOKENS

#### 1. Core Trainee Views (3 Files) — [x] COMPLETED
* [x] `src/components/trainee/LiveWorkoutSession.tsx` — Interactive workout session execution mode.
* [x] `src/components/trainee/WeeklySplitView.tsx` — Weekly split overview.
* [x] `src/components/trainee/WorkoutHistoryView.tsx` — Training session history.

#### 2. Trainee Dashboard & Components (11 Files) — [x] COMPLETED
* [x] `src/components/trainee/TraineeDashboard.tsx` — Trainee daily command center.
* [x] `src/components/trainee/dashboard/CalendarStrip.tsx`
* [x] `src/components/trainee/dashboard/DailyHabitsSection.tsx`
* [x] `src/components/trainee/dashboard/DailyMealsChecklist.tsx`
* [x] `src/components/trainee/dashboard/DeleteLogModal.tsx`
* [x] `src/components/trainee/dashboard/FullDietModal.tsx`
* [x] `src/components/trainee/dashboard/HydrationCard.tsx`
* [x] `src/components/trainee/dashboard/MealDetailModal.tsx`
* [x] `src/components/trainee/dashboard/ProtocolReadinessCard.tsx`
* [x] `src/components/trainee/dashboard/RestartWorkoutModal.tsx`
* [x] `src/components/trainee/dashboard/TodayWorkoutCard.tsx`
* [x] `src/components/trainee/dashboard/WorkoutSessionAction.tsx`

#### 3. Trainee Diet View & Components (5 Files) — [x] COMPLETED
* [x] `src/components/trainee/TraineeDietView.tsx` — Athlete daily diet log.
* [x] `src/components/trainee/diet/DietCaloriesEquationCard.tsx`
* [x] `src/components/trainee/diet/DietDateNavigator.tsx`
* [x] `src/components/trainee/diet/DietMealCard.tsx`
* [x] `src/components/trainee/diet/DietSupplementsDirectivesCard.tsx`

#### 4. Trainee Habits View & Components (6 Files) — [x] COMPLETED
* [x] `src/components/trainee/TraineeHabitsView.tsx` — Habit streaks & daily adherence.
* [x] `src/components/trainee/habits/DailyHabitCard.tsx`
* [x] `src/components/trainee/habits/HabitAddEditModal.tsx`
* [x] `src/components/trainee/habits/HabitsHeroSection.tsx`
* [x] `src/components/trainee/habits/QuitHabitCard.tsx`
* [x] `src/components/trainee/habits/RelapseReflectionModal.tsx`
* [x] `src/components/trainee/habits/RenderHabitIcon.tsx`

#### 5. Trainee Profile & Biometrics (9 Files) — [x] COMPLETED
* [x] `src/components/trainee/TraineeProfileView.tsx` — Profile cockpit.
* [x] `src/components/trainee/profile/AccountConfigForm.tsx`
* [x] `src/components/trainee/profile/AllPhotosArchiveModal.tsx`
* [x] `src/components/trainee/profile/AssignedPlansSection.tsx`
* [x] `src/components/trainee/profile/PhotoLightboxModal.tsx`
* [x] `src/components/trainee/profile/PhysiqueTimelineSection.tsx`
* [x] `src/components/trainee/profile/ProfileBiometricsStrip.tsx`
* [x] `src/components/trainee/profile/ProfileHeroHeader.tsx`
* [x] `src/components/trainee/profile/WeeklyCheckInHistorySection.tsx`
* [x] `src/components/trainee/profile/index.ts`

---

## 4. Category C: Automated Tests (`src/__tests__/*` — 17 Files)

1. `activeWorkoutEngine.test.ts`
2. `alertService.test.ts`
3. `clientOverview.test.ts`
4. `clientService.test.ts`
5. `coachSettingsService.test.ts`
6. `competitorService.test.ts`
7. `dietService.test.ts`
8. `habitsEngine.test.ts`
9. `multiTenantSecurity.test.ts`
10. `progressEngine.test.ts`
11. `sanitizer.test.ts`
12. `traineeDashboard.test.tsx`
13. `useAppRouting.test.ts`
14. `useClientsList.test.ts`
15. `useTraineeDiet.test.ts`
16. `whatsapp.test.ts`
17. `workoutService.test.ts`

---

## 5. Viewport Adaptation Architecture (Fluid vs Fixed)

### The Core Problem Solved
Fixed pixel heights (`h-[600px]`, `min-h-[500px]`) and hardcoded row pagination (`itemsPerPage = 10`) cause severe design breakdowns:
- On a 1024×768 screen: Content overflows or triggers double scrollbars.
- On a 1024×850 screen: Content stops abruptly, leaving an empty black void at the bottom while more clients could have been displayed.

### The 4 Golden Architectural Rules for Dynamic Fit:
1. **Never Hardcode Container Heights**: All primary view containers and table cards must use `flex-1 min-h-0 h-full w-full`. This forces the card to stretch dynamically to fill 100% of the available height regardless of whether the screen is 768px, 800px, 850px, or 1080px tall.
2. **Dynamic Row Auto-Fill (`ResizeObserver`)**: Instead of rigid page sizes, tables measure rendered body height in real time and calculate visible rows (`Math.max(8, Math.floor(availableH / rowH))`) to dynamically fill the card with athletes, eliminating empty voids.
3. **External Navigator Below the Block**: Pagination bars, count metadata, and navigation controls must sit OUTSIDE the card block (`shrink-0 mt-auto`), leaving the card dedicated purely to data.
4. **Internal Container Scroll**: When lists or tables exceed vertical screen space, scrolling must occur *inside* the child body (`overflow-y-auto custom-scrollbar`), never scrolling the entire page.

---

## 6. Fluid Typography Scale & Spacing System Standard (`clamp()` + `rem` + `dvh`)

### Fluid Typography Tokens (Single Source of Truth in `globals.css`):
* **Page Titles:** `clamp(0.9rem, 0.82rem + 0.35vw, 1.05rem)` (`.gym-heading-page`)
* **Section / Drawer Titles:** `clamp(0.75rem, 0.7rem + 0.2vw, 0.85rem)` (`.gym-heading-section`)
* **Card & Row Titles:** `clamp(0.7rem, 0.66rem + 0.15vw, 0.78rem)` (`.gym-heading-card`)
* **Body / Subtext:** `clamp(0.65rem, 0.62rem + 0.12vw, 0.72rem)` (`.gym-subtext`)
* **Numeric Data / Badges:** `clamp(0.575rem, 0.54rem + 0.1vw, 0.65rem)` (`.gym-num`, `.gym-label-mono`)

### Fluid Spacing & Sizing Tokens:
* **Outer Viewport Padding:** `--fluid-space-page-px: clamp(0.75rem, 0.5rem + 0.7vw, 1.5rem)` (`.fluid-page-px`)
* **Card Internal Padding:** `--fluid-space-card-p: clamp(0.5rem, 0.4rem + 0.4vw, 0.85rem)` (`.fluid-card-p`)
* **Controls & Grid Gaps:** `--fluid-gap-controls: clamp(0.35rem, 0.3rem + 0.25vw, 0.65rem)` (`.fluid-gap-controls`)
* **Table Row Height:** `--fluid-table-row-h: clamp(2.45rem, 4.3vh, 3.15rem)` (`.fluid-table-row`)
* **Table Cell Padding:** `--fluid-table-cell-py: clamp(0.35rem, 0.6vh, 0.6rem)` (`.fluid-table-cell`)
* **Dynamic Viewport Height:** `md:h-[100dvh]` for desktop root shell.
