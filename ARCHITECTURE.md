# Multi-Tenant SaaS Platform for Fitness Coaches
## System Architecture & Technical Specifications

---

### 1. Overview & Vision
A single-codebase, multi-tenant B2B SaaS platform ("Shopify for Fitness Coaches in Egypt & MENA").
- **Target Audience:** Online Fitness Coaches & Personal Trainers.
- **Value Proposition:** Replaces fragmented Excel sheets, PDFs, and WhatsApp voice notes with a centralized, branded web application for workouts, diet plans, weekly check-ins, and client management.
- **Tenancy Model:** Single codebase & database serving multiple independent coaches. Each coach operates under their own subdomain (`coachname.platform.com`) or custom domain (`coachname.com`) with isolated data and custom branding.

---

### 2. Multi-Tenancy Architecture (How 1 Codebase Serves Everyone)

```
[ Visitor / Trainee / Coach ]
              │
      Enters Domain/URL
 (e.g. coachkhalid.com OR khalid.fitapp.com)
              │
              ▼
    [ Next.js Middleware ] ───► Extracts 'Host' header (Hostname)
              │
              ├──► Looks up Tenant in Database (WHERE custom_domain = host OR subdomain = host)
              │
              ▼
   [ Loads Tenant Context ]
   - Coach Branding (Logo, Primary Color, Socials)
   - Tenant ID (coach_id)
              │
              ▼
    [ Isolated Data Queries ]
   - Workouts: WHERE coach_id = :coach_id
   - Diet Plans: WHERE coach_id = :coach_id
   - Trainees: WHERE coach_id = :coach_id
```

#### Key Tenancy Mechanisms:
1. **Domain Detection (Middleware):**
   - Next.js `middleware.ts` intercepts every incoming HTTP request.
   - It inspects `request.headers.get('host')`.
   - Matches the host against known coach subdomains or custom domains.
   - Injects the `coach_id` into the request context / headers.

2. **Data & Auth Isolation:**
   - **Data Isolation:** Every business table (`trainees`, `plans`, `exercises`, `diet_plans`, `workout_logs`, `check_ins`) contains a mandatory `coach_id` column.
   - **Auth Isolation:** Trainees authenticate scoped to their coach (`WHERE email = :email AND coach_id = :coach_id`). A trainee registered under Coach A cannot log in to Coach B's portal.
   - **Coach Isolation:** Coaches only see their own trainees, templates, and analytics.

3. **Domain Routing & DNS:**
   - **Wildcard Subdomains:** `*.fitplatform.com` has a wildcard `CNAME` pointing to the deployment (Vercel / VPS). Any new coach gets an instant live subdomain (`khalid.fitplatform.com`) without manual server reboots.
   - **Custom Domains:** A coach points their domain's `CNAME` or `A record` to the platform. Vercel / Cloudflare SSL terminates automatically.

---

### 3. Database Schema Blueprint (PostgreSQL)

#### A. `coaches` (Tenants)
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `email` (TEXT, Unique)
- `password_hash` (TEXT)
- `subdomain` (TEXT, Unique, e.g. "khalid-fit")
- `custom_domain` (TEXT, Unique, e.g. "khalidfit.com")
- `logo_url` (TEXT)
- `primary_color` (TEXT, e.g. "#10B981" or "#F59E0B")
- `accent_color` (TEXT)
- `whatsapp_number` (TEXT)
- `social_links` (JSONB)
- `plan_tier` (TEXT, e.g. "free", "pro_10", "unlimited")
- `created_at` (TIMESTAMP)

#### B. `users` (Trainees / Athletes)
- `id` (UUID, Primary Key)
- `coach_id` (UUID, Foreign Key -> coaches.id)
- `name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `password_hash` (TEXT)
- `status` ('active' | 'pending' | 'inactive')
- `height_cm` (NUMERIC)
- `weight_kg` (NUMERIC)
- `target_weight_kg` (NUMERIC)
- `goal` (TEXT)
- `assigned_workout_plan_id` (UUID)
- `assigned_diet_plan_id` (UUID)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- *Constraint: UNIQUE (coach_id, email)*

#### C. `exercises` (Library)
- `id` (UUID, Primary Key)
- `coach_id` (UUID, Nullable for Global Library, or specific Coach ID)
- `name` (TEXT)
- `target_muscle` (TEXT)
- `equipment` (TEXT)
- `execution_cue` (TEXT)
- `tips` (JSONB)
- `alternative_exercise` (TEXT)
- `video_url` (TEXT, YouTube link)
- `created_at` (TIMESTAMP)

#### D. `workout_plans`
- `id` (UUID, Primary Key)
- `coach_id` (UUID, Foreign Key -> coaches.id)
- `title` (TEXT)
- `description` (TEXT)
- `level` (TEXT)
- `days` (JSONB - days array with exercises, sets, reps, rest, rpe)
- `is_template` (BOOLEAN DEFAULT true)
- `assigned_user_id` (UUID, Nullable)

#### E. `diet_plans` (Nutrition & Meals)
- `id` (UUID, Primary Key)
- `coach_id` (UUID, Foreign Key -> coaches.id)
- `title` (TEXT)
- `target_calories` (INTEGER)
- `target_protein_g` (INTEGER)
- `target_carbs_g` (INTEGER)
- `target_fats_g` (INTEGER)
- `meals` (JSONB - meal items, food components, quantities, macros, food swaps)
- `water_target_liters` (NUMERIC)
- `notes` (TEXT)
- `assigned_user_id` (UUID, Nullable)

#### F. `workout_logs`
- `id` (UUID, Primary Key)
- `coach_id` (UUID)
- `user_id` (UUID, Foreign Key -> users.id)
- `plan_id` (UUID)
- `day_name` (TEXT)
- `date` (DATE)
- `duration_seconds` (INTEGER)
- `total_volume_kg` (NUMERIC)
- `completed_exercises` (JSONB)
- `coach_feedback` (TEXT)

#### G. `weekly_checkins`
- `id` (UUID, Primary Key)
- `coach_id` (UUID)
- `user_id` (UUID, Foreign Key -> users.id)
- `date` (DATE)
- `weight_kg` (NUMERIC)
- `measurements` (JSONB - waist, chest, arms, legs)
- `photos` (JSONB - front_url, side_url, back_url)
- `trainee_notes` (TEXT)
- `coach_feedback` (TEXT)
- `status` ('pending_review' | 'reviewed')

---

### 4. Hosting & Infrastructure Architecture
- **Web App / Fullstack Node.js:** Vercel (Hobby -> Pro) or VPS (Hetzner €4/month).
- **Database:** PostgreSQL (Neon Serverless free tier -> Hetzner self-hosted Postgres 40GB SSD).
- **Media (Images):** Cloudflare R2 (10GB Free, 0 Egress Bandwidth Fees) with client-side WebP compression.
- **Videos:** Unlisted YouTube Embeds / URLs (0 MB server load, 0 cost).
- **Domains & SSL:** Cloudflare / Vercel Wildcard SSL for `*.platform.com`.

---

### 5. Implementation Roadmap
1. **Phase 1 (Current):** UI/UX Overhaul & Modernization:
   - Modernize visual design (dark mode, glassmorphism, mobile-first responsive layout).
   - Build complete Nutrition & Diet Plan view for Coach & Trainee.
   - Build Weekly Check-in & Progress view.
   - Build Coach Branding Customizer (preview logo, brand colors, preview subdomain).
   - Maintain existing mock/Supabase data seamlessly.
2. **Phase 2:** Node.js Backend & Multi-Tenant Integration:
   - Multi-tenant PostgreSQL migration script.
   - Authentication (Coach & Trainee scoped login).
   - Domain router middleware.
   - Production readiness & deployment guide.
