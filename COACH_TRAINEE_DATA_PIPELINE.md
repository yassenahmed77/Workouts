# COACH ⇄ TRAINEE DATA EXCHANGE PIPELINE
> **The Definitive Two-Way Input/Output Architecture & Data Origins Contract**  
> *Date Created: October 15, 2026 | Purpose: Blueprint for Trainee Inputs feeding Coach Views and vice-versa*

---

## 🏛️ 1. Executive Concept: The Information Loop

Every data point rendered on the Coach's cockpit must have a defined **Input Origin**. This document is the master ledger mapping where data is born, where it is stored, who inputs it, and who consumes it.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE TWO-WAY INFORMATION HIGHWAY                       │
│                                                                             │
│  [ TRAINEE INPUTS ] ──────────► [ DATABASE PIPELINE ] ────────► [ COACH SEES ] │
│  - Weekly Scale Weight          - `weight_logs`                 - Trajectory Curve│
│  - 3 Progress Photos            - `checkin_photos`              - Before & After  │
│  - Biofeedback Sliders          - `weekly_checkins`             - Health Pulse    │
│  - Live Sets & Reps             - `workout_logs`                - PRs & Volume    │
│  - Gym Video Upload             - `form_check_videos`           - Form Audits     │
│                                                                             │
│  [ COACH INPUTS ] ────────────► [ DATABASE PIPELINE ] ────────► [ TRAINEE SEES ]│
│  - Workout Splits               - `workout_plans`               - Today's Routine │
│  - Diet Macros & Meals          - `diet_plans`                  - Daily Checklist │
│  - Check-in Review & Voice      - `weekly_checkins`             - Feedback Inbox  │
│  - Package Duration & Price     - `subscriptions`               - Days Remaining  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 2. Deep Breakdown: Trainee Inputs ➔ Coach Views

Here is every single metric visible to the coach and the exact screen the trainee must use to input it:

| # | What Coach Sees | Where Data Originates (Trainee Action) | Trainee Input Screen Needed | Database Target |
| :- | :--- | :--- | :--- | :--- |
| **01** | **Weight Progression Curve** | Trainee scale weigh-in on empty stomach (weekly or daily). | `TraineeCheckInModal.jsx` OR Quick-Log Pill on Dashboard | `weight_logs` |
| **02** | **Physique Transformation Photos** | Trainee uploads Front, Side, and Back photos via mobile camera/gallery. | `TraineeCheckInModal.jsx` (Step 2: Photos) | `checkin_photos` (Cloudflare R2) |
| **03** | **Health & Biofeedback Ratings** | Trainee rates Sleep, Energy, Hunger, Digestion, Stress (1-5 sliders). | `TraineeCheckInModal.jsx` (Step 3: Biofeedback) | `weekly_checkins` |
| **04** | **Weekly Workout Attendance** | Trainee opens live gym mode and ticks off working sets with actual kg & reps. | `LiveWorkoutSession.jsx` | `workout_logs` |
| **05** | **Nutrition Compliance %** | Trainee checks off meals eaten throughout the day or swaps food items. | `DailyMealsChecklist.jsx` | `diet_logs` |
| **06** | **Technique / Form Check Videos** | Trainee uploads gym video file or pastes YouTube unlisted link with set tag. | `SubmitFormCheckModal.jsx` | `form_check_videos` |
| **07** | **Active Injury / Pain Reports** | Trainee reports pain during a workout session or in the weekly check-in note. | `LiveWorkoutSession.jsx` (Feel Note) OR Check-in | `user_attention_notes` |
| **08** | **Baseline Medical Intake** | Trainee fills injuries history, gym equipment access, food allergies upon signup. | `TraineeOnboardingForm.jsx` | `user_intake_profiles` |
| **09** | **Daily Habits & Quits** | Trainee toggles daily water intake, steps, creatine, and quit tracker timers. | `TraineeHabitsView.jsx` | `habit_logs` |

---

## 📋 3. Deep Breakdown: Coach Inputs ➔ Trainee Views

Here is everything the coach configures and where it appears on the athlete's mobile screen:

| # | What Coach Prescribes / Configures | Where Coach Inputs It | How & Where Trainee Consumes It | Trainee Visibility |
| :- | :--- | :--- | :--- | :--- |
| **01** | **Training Split (Push/Pull/Legs)** | Coach Workout Builder Modal | `TodayWorkoutCard.jsx` & `WeeklySplitView.jsx` (Sets, Reps, RPE, Video guides) | 👁️ Public to Trainee |
| **02** | **Diet Plan & Macros** | Coach Diet Builder Studio | `TraineeDietView.jsx` & `DailyMealsChecklist.jsx` (Grams, Meals, Smart Swaps) | 👁️ Public to Trainee |
| **03** | **Weekly Check-In Review & Critique** | `ClientCheckInsTab.jsx` Review Box | `CheckInFeedbackView.jsx` (Audio memo playback, advice, next week changes) | 👁️ Public to Trainee |
| **04** | **Form Check Video Critique** | `ClientFormChecksTab.jsx` | Trainee Form Check Archive (Reviewed badge + Coach timestamped critique) | 👁️ Public to Trainee |
| **05** | **Package & Membership Dates** | `ClientMembershipModal.jsx` | Trainee Profile Badge ("14 Days Remaining • Renew via WhatsApp") | 👁️ Public to Trainee |
| **06** | **Coach Private Directives & Notes** | `ClientNotesModal.jsx` | **NONE (Completely Hidden).** Internal coach thoughts, psychology, red flags. | 🔒 Hidden / Private |

---

## 🎯 4. The Action Plan: When Do We Build What?

To keep our execution structured and avoid any confusion:

1. **PHASE 1 (TODAY'S MISSION): Complete the Coach's Cockpit & Client 360**
   - Finish every sub-tab of the Client Profile from the Coach's view:
     - `Overview Tab` (Done 100%)
     - `Check-ins Tab` (Review interface, photo comparison, feedback recording)
     - `Workout Plan Tab` (Split assignment & exercise progression)
     - `Diet Plan Tab` (Macro strips & meal tables)
     - `Form Checks Tab` (Video playback & critique box)
     - `Timeline & Notes Tab` (Interactive journey feed)
2. **PHASE 2: Build the Trainee Input Layer**
   - Build `TraineeCheckInModal.jsx` (The master feeder of weights, photos, and tape cm).
   - Build `SubmitFormCheckModal.jsx` (Gym floor technique uploader).
   - Build `TraineeOnboardingForm.jsx` (Initial intake questionnaire).
   - Build `CheckInFeedbackView.jsx` (Athlete's feedback consumption card).
3. **PHASE 3: Backend & Database Wiring (One Clean Sweep)**
   - Connect PostgreSQL tables according to [`BACKEND_WIRING_AND_BUGS_CHECKLIST.md`](file:///d:/gym/BACKEND_WIRING_AND_BUGS_CHECKLIST.md).
   - Hook up Cloudflare R2 pre-signed uploads.
   - Run complete end-to-end integration tests.
