# WORKOUTS PRO — BACKEND WIRING & BUGS CHECKLIST
> **Single Source of Truth for Database Schema, Edge Cases & Backend Integration**  
> *Date Created: October 15, 2026 | Architecture: PostgreSQL + Drizzle ORM + Cloudflare R2*

---

## 🏛️ 1. Executive Mission
This document catalogs every single architectural requirement, edge case, and data bug discovered during our deep-dive reviews that **MUST be executed when the custom backend engine is wired**.

---

## 🏋️‍♂️ 2. Weight Progression & Biometrics (`weight_logs` & `weekly_checkins`)

### 🐛 Identified Edge Cases & Requirements:
1. **Multiple Weigh-ins Per Day (Same Date Conflict):**
   - *Problem:* Trainee weighs in morning (e.g. 84.2kg on empty stomach) and evening (85.6kg post-meal).
   - *Resolution Rule:* Database unique constraint `UNIQUE(client_id, DATE(logged_at), entry_type)`. If both exist, queries prioritize `entry_type = 'weekly_checkin'` > `'morning_fasted'` > `'manual_entry'`.
2. **Goal-Aware Dynamic Telemetry (Bulking vs. Cutting vs. Recomp):**
   - *Bulking Phase:* Weight gain = On Track (`+0.25kg to +0.5kg/week`). Weight loss = Trigger nutritional warning banner.
   - *Cutting Phase:* Weight loss = On Track (`-0.5kg to -1.0kg/week`). Weight gain = Trigger caloric surplus alert.
   - *Maintenance / Recomp:* Fluctuations within $\pm 0.5\text{kg}$ flagged as stable.
3. **Decimal Precision & Sanity Checks:**
   - Database column `DECIMAL(4,1)` (strictly 1 decimal point, e.g. `84.5`).
   - SQL check constraint: `CONSTRAINT chk_weight_range CHECK (weight_kg >= 30.0 AND weight_kg <= 300.0)`.
4. **Timezone Offset Normalization:**
   - Store all timestamps in UTC (`TIMESTAMPTZ`). Display according to coach's timezone (Egypt `UTC+2` / `UTC+3` EEST).
5. **Timeline Event Synchronization:**
   - When a coach overrides or updates a client's weight from the header or modal, a corresponding event MUST automatically be recorded in `client_timeline_events` with `author_role = 'coach'`.

---

## 📸 3. Visual Transformation & Cloudflare R2 Uploads (`checkin_photos`)

### 🐛 Identified Edge Cases & Requirements:
1. **Zero-Server-Load Pre-Signed Uploads:**
   - Browser compresses image client-side to WebP (`< 1.2MB`).
   - Browser requests pre-signed `PUT` URL from `/api/uploads/presigned-url` with scoped path:
     `uploads/{coach_id}/{client_id}/{checkin_id}/{angle}.webp`
   - Uploads directly to Cloudflare R2 (0$ bandwidth egress fees).
2. **Missing Angle Graceful Fallback:**
   - Trainee uploads Front and Side, but forgets Back.
   - Database allows `nullable` for individual angles without invalidating the weekly check-in row.
3. **Photo Comparison Timestamp Matching:**
   - Ensure `photo_url` is immutably tied to the exact check-in date and scale weight recorded on that day.
4. **Private Storage Security:**
   - R2 bucket MUST be private. Photos served via short-lived signed URLs (1 hour expiry) or private CDN token to prevent unauthorized access to sensitive physique photos.

---

## 📅 4. Weekly Attendance & Culture Standards (`workout_logs`)

### 🐛 Identified Edge Cases & Requirements:
1. **Egyptian Gym Week Standard (Saturday to Friday):**
   - SQL date truncation must align with Saturday start: `EXTRACT(DOW FROM date)`.
2. **Double Workouts in One Day:**
   - If an athlete logs two workouts on Monday (e.g. Morning Cardio + Evening Push), both must be recorded in session history, but weekly attendance counter must count it as 1 training day towards the weekly split goal.
3. **Orphaned Plans Graceful Fallback:**
   - If a coach deletes a workout plan from the library while assigned to a trainee, the trainee's logs MUST NOT cascade delete. Foreign key set to `ON DELETE SET NULL`.

---

## 💳 5. Subscriptions & Package Lifecycle (`client_subscriptions`)

### 🐛 Identified Edge Cases & Requirements:
1. **Midnight Expiration Cron:**
   - Daily cron job runs at 00:00 UTC, evaluates `end_date < CURRENT_DATE`, and transitions status from `'active'` / `'expiring_soon'` to `'expired'`.
2. **7-Day Renewal Window Alert:**
   - Automatically populates the coach's home cockpit Action Items with "Renewal Due" and prepares the dynamic WhatsApp message link.
3. **Package Freeze / Pause Support:**
   - When an athlete pauses their subscription (due to travel, exam, or injury), the `end_date` must shift forward by the exact number of frozen days.

---

## 🔒 6. Multi-Tenant Security & IDOR Defense

### 🐛 Absolute Database Kernel Rules:
1. Every single table MUST include `coach_id UUID NOT NULL REFERENCES coaches(id)`.
2. PostgreSQL Row-Level Security (RLS) policies enabled on all 8 master tables:
   ```sql
   ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
   CREATE POLICY coach_isolation_policy ON weight_logs
     FOR ALL
     USING (coach_id = current_setting('app.current_coach_id')::uuid);
   ```
3. Zero possibility of cross-coach data leakage even if an API endpoint parameter is tampered with.

---

## 📋 7. Execution Matrix Summary

| Domain | Table | Priority | Status |
| :--- | :--- | :--- | :--- |
| **Weight Progression** | `weight_logs` | 🔴 High | Ready for backend wiring |
| **Photos & Transformations** | `checkin_photos` / R2 | 🔴 High | Pre-signed pipeline documented |
| **Adherence & Sessions** | `workout_logs` | 🟡 Medium | Schema defined |
| **Subscriptions & Billing** | `subscriptions` | 🟡 Medium | Cron rules documented |
| **Multi-Tenant RLS** | All Tables | 🔴 Critical | Zero-IDOR contract approved |
