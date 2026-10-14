# Master Architecture & Developer Handbook (Gym Coaching & Athlete Platform)

> **Dalil el-Ta3del w Kharitet el-Mashrou3 el-Kamla (From A to Z)**  
> Da el-marja3 el-shamel le kol file, kol feature, ezay el-donia marboota b-ba3daha, w feen el-amaken elly mafehash real backend 3shan t-kamelha b-edak.

---

## 1. El-Stracture el-3am (Directory Hierarchy)

```
d:/gym/
├── public/                 # Static assets (icons, sounds, manifest, sw.js)
├── src/
│   ├── app/                # Next.js App Router (Entrypoint, CSS, Layout)
│   ├── components/         # Kol el-UI Screens, Widgets, w el-Modals
│   │   ├── auth/           # Login & Switch User
│   │   ├── coach/          # Coach Experience (Dashboard, Clients, Plans, Alerts)
│   │   │   ├── alerts/     # Slide-over alert drawer
│   │   │   ├── client-detail/ # Athlete 360 profile (7 sub-tabs)
│   │   │   ├── competitors/# Stage athletes & bodybuilding prep
│   │   │   ├── dashboard/  # Coach KPI widgets & charts
│   │   │   ├── exercises/  # Global movement library & shared modals
│   │   │   ├── nutrition/  # Diet builder, food search & barcode
│   │   │   └── workout-builder/ # Movement picker, volume analyzer
│   │   ├── modals/         # Global dialogs (New Trainee, Edit Trainee)
│   │   ├── notifications/  # Notification center
│   │   ├── pwa/            # Install app prompt & offline banner
│   │   ├── trainee/        # Trainee Experience (Dashboard, Split, Diet, Habits)
│   │   │   ├── dashboard/  # 7-day strip, Sunrise arc gauge, active workout launcher
│   │   │   ├── diet/       # Meals, calories, macros checklist
│   │   │   ├── habits/     # Habit streaks & relapse reflection
│   │   │   └── profile/    # Weight logs & personal records
│   │   └── ui/             # Reusable Design System (Dropdown, DatePicker, Tabs, Cards)
│   ├── context/            # Global State Store (GymContext, ToastContext)
│   ├── hooks/              # Headless Controller Hooks (Data fetching & business logic)
│   ├── lib/                # Pure Algorithmic Engines (Calculations, Mock DB, Audio)
│   ├── schemas/            # Zod validation schemas
│   ├── services/           # Service layer (CRUD logic & external APIs)
│   └── types/              # TypeScript definitions & data contracts
```

---

## 2. El-Kharita el-Tafseleya: Lma t3oz feature kaza, tla2eha fe anhy files?

### A. State, Data Store & Types (El-Mokh bta3 el-Site)
* **[src/context/GymContext.tsx](file:///d:/gym/src/context/GymContext.tsx)**:
  * Da aham file f el-mashrou3 kolo. Feh el-State el-ra2eisy: `users`, `plans`, `dietPlans`, `checkIns`, `logs`, `currentUser`.
  * By7fadh kol 7aga f `localStorage` (`gym_users`, `gym_plans`, etc.).
* **[src/lib/initialData.ts](file:///d:/gym/src/lib/initialData.ts)**:
  * Feh el-Mock Data el-awleya elly el-website byfta7 beha awel mara (Captain Mohamed, Rawan, tamareen, wgbat, check-ins).
* **[src/types/index.ts](file:///d:/gym/src/types/index.ts)**:
  * Feh kol el-Interfaces w el-Types (`User`, `WorkoutPlan`, `Exercise`, `DietPlan`, `CheckIn`, `WorkoutLog`).
* **[src/context/ToastContext.tsx](file:///d:/gym/src/context/ToastContext.tsx)**:
  * El-Toasts el-khedra w el-7amra elly btzhr lma t-save aw y7sal error (`showToast('...', 'success')`).

---

### B. Coach Portal (Saf7at w Modals el-Captain)

| Feature / El-Shasha | El-Files el-Asaseya | El-Wazeefa |
| :--- | :--- | :--- |
| **Routing & Tab Switcher** | [src/app/page.tsx](file:///d:/gym/src/app/page.tsx)<br>[src/hooks/useAppRouting.ts](file:///d:/gym/src/hooks/useAppRouting.ts) | By-switch been el-Coach w el-Trainee, w by2ra el-query params f el-URL (`?tab=clients&client=u1`). |
| **Coach Sidebar** | [src/components/coach/CoachSidebar.tsx](file:///d:/gym/src/components/coach/CoachSidebar.tsx) | El-Sidebar el-shemal, navigation icons, collapse toggle, hotkey `Ctrl+B`. |
| **Coach Dashboard** | [src/components/coach/CoachDashboardView.tsx](file:///d:/gym/src/components/coach/CoachDashboardView.tsx) | KPIs, Revenue, Roster quick-look, Critical alerts, Attendance stats. |
| **Athletes Table (Clients)** | [src/components/coach/ClientsList.tsx](file:///d:/gym/src/components/coach/ClientsList.tsx)<br>[src/hooks/useClientsList.ts](file:///d:/gym/src/hooks/useClientsList.ts) | Table el-la3eeba, search, filter b-el-plan, عمود Membership (`kam days left`), زرار WhatsApp el-mubasher. |
| **Add New Athlete Modal** | [src/components/modals/NewTraineeModal.tsx](file:///d:/gym/src/components/modals/NewTraineeModal.tsx) | Form tasgeel la3eb gded: checks bta3et el-wazn vs el-hadaf, duplicate account detection, Obsidian DatePicker, 2-column zero scroll. |
| **Athlete 360 Profile** | [src/components/coach/client-detail/ClientDetailView.tsx](file:///d:/gym/src/components/coach/client-detail/ClientDetailView.tsx) | Saf7et el-la3eb el-shaml. Feha 7 Sub-tabs:<br>• **Overview**: [ClientWeightTrajectoryCard.tsx](file:///d:/gym/src/components/coach/client-detail/overview/ClientWeightTrajectoryCard.tsx), [ClientStrengthProgressCard.tsx](file:///d:/gym/src/components/coach/client-detail/overview/ClientStrengthProgressCard.tsx), [ClientHabitsAttendanceCard.tsx](file:///d:/gym/src/components/coach/client-detail/overview/ClientHabitsAttendanceCard.tsx)<br>• **Workout**: [ClientWorkoutTab.tsx](file:///d:/gym/src/components/coach/client-detail/ClientWorkoutTab.tsx)<br>• **Nutrition**: [ClientNutritionTab.tsx](file:///d:/gym/src/components/coach/client-detail/ClientNutritionTab.tsx)<br>• **Check-ins**: [ClientCheckInsTab.tsx](file:///d:/gym/src/components/coach/client-detail/ClientCheckInsTab.tsx)<br>• **Form Checks**: [ClientFormChecksTab.tsx](file:///d:/gym/src/components/coach/client-detail/ClientFormChecksTab.tsx), [FormCheckModal.tsx](file:///d:/gym/src/components/coach/client-detail/FormCheckModal.tsx)<br>• **Logs**: [ClientLogsTab.tsx](file:///d:/gym/src/components/coach/client-detail/ClientLogsTab.tsx)<br>• **Notes & Timeline**: [ClientNotesTab.tsx](file:///d:/gym/src/components/coach/client-detail/ClientNotesTab.tsx), [ClientTimelineTab.tsx](file:///d:/gym/src/components/coach/client-detail/ClientTimelineTab.tsx) |
| **Workout Plan Builder** | [src/components/coach/WorkoutPlanBuilderModal.tsx](file:///d:/gym/src/components/coach/WorkoutPlanBuilderModal.tsx)<br>[src/hooks/useWorkoutPlanBuilder.ts](file:///d:/gym/src/hooks/useWorkoutPlanBuilder.ts) | Bina2 el-tadreeb, splits, sets, reps, RPE, rest intervals. |
| **Movement Form (Badeel & Videos)** | [src/components/coach/exercises/ExerciseFormModal.tsx](file:///d:/gym/src/components/coach/exercises/ExerciseFormModal.tsx)<br>[src/components/coach/workout-builder/NewMovementModal.tsx](file:///d:/gym/src/components/coach/workout-builder/NewMovementModal.tsx) | Shared modal 2-column: esm el-tamreen, video guide, tmarina badeela, video badeel, form cues. Zero scroll. |
| **Global Exercise Library** | [src/components/coach/ExerciseLibraryView.tsx](file:///d:/gym/src/components/coach/ExerciseLibraryView.tsx) | Maktabet el-tamareen kolaha, muscle filter, search, preview videos. |
| **Diet Plans Studio** | [src/components/coach/DietPlansView.tsx](file:///d:/gym/src/components/coach/DietPlansView.tsx)<br>[src/components/coach/nutrition/NutritionPlanBuilderModal.tsx](file:///d:/gym/src/components/coach/nutrition/NutritionPlanBuilderModal.tsx) | Bina2 khotat el-taghzia, wgbat, macros, calories. |
| **Barcode & Food Search** | [src/components/coach/nutrition/BarcodeScannerModal.tsx](file:///d:/gym/src/components/coach/nutrition/BarcodeScannerModal.tsx)<br>[src/lib/foodDatabase.ts](file:///d:/gym/src/lib/foodDatabase.ts)<br>[src/services/openFoodFactsService.ts](file:///d:/gym/src/services/openFoodFactsService.ts) | Ba7s 3n el-akl bel-barcode aw el-esm w 7sab calories. |
| **Competitors Studio (Botolat)** | [src/components/coach/CompetitorsView.tsx](file:///d:/gym/src/components/coach/CompetitorsView.tsx)<br>[src/hooks/useCompetitors.ts](file:///d:/gym/src/hooks/useCompetitors.ts) | Bodybuilding prep, divisions, peak week protocol, countdown. |
| **Coach Alerts Center** | [src/components/coach/CoachAlertsView.tsx](file:///d:/gym/src/components/coach/CoachAlertsView.tsx)<br>[src/components/coach/alerts/AlertCenterDrawer.tsx](file:///d:/gym/src/components/coach/alerts/AlertCenterDrawer.tsx)<br>[src/lib/alertsEngine.ts](file:///d:/gym/src/lib/alertsEngine.ts) | Tanbeehat: la3eb fatah check-in, wazn tal3 fagaa, eshterak hy5las. |
| **Calendar View** | [src/components/coach/CalendarView.tsx](file:///d:/gym/src/components/coach/CalendarView.tsx) | Mawa3eed el-check-ins, renewals, w sessions. |
| **Coach Settings** | [src/components/coach/CoachSettingsView.tsx](file:///d:/gym/src/components/coach/CoachSettingsView.tsx)<br>[src/services/coachSettingsService.ts](file:///d:/gym/src/services/coachSettingsService.ts) | Currency (EGP, USD), as3ar el-eshterakat, WhatsApp templates. |

---

### C. Trainee Portal (Saf7at el-La3eb)

| Feature / El-Shasha | El-Files el-Asaseya | El-Wazeefa |
| :--- | :--- | :--- |
| **Trainee Navbar** | [src/components/Navbar.tsx](file:///d:/gym/src/components/Navbar.tsx) | Top navigation bar ll-athlete (Today, Split, Diet, Habits, History, Profile). |
| **Trainee Dashboard (Today)** | [src/components/trainee/TraineeDashboard.tsx](file:///d:/gym/src/components/trainee/TraineeDashboard.tsx) | Saf7et el-yom: 7-day strip ([CalendarStrip.tsx](file:///d:/gym/src/components/trainee/dashboard/CalendarStrip.tsx)), Sunrise Arc gauge, Today's Workout ([TodayWorkoutCard.tsx](file:///d:/gym/src/components/trainee/dashboard/TodayWorkoutCard.tsx)), Water tracker ([HydrationCard.tsx](file:///d:/gym/src/components/trainee/dashboard/HydrationCard.tsx)). |
| **Live Workout Tracker** | [src/components/trainee/LiveWorkoutSession.tsx](file:///d:/gym/src/components/trainee/LiveWorkoutSession.tsx)<br>[src/lib/activeWorkoutEngine.ts](file:///d:/gym/src/lib/activeWorkoutEngine.ts)<br>[src/lib/audio.ts](file:///d:/gym/src/lib/audio.ts) | Tasgeel el-tamreena set-by-set w enta f el-gym, rest timer, sawt safara, w draft recovery lw el-saf7a 2flt fagaa. |
| **Weekly Split View** | [src/components/trainee/WeeklySplitView.tsx](file:///d:/gym/src/components/trainee/WeeklySplitView.tsx) | Tagseem el-esboo3, ayam el-tamreen w ayam el-ra7a. |
| **Trainee Diet View** | [src/components/trainee/TraineeDietView.tsx](file:///d:/gym/src/components/trainee/TraineeDietView.tsx)<br>[src/hooks/useTraineeDiet.ts](file:///d:/gym/src/hooks/useTraineeDiet.ts) | Wgbat el-yom, checkmark 3la kol wgba, 7sab el-macros el-ba2ya. |
| **Habits & Quit Bad Habits** | [src/components/trainee/TraineeHabitsView.tsx](file:///d:/gym/src/components/trainee/TraineeHabitsView.tsx)<br>[src/lib/habitsEngine.ts](file:///d:/gym/src/lib/habitsEngine.ts)<br>[src/hooks/useTraineeHabits.ts](file:///d:/gym/src/hooks/useTraineeHabits.ts) | Motaba3et el-3adat el-sehya, botoolat el-streak, w tasgeel relapse reflections. |
| **Workout History** | [src/components/trainee/WorkoutHistoryView.tsx](file:///d:/gym/src/components/trainee/WorkoutHistoryView.tsx) | Tarikh el-tamreenat el-qadeema w arqam el-awzan. |
| **Trainee Profile** | [src/components/trainee/TraineeProfileView.tsx](file:///d:/gym/src/components/trainee/TraineeProfileView.tsx)<br>[src/hooks/useTraineeProfile.ts](file:///d:/gym/src/hooks/useTraineeProfile.ts) | Biometrics, goal, chart el-wazn, w ma3loomat el-coach. |

---

### D. Reusable UI Components (Maktabet el-Design System)

* **[src/components/ui/DatePicker.tsx](file:///d:/gym/src/components/ui/DatePicker.tsx)**:
  * Obsidian dark calendar sha8al b-el `createPortal(..., document.body)`. By7seb el-coordinates fixed 3shan my2felsh gowa modal aw y2ta3o footer.
* **[src/components/ui/SelectDropdown.tsx](file:///d:/gym/src/components/ui/SelectDropdown.tsx)**:
  * Custom dropdown badal el-`<select>` el-html el-3ady.
* **[src/components/ui/CommandPalette.tsx](file:///d:/gym/src/components/ui/CommandPalette.tsx)**:
  * Spotlight search elly byfta7 b- `Ctrl + K`.
* **[src/components/ui/SegmentedTabs.tsx](file:///d:/gym/src/components/ui/SegmentedTabs.tsx)**:
  * Pills tabs zay (All, All Set, Needs Plan).
* **[src/components/ui/SearchInput.tsx](file:///d:/gym/src/components/ui/SearchInput.tsx)**:
  * Input search b-icon w clear button.
* **[src/components/ui/Modal.tsx](file:///d:/gym/src/components/ui/Modal.tsx)**:
  * Generic modal wrapper b-backdrop blur.

---

### E. Pure Engines & Helper Libraries (src/lib)

* **[src/lib/activeWorkoutEngine.ts](file:///d:/gym/src/lib/activeWorkoutEngine.ts)**: Auto-save draft bta3 el-tamreena el-shaghala 3shan lw el-mobile fasal she7n el-sets mtdee3sh.
* **[src/lib/progressEngine.ts](file:///d:/gym/src/lib/progressEngine.ts)**: 7sab el-1RM (One Rep Max), volume progression, w PRs.
* **[src/lib/weightEngine.ts](file:///d:/gym/src/lib/weightEngine.ts)**: 7sab masar el-wazn (trajectory, moving average).
* **[src/lib/alertsEngine.ts](file:///d:/gym/src/lib/alertsEngine.ts)**: Feltares el-khatar (Missed check-in, plateau, expired subscription).
* **[src/lib/habitsEngine.ts](file:///d:/gym/src/lib/habitsEngine.ts)**: 7sab el-streaks, relapse logs, w completion percentages.
* **[src/lib/whatsapp.ts](file:///d:/gym/src/lib/whatsapp.ts)**: Tarkeeb links WhatsApp el-mubashra (`https://wa.me/2010...`).
* **[src/lib/audio.ts](file:///d:/gym/src/lib/audio.ts)**: Web Audio API ll-safara w el-beeps bta3et el-rest timer gowa el-tamreen.
* **[src/lib/sanitizer.ts](file:///d:/gym/src/lib/sanitizer.ts)**: Tandeef el-strings w el-URLs mn ay XSS script.

---

## 3. Ezay el-Donia marboota b ba3daha? (Data & Event Flow)

```
[ UI Component: e.g. NewTraineeModal ]
                 │
                 ▼ (Calls function)
[ Service Layer: clientService.createClient() ]
                 │
                 ▼ (Dispatches to Context)
[ State Store: GymContext.tsx -> addTrainee() ]
                 │
                 ├──▶ Updates React State (Re-renders UI across all components)
                 └──▶ Saves Snapshot to Browser localStorage ('gym_users')
```

### Example 3amaly: Lma el-Coach ydos "Save" f New Athlete
1. El-Coach bymla el-data f [NewTraineeModal.tsx](file:///d:/gym/src/components/modals/NewTraineeModal.tsx).
2. El-Form by-validate el-hadaf w el-wazn 3n tareeq `clientService.validateGoalWeight()`.
3. Lma ydos Save, el-modal by-call `clientService.createClient(...)`.
4. `clientService` bykalem `addTrainee(newTrainee)` elly mawgoda gowa [src/context/GymContext.tsx](file:///d:/gym/src/context/GymContext.tsx).
5. `GymContext` by3mel update l-array `users` w by7fazo f `localStorage.setItem('gym_users', ...)`.
6. F nafs el-femtothanya:
   * [ClientsList.tsx](file:///d:/gym/src/components/coach/ClientsList.tsx) byshof el-user el-gded f el-table.
   * [CoachDashboardView.tsx](file:///d:/gym/src/components/coach/CoachDashboardView.tsx) byzawed 3addad el-athletes +1.
   * [CoachAlertsView.tsx](file:///d:/gym/src/components/coach/CoachAlertsView.tsx) by7seb alerts el-user el-gded.

---

## 4. Feen el-7agat elly MAFROOD tt-rbet bs mesh marboota? (The Missing Links / Gap Analysis)

De aham 2ayma leek 3shan tebny el-backend w tkamel el-mashrou3 b-edak:

### 1. El-Database el-7aqeeqeya (Cloud vs LocalStorage)
* **El-Wad3 el-7aly**: Kol el-data ma7fooza f `localStorage` bta3 motasafe7 el-gehaz elly enta fatah mno. Lw fatahyt mn gehaz tany el-data msh mawgoda.
* **El-Rabt el-Na2es**:
  * File [src/lib/supabase.ts](file:///d:/gym/src/lib/supabase.ts) feh client Supabase gahz.
  * Me7tag gowa [src/context/GymContext.tsx](file:///d:/gym/src/context/GymContext.tsx) tebdel `localStorage.getItem('gym_users')` b- `supabase.from('users').select('*')`, w lma t-add trainee t3mel `supabase.from('users').insert(newTrainee)`.

### 2. Raf3 Sowar el-Physique w el-Form Checks (Cloud Storage)
* **El-Wad3 el-7aly**: F [RecordFormCheckModal.tsx](file:///d:/gym/src/components/coach/client-detail/RecordFormCheckModal.tsx) w [PhotoComparisonModal.tsx](file:///d:/gym/src/components/coach/client-detail/PhotoComparisonModal.tsx), el-sowar btt5zn k- `data:image/png;base64` aw URLs gomla wa7da f el-memory.
* **El-Rabt el-Na2es**:
  * Me7tag Storage Bucket f Supabase aw AWS S3.
  * Lma el-la3eb ykhtar soura, el-code y-upload el-file 3la el-bucket w yrg3 `publicUrl` yt7at f `photoUrl`.

### 3. Web Push Notifications lma el-Browser ykon Maqfool
* **El-Wad3 el-7aly**: [public/sw.js](file:///d:/gym/public/sw.js) w [src/lib/smartNotifications.ts](file:///d:/gym/src/lib/smartNotifications.ts) byb3to notification local bs lma el-tab tkona maftoo7a.
* **El-Rabt el-Na2es**:
  * Me7tag API Route f Next.js (`src/app/api/notify/route.ts`) sha8al b- `web-push` w VAPID keys.
  * Lma el-coach y-send alert, el-server yz2 push notification ll-mobile 7atta lw el-app maqfool.

### 4. WhatsApp Automated Bot (Webhooks)
* **El-Wad3 el-7aly**: [src/lib/whatsapp.ts](file:///d:/gym/src/lib/whatsapp.ts) by-generate link `https://wa.me/...`. El-coach lazm ydos 3aleeh w yfta7 WhatsApp yb3at b-nafso.
* **El-Rabt el-Na2es**:
  * Lw 3ayz el-system yb3at reminders lwahdo el-sa3a 9 sob7 mn gher tado5ol el-coach: trbot m3 Twilio API aw Meta Cloud API f background cron job.

### 5. Multi-Coach Authentication
* **El-Wad3 el-7aly**: [src/components/auth/AuthScreen.tsx](file:///d:/gym/src/components/auth/AuthScreen.tsx) feha switch user quick buttons (Captain Mohamed, Rawan, etc.) bdon passwords.
* **El-Rabt el-Na2es**:
  * Rabt Supabase Auth (`supabase.auth.signInWithPassword`) 3shan kol coach ykon leh email w password w mychofsh gher la3eebto bs.

---

## 5. Dalil el-Ta3del b-edak (Developer Cheat Sheet)

### A. Ezay tekteb kood JavaScript mn gher ma el-TypeScript yday2k?
1. **El-Se7r el-Awel (`// @ts-nocheck`)**:
   * Efta7 ay file `.tsx` aw `.ts`.
   * 7ot f **awel satr khales**:
     ```javascript
     // @ts-nocheck
     ```
   * Keda el-file b2a **Pure JavaScript 100%** w mafeesh ay red line hyzhrlk.
2. **El-Se7r el-Tany (`any`)**:
   * Lw el-TS talab mnk type w enta mesh 3arfo:
     ```typescript
     const [myData, setMyData] = useState<any>(null);
     const handleEvent = (e: any) => { ... };
     ```
3. **El-Se7r el-Talat (`.jsx`)**:
   * T2dar t-create file gded sammeh `MyCustomCard.jsx` w Next.js hy-shaghlo 3ady gdn gowa el-mashrou3!

### B. Lma t3oz t-3adel 7aga mo3ayana:
* **3ayz t-ghayar alwan aw design css?**
  * Efta7 [src/app/globals.css](file:///d:/gym/src/app/globals.css) 3nd `:root`.
* **3ayz t-def 7a2l gded f data el-la3eb (e.g. instagram)?**
  * Efta7 [src/types/index.ts](file:///d:/gym/src/types/index.ts) -> def `instagram?: string;` gowa `interface User`.
  * Efta7 [src/lib/initialData.ts](file:///d:/gym/src/lib/initialData.ts) -> def `instagram: '@ahmed'` f mock data.
  * Efta7 [src/components/coach/client-detail/ClientNotesTab.tsx](file:///d:/gym/src/components/coach/client-detail/ClientNotesTab.tsx) -> e3red `client.instagram`.
* **3ayz t-3adel f tamreena shaghala (Live Workout)?**
  * Efta7 [src/components/trainee/LiveWorkoutSession.tsx](file:///d:/gym/src/components/trainee/LiveWorkoutSession.tsx).
* **3ayz t-3adel f kootlet el-daiet (Nutrition)?**
  * Efta7 [src/components/trainee/TraineeDietView.tsx](file:///d:/gym/src/components/trainee/TraineeDietView.tsx).

---
*Keda mafeesh fatfota f el-website mesh mashroo7a w maktoba f el-marja3 da.*
