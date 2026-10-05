# Workouts Pro — Engineering Standards & Architectural Roadmap

> **Authoritative Specification & Execution Blueprint**  
> **Quality Contract:** "Ma7adesh Byrage3 Wara El-Senior" — Complete architectural integrity, 100% defensive resilience, bank-grade data security, and zero skipped requirements.
> This document defines the permanent engineering, security, responsive, and architectural rules for the entire Workouts Pro application. Every refactoring step, component audit, and logic overhaul must strictly adhere to these standards.

---

## 🏛️ The Senior Principal Engineer Quality Contract

1. **Zero-Review Standard ("Ma7adesh Byrage3 Wara El-Senior"):**
   - The Senior Engineer takes 100% ownership of quality, stability, and security. No code is left unverified, half-baked, or untested.
   - Any edge case (empty data, deleted relations, malformed JSON, network drop) must be defended in advance.
2. **Bank-Grade Data Security & Privacy:**
   - **IDOR Protection:** Multi-tenant scoping on every data layer (`WHERE coach_id = :coach_id`).
   - **Check-in Media Privacy:** Photos and sensitive body assessments must use private pre-signed URLs with limited lifespan.
   - **XSS Sanitization:** All free-form inputs sanitized through `src/lib/sanitizer.ts`.
   - **Zod Runtime Contracts:** Strict schema validation on all inputs and mutations before state writes.
3. **Ultra-Performance (60 FPS & Sub-Second Loads):**
   - Code splitting & dynamic imports (`next/dynamic`) for heavy modals.
   - Zero redundant re-renders via `useMemo` and `useCallback`.
   - Contained list pagination and virtualization avoiding DOM bloat.
4. **Automated Testing Rigor:**
   - `vitest` suite covering security vectors, mathematical engines, and zero-data states (`npm test`).

---

## 1. Ironclad Core Directives (El-Qawa3ed el-Asaseya)

### Rule 1: Widescreen Lock (>= 1280px / `xl`)
* **Strict Visual Freeze**: The desktop/widescreen layout (>= 1280px) is completely approved and finalized.
* **Zero Layout Alteration**: It is strictly forbidden to alter, shift, resize, or restyle any element, card, padding, font, or container on screens >= 1280px.
* **Targeted Responsive Overhauls**: All responsive adjustments must exclusively target viewports `< 1280px` using scoped Tailwind utilities (`max-xl:`, `lg:`, `md:`, `sm:`, `max-md:`, `max-sm:`). Desktop styles must remain identical down to the exact pixel.

### Rule 2: Senior Code Quality & Clean Architecture
* **Zero Spaghetti Code**: Decouple monolithic views into modular, testable sub-components, custom hooks, and isolated helper engines.
* **Meaningful Senior Documentation**: Add high-value, explanatory JSDoc and inline comments for non-obvious business logic, state transitions, mathematical formulas, and data flow. Avoid trivial restatements.
* **100% Dynamic Logic**: Eliminate all static/hardcoded mock items from UI components. Everything must flow from state, services, and dynamic calculation engines.
* **Defensive Edge Case Handling**: Explicitly account for:
  - New users with 0 workouts, 0 check-ins, or 0 diet plans (no `NaN`, no broken calculations, no unhandled exceptions).
  - Deleted references (e.g., an assigned plan ID that no longer exists in the library).
  - Malformed or partial objects (graceful fallback states and empty-state placeholders).

### Rule 3: Ironclad Security & Zod Validation
* **Zod Runtime Schemas**: Every data mutation, form submission, and external payload must be validated via strict Zod schemas before entering application state or persistence.
* **Strict Type Safety**: No loose `any` types. All entities must be strictly typed in `@/types/index.ts` and validated by Zod contracts.
* **Input Sanitization & XSS Prevention**: Free-form text fields (coach notes, client remarks, workout titles, diet notes) must be stripped of script tags, unsafe HTML entities, and malicious injection payloads.
* **Multi-Tenant Boundary Isolation**: Every client, workout plan, diet plan, log, and check-in must explicitly include and respect `coach_id`. Cross-tenant data leakage is strictly prohibited.

### Rule 4: Maximum Performance & Zero-Lag UX
* **Pure Computation Memoization**: Cache all derived statistics (PR calculations, adherence scores, macro sums, alert evaluations) using `useMemo` with minimal, precise dependency arrays.
* **Handler Stability**: Wrap action callbacks passed to child lists in `useCallback` to prevent unnecessary component re-renders.
* **Virtualized/Efficient Lists**: Prevent UI lag when rendering large collections of clients, exercises (500+ items), or historical logs.
* **Fit-Screen Philosophy**: Maintain the natural desktop fit without clipping or overflow issues (as defined in `DESIGN_BLUEPRINT.md`).

---

## 2. Senior Code Craftsmanship & Clean Patterns (Tariqet el-Code el-Sah)

3shan el-codebase yb2a a3la standard fe el-3alam w mayb2ash feeh ay 3ak (Zero Spaghetti), hanlzem nafsenna b 5 Qawa3ed Handaseya Sarema fe kol Component:

### Pattern 1: "Headless Logic" (Fasl el-Logic 3an el-UI b Custom Hooks)
* **Junior Anti-Pattern**: Component fih 1000 satr (20 `useState`, 5 `useEffect`, 10 mo3adlat 7esabeya, w JSX mashrook f ba3do).
* **Senior Standard**: Ayr Component yb2a **Clean Presentation Only**. Kol el-logic, el-calculations, w el-state management yetse7eb f Custom Hook f `src/hooks/` (masalan: `useClientDetail(clientId)`). El-component yb2a bas bystlem el-data w yrenedrha!

### Pattern 2: Derived State Badalan mn `useEffect` Sync Hell
* **Junior Anti-Pattern**: `useState` le A, w `useEffect` bysm3 f A 3shan y-update `useState` le B (da bysbbeb cascading re-renders w stale bugs).
* **Senior Standard**: Mamno3 `useEffect` l-hesab ay data momken tet7seb on-the-fly. Ay data motashabka tetsave f `useMemo` mobasharatan. 0 extra renders w 0 lag!

### Pattern 3: Pure Math & Business Engines fe `src/lib/`
* **Senior Standard**: Mamno3 ay mo3adla reyaadya (PRs, weight percentage, macro sum, adherence score) tetkatab gowa el-JSX. Kol el-mo3adlat betkon **Pure Functions** f `src/lib/` (zay `progressEngine.ts`, `macroEngine.ts`). Law 3ayzen n8ayar ay tareeqa f el-hesabat, bnt8ayar f satr wa7ed bas!

### Pattern 4: Atomic Component Sizing (Qa3edet el-180 Satr)
* **Senior Standard**: Ay component yekbar 3an ~180-200 satr lazm yetfakk le Sub-Components so8ayara (masalan: `ClientHeader`, `ClientMetricsGrid`, `ClientSubTabsNav`). Da by5ly el-code yet2ere zay el-ketab w yet3amlo maintenance fe sawany.

### Pattern 5: Discriminated Unions w Strict Types (0 `any`)
* **Senior Standard**: Ay status aw mode lazm yb2a TypeScript Discriminated Union (`status: 'active' | 'expiring_soon' | 'expired'`), mamno3 generic strings (`string`). El-compiler y7zarak fawran law neset ay case.

---

## 3. Flagship SaaS Pillars (Mashro3 el-3omr)

### Immediate Core Pillars (Nafazha fe el-Architecture):
1. **Self-Healing State & Error Boundaries (Zero White Screen of Death)**:
   - React Error Boundary mo7kam lkol view ymn3 ay crash.
   - Corrupted state recovery: law el-data feha JSON bayez, el-app by-repair nafso b defaults salima.
2. **Optimistic UI with "Undo" Safety Net**:
   - UI bystgeb f 0ms bedoon ta3teel.
   - Actions el-hassasa (Delete, Overwrite, Reset) btgeeb Toast m3 زرار "Undo" lmodet 5 sawany.
3. **Media Vault & Ultra-Sensitive Privacy (Check-in Photos)**:
   - Photos el-trainees w el-posing mshafara w ma7meya.
   - Zod validation l-image URLs w expiration tokens.
4. **Power-User Command Palette (`Cmd + K` / `/` Global Search)**:
   - Spotlight search sare3 gdn y5ly el-coach ywsal l-ay client, plan, aw tamrena f nos sanya.

### Future Enterprise Upgrades (Phase 2 Backlog):
* **Upgrade A**: Offline-First Local Storage (IndexedDB Sync ll-trainee fel-gym basement).
* **Upgrade B**: Coach Business Intelligence & Churn Radar (Smart alerts l-eshtrakat el-trainees).
* **Upgrade C**: Branded Luxury Progress Cards (Instagram Stories 1-click exporter).

---

## 4. World-Class Architecture Blueprint & Visual Mental Model

To make this codebase effortless to study, navigate, and scale, it follows a strict **4-Layer Clean Onion Architecture**. Every single feature in the platform is isolated into predictable layers with a unidirectional data flow:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   LAYER 1: PRESENTATION (UI & Views)                     │
│   Components, Modals, Drawers, Segmented Controls, Responsive Layouts    │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ (dispatches actions / user events)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│               LAYER 2: STATE & ORCHESTRATION (Custom Hooks)              │
│      GymContext, useClients, useWorkoutDraft, useNutritionTotals         │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ (calls business rules & schemas)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│               LAYER 3: DOMAIN, ENGINES & SERVICES (Contracts)            │
│   Zod Schemas, clientService, workoutService, progressEngine, Math Libs   │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ (safe execution & scoping)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│            LAYER 4: SECURITY & INFRASTRUCTURE (Data Boundary)            │
│   XSS Sanitizer, Multi-Tenant `coach_id` Guard, Storage / API Adapters    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. The 3-Minute Codebase Study Guide (Ezay tzaker ay feature f 3 daqayeq)

Whenever you open any part of the website to study or audit it, follow this exact 3-step mental path:

```
Step 1: THE DATA CONTRACT (What is the data shape?)
  └── Go to: `src/types/index.ts` & `@/schemas/[feature].schema.ts`
  └── Question to ask: "What fields exist? What are the validation rules?"

Step 2: THE BUSINESS ENGINE (What calculations & mutations happen?)
  └── Go to: `src/services/[feature]Service.ts` & `src/lib/[feature]Engine.ts`
  └── Question to ask: "How are PRs calculated? How is adherence scored? How is input sanitized?"

Step 3: THE UI PRESENTATION (How does the user interact?)
  └── Go to: `src/components/coach/` or `src/components/trainee/`
  └── Question to ask: "How does it render on Desktop (>= 1280px)? How does it adapt cleanly on Mobile (< 1280px)?"
```

---

## 6. Interconnected Modular Architecture (T2seemet el-Website)

The platform is systematically decomposed into 6 cohesive, interconnected modules executed in sequence:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   WORKOUTS PRO PLATFORM ARCHITECTURE                   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
[ Coach Experience ]                                      [ Trainee Experience ]
  ├─ Module 1: Clients & 360 Athlete Management             ├─ Module 2: Live Workout & History
  ├─ Module 2: Workout Engine & Splits Studio               ├─ Module 3: Trainee Diet & Nutrition
  ├─ Module 3: Nutrition & Diet Studio                      ├─ Module 4: Check-in, Habits & PRs
  ├─ Module 4: Progress, Habits & Alerts Engine             └─ Module 6: Mobile PWA & Touch UX
  ├─ Module 5: Competitors & Coach Business Settings
  └─ Module 6: Security, Performance & Responsive Polish
```

---

## 7. Module Breakdown & Execution Specifications

### Module 1: Client Onboarding & 360 Athlete Management
* **Files in Scope**:
  - `src/components/coach/ClientsList.tsx`
  - `src/components/coach/client-detail/ClientDetailView.tsx`
  - `src/components/coach/client-detail/BrokenRecordsModal.tsx`
  - `src/components/coach/client-detail/ClientProgressSubTab.tsx`
  - `src/components/coach/client-detail/ClientWorkoutSubTab.tsx`
  - `src/components/coach/client-detail/ClientDietSubTab.tsx`
  - `src/components/coach/client-detail/ClientNotesSubTab.tsx`
  - `src/components/coach/client-detail/ClientOverviewSubTab.tsx`
  - `src/components/modals/NewTraineeModal.tsx`
  - `src/components/modals/EditTraineeModal.tsx`
  - `src/services/clientService.ts`
* **Zod Schemas to Build**:
  - `ClientCreateSchema`: Validates name (min 2, max 60), email (valid email), phone (optional valid format), weight/height (positive numbers), goal, subscription details.
  - `ClientUpdateSchema`: Partial update validation with bounds checking.
  - `ClientNoteSchema`: Sanitized string validation (max 2000 chars, no HTML).
* **Missing Logic & Edge Cases**:
  - Athletes with zero historical workout logs: Broken records modal and 360 graphs must display clean empty states instead of crashing or showing NaN/undefined.
  - Subscription status lifecycle: Dynamic status calculator based on date comparison (`active` -> `expiring_soon` (<= 7 days) -> `expired`).
  - Search & Multi-filter: Instant search by name, goal, subscription status, and assignment status with debounce.
* **Responsive Blueprint (< 1280px)**:
  - Desktop (>= 1280px): Unchanged two-pane / split view.
  - Tablet (768px - 1279px): Responsive grid adapting from 3 columns to 2 columns with horizontal overflow tabs.
  - Mobile (< 768px): Single-column cards with touch-friendly actions, full-screen modals with sticky headers.

---

### Module 2: Workout Engine, Splits Studio & Live Sessions
* **Files in Scope**:
  - `src/components/coach/WorkoutPlansView.tsx`
  - `src/components/coach/SplitsStudioView.tsx`
  - `src/components/coach/WorkoutPlanBuilderModal.tsx`
  - `src/components/coach/CalendarView.tsx`
  - `src/components/coach/AssignPlanModal.tsx`
  - `src/components/trainee/LiveWorkoutSession.tsx`
  - `src/components/trainee/WeeklySplitView.tsx`
  - `src/services/workoutService.ts`
* **Zod Schemas to Build**:
  - `WorkoutPlanSchema`: Title, level, days array, exercises array with sets, reps, target RPE, rest seconds.
  - `WorkoutLogSchema`: Date, duration, volume, completed exercises array with weights, reps, completed timestamps.
* **Missing Logic & Edge Cases**:
  - Live session draft auto-recovery: Persist in-progress workouts to local storage; handle browser refresh without losing logged sets.
  - Input validation for sets: Rejection of negative weights, non-numeric values, or zero reps.
  - Calendar adherence logic: Compare completed log dates with scheduled split days accurately across timezones.
* **Responsive Blueprint (< 1280px)**:
  - Splits Studio connected panels stack vertically on mobile.
  - Live workout logger expands set rows to full width on mobile with large touch-friendly numpads/inputs.

---

### Module 3: Nutrition & Diet Studio Engine
* **Files in Scope**:
  - `src/components/coach/DietPlansView.tsx`
  - `src/components/coach/AssignDietModal.tsx`
  - `src/components/coach/nutrition/*`
  - `src/lib/foodDatabase.ts`
  - `src/services/openFoodFactsService.ts`
  - `src/services/dietService.ts`
* **Zod Schemas to Build**:
  - `DietPlanSchema`: Title, target calories, target macros (protein, carbs, fats), meals array.
  - `CustomFoodSchema`: Name, serving unit, calories, protein, carbs, fats with macro-calorie consistency check.
* **Missing Logic & Edge Cases**:
  - Macro calculation precision: Grams vs Servings calculations without floating-point rounding errors (e.g. `12.000000001g`).
  - Barcode scanner fallback: Clean offline and manual entry flow when OpenFoodFacts API returns empty or errors.
  - Food swap calculations: Equivalent portion calculator based on primary macro match.
* **Responsive Blueprint (< 1280px)**:
  - Macro distribution bars wrap gracefully on small screens.
  - Food search and custom food creation expand to full mobile viewport with sticky action buttons.

---

### Module 4: Progress, Habits & Alerts Engine
* **Files in Scope**:
  - `src/components/trainee/TraineeHabitsView.tsx`
  - `src/components/coach/CoachAlertsView.tsx`
  - `src/components/coach/alerts/AlertCenterDrawer.tsx`
  - `src/lib/alertsEngine.ts`
  - `src/lib/habitsEngine.ts`
  - `src/lib/progressEngine.ts`
  - `src/lib/weightEngine.ts`
* **Zod Schemas to Build**:
  - `HabitLogSchema`: Habit ID, date, status, streak count.
  - `CheckInSchema`: Weight, body measurements (chest, waist, arms), photos array, notes.
* **Missing Logic & Edge Cases**:
  - Bad habits live timer: Performance-optimized interval loop with zero memory leaks when unmounting.
  - Alerts normalization: Deduplication of alerts; priority sorting (Danger > Warning > Info).
* **Responsive Blueprint (< 1280px)**:
  - Habit streak cards and alert list adapt smoothly to single-column card layout on mobile.

---

### Module 5: Coach Business Suite, Competitors & Multi-Tenancy
* **Files in Scope**:
  - `src/components/coach/CoachSettingsView.tsx`
  - `src/components/coach/CompetitorsView.tsx`
  - `src/components/coach/CoachSidebar.tsx`
  - `src/components/Navbar.tsx`
  - `src/lib/whatsapp.ts`
* **Zod Schemas to Build**:
  - `CoachSettingsSchema`: Brand name, WhatsApp number (international regex), currency, renewal reminder days, package pricing.
  - `CompetitorProfileSchema`: Division, target show date, prep phase, water/carb protocols.
* **Missing Logic & Edge Cases**:
  - WhatsApp message formatting: Safe URI encoding for automated check-in and renewal reminders.
  - Currency conversion and package management dynamic updates.
* **Responsive Blueprint (< 1280px)**:
  - Settings tabs switch to horizontal scrollable tab-bar on mobile.
  - Competitor stage readiness cards adapt to vertical accordion cards.

---

### Module 6: System-Wide Security, Responsive Polish & Global Performance Audit
* **Scope & Objectives**:
  - Strict Tenant Scoping: Verify that all data operations filter by `coach_id`.
  - Global XSS and Sanitization audit on all text rendering.
  - Comprehensive PWA audit (offline service worker, touch target sizes >= 44px).
  - Production build verification (`next build`) with zero TypeScript, ESLint, or runtime errors.

---

## 8. Verification & Testing Matrix

For every module refactored, the following 4-step verification gate is required:
1. **TypeScript & Linter Gate**: Zero compilation errors (`npx tsc --noEmit` and `npm run lint`).
2. **Edge Case Stress Test**: Verify 0-data states, malformed IDs, and deleted references.
3. **Responsive Visual Verification**: Verify that widescreen (>= 1280px) is pixel-identical to original, while mobile/tablet views scale cleanly.
4. **Performance Check**: Verify that profiling shows zero redundant re-renders or blocking calculations.
