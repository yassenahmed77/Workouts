# WORKOUTS COACH OS — ANTI-AI EXECUTIVE DESIGN RULES
> **The Official Design Constitution for Workouts Pro / Coach OS**
> *Status: Active & Mandatory across all views, components, tables, tabs, and modals.*

---

## 0. The Core Problem We Solved (The "AI Look" vs. "Real Pro Tool")

Generic AI-generated interfaces fall into three fatal traps:
1. **The Icon Carnival**: Placing an icon next to every single word (dumbbell next to workout, fork next to diet, user next to athlete, eye next to view). It looks like a children's app rather than an executive tool.
2. **The Rainbow Badge Soup**: Using 10 different bright neon colors (orange, yellow, green, purple, blue) across cards and badges, creating severe visual noise and cognitive overload.
3. **The Endless Scroll Bloat**: Huge arbitrary paddings (`p-8`, `gap-6`) that push information off-screen, forcing the coach to scroll up and down endlessly to piece together what's happening.

**Our Standard**: The Bloomberg Terminal / Linear / Raycast philosophy.
- **Typography-First**: Words and numbers carry meaning, not decorative icons.
- **Monochromatic Calm**: Deep obsidian and charcoal surfaces with subtle hairline dividers; peaceful for the eyes during hours of daily coaching work.
- **Viewport-Fit Architecture**: Information is engineered to fit the desktop screen naturally without page scroll.
- **Tabular Precision**: Swiss-watch numeric alignment using monospace tabular numbers.

---

## 1. Rule #1: Viewport-Fit Architecture (Strict No-Page-Scroll)

### 1.1. Main Layout Guarantee
- The entire application layout on desktop viewports (`md:` and above, 1366×768 to 1920×1080) must remain strictly locked: `h-screen overflow-hidden`.
- **Zero Full-Page Scrolling**: The coach must never see the whole browser window scroll down. The sidebar, top headers, KPI summaries, and view navigation must stay pinned and visible.

### 1.2. Internal Container Scrolling
- If a list or table contains many items (e.g. 20 clients, 15 check-ins, exercise logs):
  - Only that specific child container is allowed to scroll vertically: `flex-1 min-h-0 overflow-y-auto custom-scrollbar`.
  - The parent card, headers, search bars, and action bars remain firmly anchored.

### 1.3. Spacing Discipline
- Replace loose spacing (`p-6`, `p-8`, `gap-6`) with compact, calibrated dimensions:
  - Card padding: `p-2.5` to `p-3.5` (never more than `p-4`).
  - Grid & flex gaps: `gap-1.5` to `gap-2` (maximum `gap-2.5`).
  - Section headers: tight margins (`mb-1.5` or `mb-2`).

---

## 2. Rule #2: Absolute Zero Decorative Icon Policy (Typography-First)

### 2.1. Complete Ban on Decorative Icons
- **Strictly Forbidden**:
  - ❌ No icons next to sidebar navigation labels (no Home icon, no Users icon, no Dumbbell icon).
  - ❌ No icons inside sub-tabs (no Activity, no FileText, no Utensils).
  - ❌ No icons inside primary or secondary buttons (`+ Add`, `→ Next`, `← Back`).
  - ❌ No decorative icon boxes above empty states.
  - ❌ No emojis anywhere in buttons, badges, or headers.

### 2.2. Text-Only Representation
- Clean, crisp English typography communicates everything:
  - Instead of `[Dumbbell Icon] Workout Splits` → **`Splits Studio`** or **`Training`**.
  - Instead of `[Utensils Icon] Nutrition` → **`Nutrition Studio`** or **`Diet`**.
  - Instead of `[CheckCircle Icon] Active` → **`Active`**.
  - Instead of `[Plus Icon] New Athlete` → **`New Athlete`** or **`+ Athlete`**.
  - Instead of `[ArrowLeft Icon] Back` → **`Back`**.

### 2.3. Strictly Permitted Functional Exceptions
- Only micro functional controls are permitted:
  - Minimal search magnifying glass inside search input wells.
  - Minimal dropdown caret (`ChevronDown` or `▼`) for select inputs.
  - Minimal `X` button for dismissing modals (or text button `Close`).

---

## 3. Rule #3: Monochromatic Calm Dark Palette (Zero Rainbow Carnival)

### 3.1. Surface Tokens
| Surface Token | Hex / Tailwind Class | Application |
|---|---|---|
| **Canvas Background** | `#070a0f` / `bg-[#070a0f]` | Outer screen canvas, desktop root background |
| **Primary Card / Well** | `#080c14` / `bg-[#080c14]` | Standard card containers, table backgrounds, panels |
| **Elevated Surface** | `#0d121c` / `bg-[#0d121c]` | Active rows, dropdown menus, hover layers |
| **Hairline Dividers** | `border-white/[0.06]` or `#141b26` | Card borders, table dividers, panel splitters |

### 3.2. Typography Color Hierarchy
- **Primary Text**: Pure white (`#ffffff` / `text-white`) for view titles, client names, active values, and primary buttons.
- **Secondary Text**: Muted slate (`#94a3b8` / `text-slate-300`) for column headers, active labels, and standard text.
- **Muted Metadata**: Deep slate (`#64748b` / `text-slate-400` / `text-slate-500`) for helper notes, timestamps, unit labels, and secondary tags.

### 3.3. Status Indicators (Quiet Signals, No Loud Badges)
- Ban bright neon colored badges that compete for visual attention.
- When an alert or status is critical:
  - Use a subtle 3-pixel micro-dot (`w-1.5 h-1.5 rounded-full bg-rose-400` or `bg-emerald-400`).
  - Or a quiet tinted tag: `bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-mono`.

---

## 4. Rule #4: Progressive Disclosure & Information Architecture (3-Tier Model)

Never dump all data on a single screen at once:
1. **Tier 1 — The Pulse (At-a-glance Scan, ~2 seconds)**:
   - High-level overview: Total active roster, urgent alerts count, capacity.
   - Clean, quiet indicator cards without charts cluttering the top fold.
2. **Tier 2 — Contextual Summary (~10 seconds)**:
   - Client card or row: Name, current/target weight, workout plan title, last check-in date.
   - Clear visual rhythm without nested card boxes ("Zero Box-in-a-Box").
3. **Tier 3 — Deep Dive & Action**:
   - Deep review happens in dedicated, focused workspaces:
     - Opening an athlete switches to the **Client 360 Workspace** (`ClientDetailView`).
     - Building a plan opens the **Studio** with dedicated focus.
     - Urgent interventions open a clean side Drawer or Sheet, not a cramped inline popover.

---

## 5. Rule #5: Tabular Data Precision (Swiss Chronometer Standards)

- **Numeric Fonts**: All weights (`68.5 kg`), calories (`2,400 kcal`), sets/reps (`4 × 10`), dates (`Sep 26`), percentages (`78%`), and durations (`12w`) must use:
  - `font-mono tabular-nums` or `font-numeric`.
- **Vertical Alignment**: Numbers in tables and metric strips must align vertically so the coach can scan down a column effortlessly without eye zigzagging.

---

## 6. Rule #6: Real Product-Ready Terminology (Zero Buzzword Inflation)

### 6.1. The "Real Coach" Standard
- Never use over-engineered, academic, marketing-deck jargon. Real coaches speak directly and clearly.
- Any fitness coach or athlete must understand every label instantly without confusion.

### 6.2. Terminology Dictionary
| ❌ Forbidden Buzzword | ✅ Product-Ready Coach Standard |
|---|---|
| `Client 360` / `Client 360° Suite` | **`Client Profile`** or **`Client Details`** |
| `Progression Vault` / `Milestones Audit` | **`Exercise History`** or **`Personal Bests`** |
| `Broken Records` / `Records Vault` | **`PRs`** or **`Personal Records`** |
| `Dynamic Overload Vector` | **`Strength Progress`** |
| `Coach Directives Notepad` | **`Notes`** |
| `Telemetry Strip` / `Kpi Deck` | **`Metrics`** or **`Overview`** |
| `Action Queue Protocol` | **`Upcoming Tasks`** or **`Action Items`** |
| `Splits Studio Protocol` | **`Workout Plans`** or **`Splits`** |
| `Nutrition Telemetry` | **`Diet & Macros`** |

---

## 7. Rule #7: Zero Subtitle Fluff & Concise Microcopy (No Multi-Line Essays)

### 7.1. Eliminate "Explaining the Obvious"
- ❌ **Forbidden**: Multi-line paragraphs explaining basic UI elements:
  - *"Overall status of your client roster across training, nutrition, and engagement."*
  - *"Click to audit broken records and progressive overload history."*
  - *"Average change across all active clients over the last 8 weeks."*
  - *"Check-ins, diet reviews, and athlete tasks requiring coach intervention."*
- ✅ **Required**: Let the data speak for itself.
  - If a card title is **`Roster Health`**, it needs **zero** subtitle, or at most 2 words: `13 active`.
  - If a section is **`Recent Activity`**, no explanation needed.
  - If a metric is **`Strength Gain`**, simply show `+14.5 kg`.

### 7.2. Single-Line Header Constraint
- Section titles and cards must never wrap into 2 or 3 lines of introductory prose. Save screen space for actual athlete data.

---

## 8. Implementation Checklist for App Refactor

| Component / View | File Path | Status | Key Focus |
|---|---|---|---|
| **Coach Sidebar** | `src/components/coach/CoachSidebar.tsx` | ⏳ Pending | Remove all decorative icons, pure typography, compact vertical fit |
| **Executive Dashboard** | `src/components/coach/CoachDashboardView.tsx` | ⏳ Pending | Viewport-fit (zero page scroll), kill subtitle fluff, zero icons, calm monochrome |
| **Clients Directory** | `src/components/coach/ClientsList.tsx` | ⏳ Pending | High-density Swiss table, tabular numerics, clean text-only filters |
| **Client Details** | `src/components/coach/client-detail/ClientDetailView.tsx` | ⏳ Pending | Replace "Client 360", clean compact header, text-only tabs, locked height |
| **Client Overview** | `src/components/coach/client-detail/ClientOverviewTab.tsx` | ⏳ Pending | Kill box-in-a-box nesting, kill essay subtitles, compact metric strips |
| **Workout Plans** | `src/components/coach/SplitsStudioView.tsx` | ⏳ Pending | Pure panel layout, internal list scroll, clean terminology |
| **Diet Plans** | `src/components/coach/DietPlansView.tsx` | ⏳ Pending | Calm macros strip, connected rows, zero rainbow tags |
| **Competitors Hub** | `src/components/coach/CompetitorsView.tsx` | ⏳ Pending | High-density contest prep tracking, timeline telemetry |

---

*This document is the single source of truth for design decisions across Workouts Coach OS.*
