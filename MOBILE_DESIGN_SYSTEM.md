# Workouts PRO OS — Mobile-First Design System & Ergonomics Manual
> **Status:** Active Production Blueprint  
> **Philosophy:** Ultra-Clean, High-Glanceability, Zero-Scroll Economy, Zero Decorative Icons  
> **Target Device Focus:** Mobile Screens (360px – 430px viewport width) before tablet & desktop  

---

## 🏛️ 1. Core Mobile-First Pillars

### A. Viewport-Fit & Zero-Scroll Spatial Economy
- **The Gym Floor Reality:** A trainee holding a dumbbell in one hand cannot scroll through endless cards to find their workout or log a set.
- **Above-The-Fold Glanceability:** The most critical information for the day (Today's Scheduled Split, Start Button, Daily Calories/Macros, Water & Streak) must fit completely on the primary mobile screen without forcing aggressive scrolling.
- **Zero Wasted Padding:** Eliminate bulky desktop paddings (`py-12`, `p-8`). Replace with tight, disciplined mobile spacing (`p-3`, `p-3.5`, `gap-2.5`, `space-y-3`).
- **Contained Component Heights:** Cards must use smart internal flex distribution (`flex flex-col justify-between`) rather than ballooning vertical heights.

---

### B. Dedicated Mobile Typography & Text Bounds (No Desktop Bleed)
- **Decoupled from Desktop:** Mobile layouts must never inherit desktop font sizes or layouts that cause text to get clipped, cut in half, or awkwardly ellipsized (`...`).
- **Typography Scale (Mobile-Tuned):**
  - **Screen Titles / Section Headers:** `text-sm sm:text-base font-bold tracking-tight text-white` (High density, crisp).
  - **Hero Split & Exercise Names:** `text-base font-bold tracking-tight text-white leading-snug`.
  - **Metrics & Telemetry (Swiss Numerics):** `text-xs sm:text-sm font-mono font-bold tabular-nums`.
  - **Secondary Subtitles & Timestamps:** `text-[11px] font-mono text-zinc-400`.
  - **Micro Badges & Status Pills:** `text-[10px] font-mono uppercase tracking-wider font-semibold`.
- **Text Wrapping & Flow:** Multi-word titles must wrap cleanly (`break-words`, `leading-tight`) with zero overflow or awkward clipping.

---

### C. Zero Decorative Icons Standard
- **Words Over Symbols:** Meaning is communicated via clear, unambiguous typography and structured micro-badges, NOT decorative icons that add visual noise.
- **Permitted Functional Icons Only:**
  - Status checkmarks (`Check`) strictly for completing a set or habit.
  - Directional chevron (`ChevronRight`) for clickable drawer/drill-down triggers.
  - Close button (`X`) strictly for dismissing modals.
- **Forbidden:** No decorative gym icons, no random flame stickers, no decorative weights or sparkles scattered across cards.

---

### D. Obsidian Monochrome Palette & Restrained Accents
- **Base Surfaces:**
  - Screen Background: Deep Obsidian `#09090b` / `#070a0f`.
  - Card Backgrounds: Contained Dark Obsidian `#0d121c` with subtle borders `#16202e` or `#18181b`.
  - Inner Insets / Stat Wells: `#05080e` with 1px border `#111827`.
- **Zero Rainbow / Confetti Colors:**
  - Strict monochromatic calm. Colors are reserved exclusively for functional state indicators:
    - **Emerald (`#10b981` / `text-emerald-400`):** Set completed, habit achieved, target reached.
    - **Amber (`#f59e0b` / `text-amber-400`):** Active countdown rest timer, streak badge.
    - **Cyan (`#06b6d4` / `text-cyan-400`):** Personal Record (PR) milestone.
    - **Rose (`#f43f5e` / `text-rose-400`):** Danger, overdue check-in, missed target.

---

### E. Touch-Target Ergonomics (Thumb-Zone Priority)
- **Minimum Tap Size:** Every interactive button, stepper, and checkmark must be at least `44px × 44px` (or `h-11` minimum) to allow effortless tapping with sweaty hands in the gym.
- **Bottom-Weighted Actions:** Primary calls-to-action ("START WORKOUT", "LOG SET", "SAVE") must reside in the bottom 60% of the mobile viewport.
- **Safe Area Inset Handling:** Sticky bottoms and modals must respect `pb-[calc(env(safe-area-inset-bottom)+0.75rem)]` to prevent clipping behind mobile home indicator bars.

---

## 📱 2. Screen-by-Screen Implementation Directives

| Screen | Target Layout Constraint | Key Information Above-the-Fold | Primary Action |
| :--- | :--- | :--- | :--- |
| **`TraineeDashboard.tsx` (Today)** | Fits in 1 mobile viewport (`max-h-[100dvh]` or contained scroll) | Split Title, Duration, Movement Count, Macro Bar, Water Stepper | Prominent "START WORKOUT" Tap |
| **`LiveWorkoutSession.tsx` (Gym Mode)** | Fullscreen distraction-free | Current Movement, Set Rows (Prev x Weight x Reps), Rest Timer | "Checkmark" per set + "Next Movement" |
| **`WeeklySplitView.tsx` (Program)** | Horizontal day picker + compact movements | 7-Day Day Strip, Target Muscles, Total Prescribed Volume | Tap day to inspect prescribed movements |
| **`TraineeHabitsView.tsx` (Habits)** | Clean grid of compact widgets | Quit Counter ticker, Daily Habits toggles, Water log | Single tap checkmark toggle |
| **`WorkoutHistoryView.tsx` (Progress)** | Clean tabular history + PR log | Weight trend sparkline, Recent completed sessions | Tap session to review set details |

---

## 🛠️ 3. Mobile Execution Checklist (Strict Compliance)

- [ ] Zero horizontal scroll (`overflow-x-hidden` on parent containers).
- [ ] Viewport height dynamic scaling using `h-[100dvh]` instead of generic `h-screen`.
- [ ] Mobile typography scaled and verified at `375px` (iPhone SE/mini) and `390px` (iPhone standard).
- [ ] High contrast ratios (Text `#f4f4f5` or `#e2e8f0` against obsidian surfaces).
- [ ] Tabular numerics applied to all numbers (`font-mono tabular-nums`).
- [ ] Zero decorative icons cluttering the UI.
