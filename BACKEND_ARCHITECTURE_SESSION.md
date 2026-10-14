# WORKOUTS PRO — BACKEND ARCHITECTURE & MULTI-TENANT STRATEGY RECORD
> **Official Record of the Backend Deep Chat & Strategy Alignment**  
> *Date: October 11, 2026 | Status: Blueprint Approved & PDF Generated*

---

## 1. Executive Summary & Context

In this session, we held a pivotal strategic discussion regarding the backend implementation of Workouts Pro as a scalable **B2B SaaS Platform** targeted at fitness coaches across Egypt and the MENA region.

### The Problem with Managed BaaS (Supabase / Firebase):
1. **Per-Project / Scaling Pricing Trap:** Supabase charges per project ($25/mo per project) or forces multiple coaches into cramped free-tier limits (500MB DB).
2. **Bandwidth & Egress Gouging:** Weekly check-in photos and athlete progress images generate massive read traffic, incurring heavy egress costs on AWS S3 / Supabase Storage.
3. **Third-Party Auth Inefficiency:** Auth services like Clerk quickly escalate to $25–$100+/month.

### The Decision:
Build a **custom, high-performance, bank-grade backend** inside a **single codebase (Multi-Tenant SaaS)** delivering the absolute highest specifications for **under 5€/month**.

---

## 2. The Golden Tech Stack (A3la Mwasafat b A2all Cost)

| Layer | Selected Technology | Rationale & Advantage | Cost |
| :--- | :--- | :--- | :--- |
| **API & Server Engine** | **Next.js App Router (`/api/...`)** | Single deployment (Docker), zero CORS issues, shared TypeScript types, mobile-ready REST endpoints. | **$0 (Free)** |
| **Database** | **Self-Hosted PostgreSQL** | Rock-solid persistence, native JSONB support, Row-Level Security (RLS) enforcement. | **Included in VPS** |
| **ORM** | **Drizzle ORM** | Zero memory overhead, compiles to direct SQL, 4x faster than Prisma, 100% type-safe. | **$0 (Free)** |
| **Media & Photos** | **Cloudflare R2** | **Zero Egress Fees (0$ Bandwidth)**. Direct-from-browser pre-signed uploads + client WebP compression. | **10GB Free ($0.015/GB)** |
| **Video Guides** | **YouTube Unlisted CDN** | Ultra-fast streaming via Google CDN, zero bandwidth and storage load on our server. | **$0 (Free)** |
| **Authentication** | **Custom JWT + HttpOnly Cookies** | Bank-grade security, XSS & CSRF proof, Argon2 password hashing, zero Clerk/Auth bills. | **$0 (Free)** |
| **Physical Server** | **Hetzner Cloud VPS (CPX11/CX22)** | 4GB RAM, 40GB NVMe SSD, 20TB Traffic in German datacenter. Easily handles 300–500 coaches. | **4.50€ / Month Fixed** |

---

## 3. Single Codebase Multi-Tenancy Architecture

```
[ Visitor / Athlete / Coach ]
              │
      Enters Subdomain / Domain
  (e.g., khalid.workouts.pro OR coachkhalid.com)
              │
              ▼
    [ Next.js Middleware ] ───► Inspects 'Host' header in 1ms
              │
              ├──► Extracts Tenant Context (coach_id)
              │
              ▼
    [ Cryptographic JWT Guard ] ───► Validates coach/trainee identity
              │
              ▼
    [ PostgreSQL Row Level Security (RLS) ]
    - Every table contains `coach_id`
    - DB kernel rejects queries without valid tenant scope
    - ZERO possibility of cross-coach data leakage
```

### Why One Codebase vs Separate Website per Coach?
* **Cost:** 1 server process (2GB RAM) vs 50 separate Node instances (10GB+ wasted RAM).
* **Maintenance:** 1 `git push` updates all 1,000 coaches instantly instead of running 1,000 separate deployments and DB migrations.
* **Security:** Guaranteed through PostgreSQL Row-Level Security (RLS) and cryptographically signed JWT tokens.

---

## 4. The 8 Master Database Tables

1. **`coaches`**: Tenant root, credentials, branding, WhatsApp, custom package pricing.
2. **`users`**: Trainees & athletes, biometrics, target goals, membership status, coach notes.
3. **`exercises`**: Unified exercise library, YouTube unlisted guide links, execution cues, alternatives.
4. **`workout_plans`**: Training splits, day-by-day routines, sets, reps, RPE, rest timers.
5. **`workout_logs`**: Trainee daily session logs, completed weights, volume calculations.
6. **`diet_plans`**: Nutrition protocols, macro targets, meals, food items, and smart food swaps (Badeel).
7. **`weekly_checkins`**: Trainee check-in entries, scale weights, measurements, Cloudflare R2 photo URLs, coach feedback.
8. **`habits_trackers`**: Daily habits, quit trackers, streaks, relapse history, reflection logs.

---

## 5. Artifacts & Deliverables Generated in This Session

1. **Master Architecture PDF (Desktop):**
   - Path: `C:\Users\yasse\OneDrive\Desktop\WORKOUTS_SAAS_BACKEND_BLUEPRINT.pdf`
   - Details: 6 pages, A4 portrait, high-density Arabic/English typography, dark obsidian UI, complete cost tables, architecture diagrams.
2. **Project Docs Copy:**
   - PDF: [`WORKOUTS_SAAS_BACKEND_BLUEPRINT.pdf`](file:///d:/gym/docs/WORKOUTS_SAAS_BACKEND_BLUEPRINT.pdf)
   - HTML Source: [`WORKOUTS_SAAS_BACKEND_BLUEPRINT.html`](file:///d:/gym/docs/WORKOUTS_SAAS_BACKEND_BLUEPRINT.html)
   - PDF Generator Script: [`generate_pdf.js`](file:///d:/gym/docs/generate_pdf.js)

---

## 6. The 5-Milestone Action Roadmap

- [ ] **Milestone 1:** Drizzle ORM Schema initialization with all 8 master tables & migrations.
- [ ] **Milestone 2:** Next.js Route Handlers (`/api/...`) & domain service layer integration.
- [ ] **Milestone 3:** Multi-tenant JWT Auth engine (Coach & Trainee login + WhatsApp invite links).
- [ ] **Milestone 4:** Full Frontend-to-Backend wiring (eliminating all mock data & localStorage fallbacks).
- [ ] **Milestone 5:** Docker containerization, Hetzner VPS deployment, automated daily database backups.
