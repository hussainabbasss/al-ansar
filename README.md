# Project Intezari
 <h1> اَللّٰهُمَّ عَرِّفْنِىْ حُجَّتَكَ - فَاِنَّكَ اِنْ لَّمْ تُعَرِّ فْنِىْ   حُجَّتَكَ ضَلَلْتُ عَنْ دِيْنِىْ</h1>
<p>Allahumma a'rrifni hujjatak fa innaka in lam to a'rifni hujjatak, zalal to an deeni. </p>
<h3>Oh Allah make me recognize Your Proof (Imam) - For, if you do not make me recognize Your Proof , I will deviate from my religion</h3>

> Reframing **Intizar** — the anticipation of Imam al-Mahdi (atfs) — from a passive state into an active, holistic training program.

Project Intezari is a high-performance, **local-first** mobile application for the Shia community. It moves past standard text-based readers to track physical readiness, intellectual grounding, and spiritual mindfulness (Muhasaba) — helping mold users into the character expected of the Imam's companions.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Core Philosophy](#core-philosophy)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Auth Model](#auth-model)
- [Contributing](#contributing)
- [License](#license)

---

## What It Does

Intezari treats waiting for the Imam as active preparation across three dimensions:

- **Physical readiness** — endurance and functional strength for active service, tracked with a native step counter and an LLM-generated workout companion.
- **Intellectual grounding** — narrations and eschatological context drawn from core texts like *Kitab al-Ghaybah*.
- **Spiritual mindfulness (Muhasaba)** — prayer presence, daily reflection, and a weekly AI-generated spiritual audit.

---

## Core Philosophy

**Local-first, sync later.** The phone is the primary write path and runtime store. Core tracking — prayer log, micro-journal, steps, notifications, and the in-app narration card — works fully offline and **never depends on the network**. When online, data is pushed to Supabase as durable backup and cross-install restore.

The design principle in three steps:

1. **Save on device first** — Preferences / SQLite.
2. **Sync to Supabase when online** — backup and restore.
3. **Call LLM APIs only when needed** — workout generation and weekly audit, with results cached on-device.

---

## Features

### Kitab al-Ghaybah Narration
Glanceable narrations from *Kitab al-Ghaybah* (Nuʿmani / Tusi), focused on patience, community resilience, and firm faith during the major occultation. Ships first as an in-app daily narration card, with a native home-screen widget planned for Phase 4.

### Physical Readiness Engine
A continuous offline step counter via the Capacitor pedometer (HealthKit / Google Fit), plus an LLM companion workout planner. It takes your height, weight, fitness baseline, medical constraints, and available equipment, then returns a functional mobility and core-strength regime as an interactive local checklist.

### Salah Optimization & Hudur al-Qalb
Shia prayer-time alerts delivered as local notifications, a fast binary daily Namaz log (done / not done), and a micro-journal under each prayer capturing heart-presence — *"What stood between your heart and Allah during this prayer?"*

### Weekly AI Spiritual Audit (Muhasaba)
Each week, the app aggregates seven days of journal text and sends it to a compassionate mentor LLM grounded in Shia ethical tradition (Akhlaq). It returns a **diagnostic** of the roots of distraction, a **practical remedy** drawn from the traditions of Ahl al-Bayt (a.s.), and a **spiritual prescription** — targeted dhikr or a prayer from *Sahifa al-Sajjadiyya* or *Mafatih al-Jinan*. The audit is cached on-device for offline re-reading all week.

---

## Architecture

Capacitor ships a **static Next.js export** (`output: 'export'`), which cannot host Next.js API routes. LLM orchestration therefore lives on a separately deployed backend.

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

| Layer | Role |
|-------|------|
| **Capacitor app** | UI, offline storage, pedometer, local notifications, prayer-time scheduling, sync client |
| **Backend (Vercel)** | Next.js / Edge routes for LLM orchestration and sync helpers; talks to Supabase and OpenAI |
| **Supabase** | Postgres backup, Auth (sign-in), row-level user scoping |

---

## Tech Stack

**Frontend:** Next.js (App Router, static export), Tailwind CSS, Framer Motion, Lucide React

**Mobile wrapper:** Capacitor.js (Android-first, iOS secondary)

**Local / offline:**
- `@capacitor/preferences` — settings, cached audits, lightweight state
- `@capacitor-community/sqlite` — structured local persistence (logs, journals)
- `@capacitor/local-notifications` — offline prayer alerts and Muhasaba reminders
- `@capacitor-community/pedometer` — HealthKit / Google Fit step tracking

**Backend & intelligence:** Next.js API routes, OpenAI (behind a thin provider abstraction so Anthropic can slot in later), Supabase (Auth + Postgres)

**Prayer times:** Geolocation-based calculations using Qum / Leva Institute conventions

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (for auth and sync)
- An OpenAI API key (for AI features)
- Android Studio (for the Android build) and/or Xcode (for iOS)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/project-intezari.git
cd project-intezari

# Install dependencies
npm install

# Copy the example environment file and fill in your keys
cp .env.example .env.local
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-key
```

### Running Locally (web UI)

```bash
npm run dev
```

### Building the Static Export & Native Shells

```bash
# Produce the static export
npm run build

# Sync the export into the native projects
npx cap sync

# Open the native IDEs
npx cap open android
npx cap open ios
```

> **Note:** The static client and the backend API routes are deployed separately. The Capacitor binary hosts only the UI and offline layers; deploy the API routes to Vercel independently.

---

## Project Structure

```
project-intezari/
├── src/                  # Next.js App Router UI
├── api/                  # Backend routes (deployed separately to Vercel)
│   └── analyze-salah/    # Weekly Muhasaba audit endpoint
├── android/              # Capacitor Android shell
├── ios/                  # Capacitor iOS shell
├── next.config.js        # output: 'export'
└── capacitor.config.ts
```

---

## Roadmap

**Phase 1 — Foundational UI & local storage**
Next.js skeleton, Tailwind, static export config, local data architecture, and a dark-mode terminal-style Namaz log.

**Phase 2 — Hardware integrations & geolocation**
Capacitor Android/iOS shells, pedometer, local notifications with Shia prayer-time calculation, reliable offline save, and the Supabase sync client.

**Phase 3 — LLM pipelines & core prompts**
Backend deployment, `/api/analyze-salah`, empathetic mentor system prompts, the fitness questionnaire and generation route, and local caching of AI outputs.

**Phase 4 — Widget, QA & launch**
Native Kitab al-Ghaybah home-screen widget, offline-stability profiling, production Vercel backend, and native binaries (`.apk` primary, `.ipa` as ready).

---

## Auth Model

- **Mobile app is sign-in only** in v1. Account creation will come later via a separate web app.
- **Works offline without an account:** prayer log, micro-journal, steps, notifications, and the in-app narration card.
- **Sign-in required for:** Supabase sync/backup and AI features (weekly Muhasaba, LLM workout planner).

---

## Contributing

Contributions are welcome. Please open an issue to discuss significant changes before submitting a pull request. When contributing, keep the local-first principle central — offline UX must never depend on the network, and religious content should be handled with care and sourced from recognized texts.

---

## License

Add your chosen license here (e.g. MIT). Create a `LICENSE` file in the repository root.

---

<p align="center"><em>اللّهُمَّ عَجِّلْ لِوَلِيِّكَ الْفَرَج</em></p>