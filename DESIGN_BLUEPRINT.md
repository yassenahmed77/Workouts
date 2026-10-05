# Workouts Pro — Design Blueprint & System Standards

> **Authoritative Design Specification**  
> This document defines the permanent visual, structural, and behavioral standards for the entire Workouts Pro application. Every page, component, modal, and action must strictly comply with these rules.

---

## 1. Core Principles

1. **Dark Luxury Obsidian Theme**  
   Deep, matte black/obsidian backgrounds with refined subtle borders and electric cyan accents. Never use generic bright blues, washed-out grays, or stark white cards.
2. **Strictly Text-Only Actions (No Icons, No Arrows, No Emojis)**  
   Buttons, choice pills, badges, and segmented controls must be clean text only.  
   - ❌ **Forbidden**: `+ Build Diet`, `Open in Studio →`, `Scan Barcode 📱`, `← Back`.  
   - ✅ **Required**: `Build Diet`, `Open in Studio`, `Scan Barcode`, `Back to Library`.  
   - Minimal utility icons (like the modal close `X` or input search magnifying glass) are permitted strictly when necessary for pure tool navigation.
3. **English Language Only**  
   All labels, buttons, headers, tooltips, placeholders, and error messages must be in English. No mixed languages.
4. **Product-Ready Professional Copy**  
   Zero mock, informal, joke, or conversational data anywhere in the UI or placeholders (e.g., no "Hohos", no "cake"). All placeholders must use genuine athletic/clinical fitness terminology (`Greek Yogurt`, `Whey Protein`, `Grilled Chicken Breast`, `1 Scoop`, `100g`).
5. **Fit Screen by Default**  
   Modals, dialogs, and main panels must fit standard desktop/laptop viewports (1366x768 / 1920x1080) naturally. Content must never cause unwanted vertical scrollbars or push primary action buttons below the fold.
6. **Zero Generic AI Icon Boxes**  
   Eliminate decorative icon boxes above empty states (such as dumbbell, utensils, or layers boxes) and unnecessary button icons that make web apps look like boilerplate AI templates. Keep empty states, headers, and cards sleek, executive, and typography-driven.

---

## 2. Color Palette & Surface Tokens

| Token | Class / Hex | Purpose & Usage |
|---|---|---|
| **Deep Track / Input Well** | `bg-[#05080e]` | Inside inputs, segmented control tracks, data wells, inactive toggle backgrounds |
| **Base Surface** | `bg-[#080c14]` | Primary modal background, main canvas, default card backgrounds |
| **Elevated Surface** | `bg-[#0b101b]` | Section cards, modal headers, active card containers |
| **Hover Surface** | `bg-[#111827]` | Interactive hover state for secondary buttons and table rows |
| **Subtle Border** | `border-[#141b26]` | Outer borders for cards, modals, and panel split dividers |
| **Inner Border** | `border-[#16202e]` | Input borders, track borders, internal section borders |
| **Accent Glow / Border** | `border-cyan-500/35` | Active pills, focused inputs, selected food items |
| **Accent Background** | `bg-cyan-500/15` | Active choice pill background, selected state highlight |
| **Accent Text** | `text-cyan-300` / `text-cyan-400` | Highlighted values, active tab titles, focus indicators |
| **Primary Text** | `text-white` | Main headings, food titles, active values, button labels |
| **Secondary Text** | `text-slate-300` | Field labels, primary table cell text |
| **Muted Text** | `text-slate-400` | Subtitles, descriptions, helper hints |
| **Placeholder Text** | `text-slate-500` | Input placeholder hints |

---

## 3. Unified Choices List & Segmented Controls

All filter bars, mode switches, and category selectors must strictly use this unified segmented structure:

```tsx
/* Outer Track */
<div className="flex items-center gap-1 p-1 rounded-xl bg-[#05080e] border border-[#16202e]">
  
  {/* Active Item */}
  <button
    type="button"
    className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 font-bold shadow-sm shadow-cyan-950/40 transition-all cursor-pointer"
  >
    All Protocols
  </button>

  {/* Inactive Item */}
  <button
    type="button"
    className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent transition-all cursor-pointer"
  >
    Athlete Diets
  </button>
</div>
```

- **Rule**: Text only. Never place icons, emojis, or numbers with arrows inside choice items.

---

## 4. Buttons & Interactive Elements

### 4.1. Primary Action Button (White Pill)
Used for the single most important action on a view (e.g., `Save to Library & Use`, `Build Split`, `Build Diet Plan`, `Add to Meal`):
```tsx
<button
  type="submit"
  className="py-2 px-5 rounded-xl bg-white hover:bg-slate-100 text-[#080c14] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
>
  Save to Library & Use
</button>
```

---

## 4.3. Studio Views: Connected Panel Architecture & Internal Scrolling
For studio views (`SplitsStudioView` and `DietPlansView`):
1. **Zero Disconnected Floating Cards**: Rows are connected within unified panel containers (`rounded-2xl bg-[#080c14] border border-[#141b26] divide-y divide-[#141b26]`).
2. **Inner Container Scrolling**: Never scroll the outer page or layout window. Dedicated internal scroll (`flex-1 min-h-0 overflow-y-auto custom-scrollbar`) keeps page headers and quick search bars pinned.
3. **Symmetric Row Layout**: Both Active Plans (left) and Awaiting Plans (right) share the exact same clean connected row design: Avatar circle + Athlete Name + Subtitle Details + Action Button(s).
4. **Zero Medical/Doctor Terminology**: NEVER use the word "Protocol" in user-facing UI ("ehna mesh dkatra"). Use `Workout Split`, `Diet Plan`, `Routine`, or `Plan`.
5. **No Duplicate Metric Badges**: Header titles (`Splits Studio`, `Nutrition Studio`) must not repeat active client count badges if the panel card below already displays the active count.
6. **Zero-Scroll Fit for Card Tabs**: Filter pills inside cards (like Home Upcoming & Actions) must fit across full width with zero scrollbar (`noScroll` with `w-full gap-0.5`).

### 4.2. Secondary Action Button (Obsidian Pill)
Used for secondary actions, cancel buttons, back buttons, and auxiliary tools:
```tsx
<button
  type="button"
  className="py-2 px-4 rounded-xl bg-[#080c14] hover:bg-[#111827] border border-[#16202e] hover:border-cyan-500/30 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer active:scale-95"
>
  Cancel
</button>
```

- **Rule**: Never prefix button labels with `+`, `-`, `→`, or `←`. Write clear descriptive English text (`Add Custom Food`, not `+ Add Custom Food`; `Back to Library`, not `← Back`).

---

## 5. Forms, Inputs & Data Entry Standards

1. **Zero Pre-Filled Fake Numbers**  
   - Any form for adding or configuring items must initialize numeric fields as empty strings (`''`).
   - Inputs must show subtle placeholders (e.g. `placeholder="0"` or `placeholder="100"`), never hardcoded pre-selected numbers that force the user to backspace.
2. **Dynamic Section Titles**  
   - Never use static labels when the base changes. If the user selects `50g` or `1 Scoop`, the nutrient header must dynamically read:  
     `Nutritional Values (50g)` or `Nutritional Values (1 Scoop)`.
3. **Weight vs. Serving Clarity**  
   - Always allow clear switching between **By Weight (g)** and **By Serving / Piece**.
   - If "By Serving" is selected, provide an optional weight in grams so calculations scale accurately without ever treating "1 Serving" as "1 Gram".
4. **High Z-Index & Stacking Architecture**  
   - Dropdown menus (`SelectDropdown`) must have `z-[150]` with backdrop-blur.
   - Form cards containing dropdowns must have descending z-index (`relative z-20`, `relative z-10`, `relative z-0`) so popovers never clip or get obscured by sibling containers.

---

## 6. Modals, Views & Screen Space Management

1. **Dedicated Full-Space Views**  
   - When a user enters a secondary mode or form (such as "Create Custom Food"), **never** open it as a cramped drawer squeezed over an active search list.
   - Switch the modal body to a dedicated, clean view that takes full ownership of the space, allowing the user to focus without clutter.
2. **Fit Screen Guarantee**  
   - Keep vertical margins and card paddings compact (`p-3` to `p-4`, `space-y-2.5` to `space-y-3`).
   - Ensure the entire dialog fits within 92vh so desktop and laptop users never see vertical scrollbars for basic forms.
3. **Click Outside to Close**  
   - Modals must dismiss when clicking the dark backdrop.
   - Dropdown menus must dismiss when clicking anywhere outside their container.
4. **Action Isolation Mode**  
   - When a specific item is scanned (barcode) or custom-created, the main list must enter **Isolation Mode** displaying only that item, accompanied by a clean banner and a `View All Foods` reset action.
5. **Natural Fit-Screen via Dimensions (The Non-Clipping Scroll Philosophy)**  
   - **Foundational Rule**: When requested to "cancel or remove the scroll", this **NEVER** means using `overflow-hidden` or negative margins to artificially cut off content.
   - Forcing `overflow-hidden` or negative margins slices off inputs, popovers, and bottom metrics bars.
   - The correct engineering standard is: **Fit the Screen by Tuning Dimensions**. Compact form paddings (`p-3` to `p-3.5`), tight vertical spacing (`space-y-2.5` to `space-y-3`), and balanced typography ensure the content naturally fits standard desktop/laptop viewports (1366x768 / 1920x1080) so that scrollbars vanish automatically.
   - **Scroll Liveness**: Containers must ALWAYS keep `overflow-y-auto custom-scrollbar` enabled. As soon as page or card content grows (e.g., muscle popovers, multi-tier meals, additional exercises, or shorter screen viewports), standard smooth scrolling must engage naturally with zero clipping.
6. **Multi-Tab Rows & Wrapping (No Horizontal Scrollbars)**  
   - Tab rows (such as workout Days: `Day 1`, `Day 2`, `Day 3`, `Day 4`, `Day 5`) must **never** show an ugly horizontal scrollbar with arrow controls.
   - Configure tab lists with `flex-wrap gap-1.5` and appropriate max-width so that after 3 or 4 tabs, subsequent days automatically wrap down onto the next line (`ynzlo ta7t ba3d`).
7. **Horizontal Quick Filter Tracks (Visible Scrollbars & PC Mousewheel Support)**  
   - Quick filter tracks (e.g. Muscle Quick Filters: `All`, `Chest`, `Back`, etc.) must display a fixed number of complete items (e.g. 7 whole items) without awkward word clipping.
   - **Never use `scrollbar-none`** on interactive filter tracks: desktop PC users without trackpads need a visible, draggable scrollbar (`custom-scrollbar` with visible track & thumb).
   - **Attach `onWheel` listener**: Map vertical mousewheel scrolls to horizontal scrolling (`if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY;`) so desktop PC users with standard two-button scroll mice can smoothly scroll horizontally.

---

## 7. Metrics & Sets Counting Standard

- **Sets Over Shapes/Movements**: Workout day badges and indicators must display the total number of **prescribed sets** (the mathematical sum of all sets across all exercises planned for that day), **not** the number of movements/exercises.
- **Monospace Tabular Numerics**: Every set count, repetition, macro value, and calorie metric must strictly use `font-numeric` or `font-mono` for precision and legibility.

---

## 8. Studio Header & Vertical Baseline Alignment

- All header title elements (`Split Studio`, dot separator `•`, Split Title, Athlete Badges) must share matching vertical line heights (`leading-none` or `items-center`) to guarantee identical baseline alignment. No floating or offset text baselines are allowed.
- Studio primary actions must remain clean, text-only, and uncluttered (e.g. `Save Split`, `Publish Split`, `Cancel`), omitting redundant secondary floating buttons like `Volume Stats`.

---

## 9. View Spacing & Top Screen Breathing Room

- **Global View Top Padding**: All internal full-page views (Splits Studio, Nutrition Studio, Clients Directory, Competitor Tracking, Exercise Library, Alerts) must have generous top padding (`pt-4 sm:pt-6 pb-6`) so headers and hero elements never touch or stick to the top window frame.
- **Dashboard Exception**: Only the high-density executive `CoachDashboardView` retains compact top padding (`pt-2 sm:pt-2.5 pb-2`) to maximize above-the-fold telemetry cards.

---

## 10. Typography & Design Tokens Summary

- **Body & Headings**: Clean sans-serif (`font-sans`), tracking tight on headings (`tracking-tight`).
- **Numbers, Weights, Macros, Calories**: Always use numeric monospace styling (`font-numeric` or `font-mono`) to guarantee tabular visual alignment across rows and cards.
- **Button Standards**: Text-only, zero icons/emojis/arrows (`Build Split`, `Add Movement`, `New Movement`, `Publish Split`).

---

## 11. Toast Notifications Standard (Zero Icons & Obsidian Luxury)

- **Strictly Zero Icons**: Never render any Lucide icons, SVGs, or emoji boxes inside toasts. No flame, alert circles, sparkles, or cross (`X`) buttons.
- **Surface & Elevation**: Deep obsidian glassmorphism (`bg-[#080c14]/95 border-[#16202e] backdrop-blur-2xl rounded-xl z-[200]`).
- **Telemetry Indicators**: Pure CSS status light (`w-2 h-2 rounded-full` in `bg-cyan-400 shadow-cyan-400/90` or `bg-rose-500 shadow-rose-500/90`) paired with clean uppercase monospace status tags (`SUCCESS`, `ALERT`, `INFO`).
- **Text-Only Dismiss**: Minimalist `Dismiss` text action (`text-[10px] font-mono text-slate-500 hover:text-white`) with click-to-dismiss on the entire card.
- **Bottom Accent Glow Line**: Subtle glowing gradient line along the bottom border (`bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent`).

---

*This blueprint governs all future frontend development on Workouts Pro.*
