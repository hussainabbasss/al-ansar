# Project Intezari — Overview

## Vision

Project Intezari is a high-performance, local-first mobile application for the Shia community. It moves past standard text-based readers and reframes **Intizar** (anticipation / waiting for Imam al-Mahdi, atfs) from a passive state into an active, holistic training program.

The app tracks:

- **Physical readiness** — endurance and functional strength for active service
- **Intellectual grounding** — narrations and eschatological context from core texts
- **Spiritual mindfulness (Muhasaba)** — prayer presence, reflection, and weekly audit

The aim is to help mold users into the character expected of the Imam’s companions.

---

## Glossary

| Term | Meaning |
|------|---------|
| **Local-first, sync later** | The phone is the primary write path and runtime store. When online, data is pushed to Supabase as durable backup/restore. Offline UX must never depend on the network. |
| **Binary Daily Namaz Log** | Five daily prayers tracked as done / not done. No rakat counts, qadha, or jamāʿah metadata in v1. |
| **Hudur al-Qalb** | Heart-presence during prayer; captured via a short micro-journal under each logged prayer. |
| **Weekly Muhasaba** | One AI-generated spiritual audit per week from that week’s journal text; cached locally for offline re-reading. |
| **Kitab al-Ghaybah widget** | Native iOS/Android home-screen widget showing a curated narration (Phase 4). An in-app daily narration card ships earlier. |

---

## Architecture

### Principle

1. **Save on device first** (Preferences / SQLite).
2. **Sync to Supabase when online** (backup + cross-install restore).
3. **Call LLM APIs only when needed** (workout generation, weekly audit); cache results on device.

### Client vs server

Capacitor ships a **static Next.js export** (`output: 'export'`). That binary cannot host Next.js API routes.

| Layer | Role |
|-------|------|
| **Capacitor app** | UI, offline storage, pedometer, local notifications, prayer-time scheduling, sync client |
| **Backend (Vercel)** | Next.js (or Edge) routes for LLM orchestration and sync helpers; talks to Supabase and OpenAI |
| **Supabase** | Postgres backup, Auth (sign-in), row-level user scoping |

```
┌─────────────────────────────┐
│  Capacitor (iOS / Android)  │
│  Next.js static UI          │
│  Preferences + SQLite       │
│  Pedometer + Local Notifs   │
└─────────────┬───────────────┘
              │ online only
              ▼
┌─────────────────────────────┐
│  Backend (Vercel)           │
│  /api/analyze-salah         │
│  /api/fitness (planned)     │
│  sync endpoints (planned)   │
└─────────────┬───────────────┘
              │
        ┌─────┴─────┐
        ▼           ▼
   Supabase      OpenAI
   (Auth+DB)     (LLM)
```

### Auth model

- **Mobile app: sign-in only.** No in-app sign-up in v1.
- **Account creation** will come later via a separate **web app**.
- **Pre-auth offline:** prayer log, micro-journal, steps, notifications, and in-app narration work without an account.
- **Sign-in required for:** Supabase sync/backup and AI features (weekly Muhasaba, LLM workout planner).

### Data flow (Muhasaba example)

1. User logs prayers and journal text → written to local SQLite / Preferences immediately.
2. On connectivity → sync client upserts rows to Supabase keyed by `user_id`.
3. Thursday night / Friday morning → local notification: audit ready.
4. App POSTs aggregated week of journal text to `/api/analyze-salah` (authenticated).
5. LLM returns diagnostic, remedy, and spiritual prescription.
6. Result cached in secure Preferences for offline reading all week; also backed up via sync when online.

---

## Tech stack

### Frontend

- **Next.js** (App Router), static export for Capacitor
- **Tailwind CSS**
- **Framer Motion** — mobile micro-interactions and AI loading states
- **Lucide React** — icons

### Mobile wrapper

- **Capacitor.js** — iOS & Android from the static export
- **Platform priority:** Android first; iOS in the same project, secondary for QA/launch

### Local / offline

- `@capacitor/preferences` — settings, cached audits, lightweight state
- `@capacitor-community/sqlite` — immutable / structured local persistence (logs, journals)
- `@capacitor/local-notifications` — offline prayer alerts and Muhasaba reminders
- `@capacitor-community/pedometer` — HealthKit / Google Fit step tracking

### Backend & intelligence

- Next.js API routes (deployed separately from the static app)
- **OpenAI** for v1 LLM calls (workout mapping + spiritual audits); keep a thin provider abstraction so Anthropic can replace later
- **Supabase** — Auth + Postgres backup

### Prayer times

- Geolocation-based calculations using **Qum / Leva Institute** conventions
- Triggers native local notifications for Namaz times

---

## Feature briefs

### 1. Kitab al-Ghaybah dynamic widget

- **Concept:** Glanceable narrations from *Kitab al-Ghaybah* (Nuʿmani / Tusi), focused on patience, community resilience, and firm faith in the major occultation.
- **Earlier:** In-app daily narration card (randomized or curated from local content).
- **Phase 4:** Native home-screen widget via device bridges.

### 2. Physical readiness engine

- **Native step counter:** Continuous offline via Capacitor pedometer (HealthKit / Google Fit).
- **LLM companion workout planner:** Inputs — height, weight, fitness baseline, medical constraints, available equipment. Output — functional mobility and core-strength regime as an interactive local checklist in the Next.js UI.
- Requires sign-in when calling the generation API; plan is cached locally afterward.

### 3. Salah optimization & Hudur al-Qalb

- Shia prayer-time alerts (local notifications).
- Binary daily Namaz log (fast done / not done).
- Micro-journal under each prayer: *“What stood between your heart and Allah during this prayer?”* (lethargy, distractions, racing thoughts, etc.).

### 4. Weekly AI spiritual audit (Muhasaba)

- Local notification Thursday night or Friday morning when the audit is due.
- Aggregate 7 days of journal text → secure payload to `/api/analyze-salah`.
- LLM as compassionate mentor grounded in Shia ethical tradition (Akhlaq), returning:
  - **Diagnostic** — psychological / environmental roots of distraction
  - **Practical remedy** — actionable advice from Ahl al-Bayt (a.s.) traditions
  - **Spiritual prescription** — targeted dhikr or a prayer from *Sahifa al-Sajjadiyya* / *Mafatih al-Jinan*
- Cache the audit on-device for the following week; sync to Supabase when online.

---

## Execution roadmap

### Phase 1 — Foundational Next.js UI & local storage (Weeks 1–2)

- [ ] Initialize Next.js skeleton + Tailwind CSS
- [ ] Configure `next.config` for static export (`output: 'export'`)
- [ ] Local data architecture with `@capacitor/preferences` for basic settings
- [ ] Dark-mode terminal-style layout for Daily Namaz Log and text-input interfaces

### Phase 2 — Hardware integrations & geolocation (Weeks 3–4)

- [ ] Scaffold Android / iOS shells with Capacitor CLI
- [ ] Pedometer API for live step metrics
- [ ] Local Notifications + Shia prayer-time calculation alerts
- [ ] Reliable offline save for journal / log input
- [ ] Supabase sign-in client + background sync when online (backup path)

### Phase 3 — LLM pipelines & core prompts (Weeks 5–6)

- [ ] Deploy backend; build `/api/analyze-salah`
- [ ] System prompts: empathetic, jurisprudentially sound mentor voice
- [ ] Fitness questionnaire UI + LLM generation route
- [ ] Framer Motion skeleton / loading states during AI aggregation
- [ ] Cache AI outputs locally; sync to Supabase

### Phase 4 — Widget, QA & launch (Weeks 7–8)

- [ ] Kitab al-Ghaybah native home-screen widget bridge
- [ ] Memory / offline stability profiling on Android and iOS emulators
- [ ] Production backend on Vercel; native binaries (`.apk` primary, `.ipa` as ready)

---

## Out of scope for this document

- Full API schemas and database migrations
- Exact LLM system-prompt text
- Visual design system beyond the Phase 1 “dark-mode terminal” direction for the Namaz log
- Web sign-up app (planned later; mobile remains sign-in only)

---

## Summary for implementers

Build a **static Capacitor client** that works fully offline for core spiritual and physical tracking. Use **Supabase** only as authenticated backup and identity. Put **OpenAI-backed routes on Vercel**. Prefer Android for first production cut. Ship the **in-app Ghaybah card** before the **native widget**.
`}