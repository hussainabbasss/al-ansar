# Intezari — UI Plan

Source of truth for visual implementation:

- Design system: `docs/stitch_al_asr_readiness_training/sacred_discipline/DESIGN.md`
- Screen mocks: `readiness_dashboard/`, `physical_readiness/`, `muhasaba_audit/` (each with `screen.png` + `code.html`)
- Product scope: `docs/project-overview.md`

This plan translates the Stitch “Sacred Discipline” mocks into an implementable mobile UI for the Capacitor + Next.js static client.

---

## 1. Design philosophy

**Sacred Discipline** — a high-performance tool for active Intizar, not a soft consumer wellness app.

| Axis | Direction |
|------|-----------|
| Mood | Solemn, empowering, nocturnal focus |
| Aesthetic | Sophisticated minimalism + tactile/industrial |
| Metaphor | Command center for the soul / readiness instrument |
| Depth | Tonal surface layering (not heavy shadows) |
| Texture | Low-opacity 8-pointed star (Khatim) overlays at 2–4% on primary surfaces |

Avoid: bubbly consumer UI, purple gradients, large card chrome without purpose, emoji decoration.

---

## 2. Design tokens

### 2.1 Color (from Sacred Discipline)

| Token | Hex | Role |
|-------|-----|------|
| `background` / `surface` | `#0b1326` | App canvas |
| `surface-container-lowest` | `#060e20` | Recessed inputs |
| `surface-container-low` | `#131b2e` | Secondary cards |
| `surface-container` | `#171f33` | Default cards / list rows |
| `surface-container-high` | `#222a3d` | Elevated cards (Daily Commandment, Ready Summary) |
| `surface-variant` | `#2d3449` | Progress tracks, muted bars |
| `on-surface` | `#dae2fd` | Primary text |
| `on-surface-variant` | `#bfc9c3` | Secondary text |
| `outline` | `#89938d` | Soft labels |
| `outline-variant` | `#404944` | 1px borders / dividers |
| `primary` | `#95d3ba` | Emerald — growth, active progress, brand accents |
| `on-primary` | `#003829` | Text on emerald |
| `primary-container` | `#064e3b` | Filled emerald surfaces (Record Session, Reflect chip) |
| `secondary` | `#ffb95f` | Gold — alerts, milestones, active tab, READY pulse |
| `on-secondary` | `#472a00` | Text on gold buttons |
| `tertiary` | `#b9c7e0` | Cool slate-blue — Intellect pillar accents |
| `error` | `#ffb4ab` | Errors only |

**Usage rules**

- Gold is scarce: active nav, READY indicator, index scores, primary CTAs on spiritual screens.
- Emerald is the default “alive / progress” accent.
- Borders are 1px `outline-variant`; no multi-layer drop shadows on cards.

### 2.2 Typography

| Role | Family | Spec |
|------|--------|------|
| Display / sacred quotes | **Source Serif 4** | 24–40px, weight 600–700; italic for commandments & prompts |
| Brand wordmark | **Source Serif 4** | `INTEZARI`, tracking-widest, primary color |
| Titles / UI chrome | **Geist** | 14–18px |
| Labels / chips / metrics | **JetBrains Mono** | 10–13px, often uppercase + letter-spacing `0.1em` |

Load via `next/font` (Geist, JetBrains Mono) + Source Serif 4. Prefer Lucide icons in production (per project stack); Material Symbols in Stitch HTML are visual reference only.

### 2.3 Spacing & shape

- Base unit: **4px**; rhythm: **8px** scale
- Mobile side margin: **20px** (`margin-mobile`)
- Section gaps: `24px` / `40px` (`lg` / `xl`)
- Corner radius: prefer **disciplined** radii — `4px` containers, `8px` cards (`rounded-lg` / `xl` in mocks). Avoid pill-everything; pills OK for small status chips (`ACTIVE READINESS`, `REFLECT`) and bottom nav shell
- Bottom nav: frosted glass (`bg-surface/90`, `backdrop-blur-xl`), top border, slight top rounding

### 2.4 Elevation

1. Level 0 — background `#0b1326`
2. Level 1 — card + 1px border
3. Level 2 — modal / focused card; optional 1px emerald border when “active”
4. Glass — top app bar + bottom tab bar only

### 2.5 Motion (Framer Motion)

Ship 2–3 intentional motions, not noise:

1. **READY pulse** — gold 8px dot, slow opacity/glow pulse when anticipation / prayer window is active
2. **Readiness ring** — stroke draw-in on dashboard mount
3. **Sync spin** — sync icon rotates once on manual sync; brief success state
4. Optional: bar-chart day highlight crossfade; checklist strike-through on complete

---

## 3. App shell (every primary screen)

### Top app bar (fixed, h-16)

| Zone | Content |
|------|---------|
| Left | Account circle (→ sign-in / profile). Optional gold READY pulse beside it |
| Center *or* left+title | Wordmark **INTEZARI** (serif, tracking-widest, primary) — dashboard centers it; Physical puts brand left of status |
| Right | Sync control (manual sync). Physical also shows `● READY` label in gold |

Glass treatment: `bg-surface/80`, `backdrop-blur-xl`, bottom border `outline-variant`.

### Bottom tab bar (4 tabs)

| Tab | Icon (Lucide) | Screen |
|-----|---------------|--------|
| **Readiness** | `Zap` | Dashboard home |
| **Physical** | `Dumbbell` | Physical Readiness |
| **Intellect** | `BookOpen` | Ghaybah / study (mock not in Stitch yet) |
| **Spiritual** | `PersonStanding` / meditation analog | Muhasaba Focus |

Active tab: **secondary (gold)** + filled icon. Inactive: `on-surface-variant` at ~60% opacity.

Tab order in mocks varies slightly; **canonical order for build:**

`Readiness → Physical → Intellect → Spiritual`

(Dashboard mock leads with Readiness; Physical/Spiritual mocks reorder — standardize on Readiness-first so the home tab is leftmost.)

### FAB

- Dashboard only: emerald circular `+` FAB above the tab bar (`bottom-28`, `right-6`) → quick log (morning / namaz / reflection sheet)
- Do not put FABs on Physical or Spiritual unless a clear primary create action is needed later

### Local-first chrome

Surfaces that reinforce offline-first (from mocks):

- Sync icon in app bar
- `AUTO-SAVING LOCALLY` under reflection textarea
- Footer line on Spiritual: lock icon + `E2E Encrypted Local Storage Only` (copy can soften to “Stored locally on device” if encryption claim is not yet true)
- Desktop aside (xl+): `Sync: Local-First` — optional for Capacitor phone build; keep drawer for large tablets only

---

## 4. Screen inventory

### 4.1 Readiness Dashboard — `readiness_dashboard`

**Purpose:** Single glance at overall readiness; entry to pillars and daily logs.

**Layout (top → bottom)**

1. **Readiness gauge (hero)**  
   - Circular SVG ring (~192px): track `surface-variant`; progress `primary`; optional secondary gold arc  
   - Center: label `READINESS` (mono caps) → display `%` in emerald → `ACTIVE` in gold mono  
   - Below: `CURRENT STATE: PREPARED` (mono, wide tracking)

2. **Daily Commandment card** (`surface-container-high`, border, watermark sparkle)  
   - Label: `DAILY COMMANDMENT` (gold mono)  
   - Quote: Source Serif italic  
   - Footer: `Ref: …` (mono) + emerald pill `REFLECT` with book icon  
   - **Maps to product:** in-app Kitab al-Ghaybah / curated narration card (Phase 1–3). Replace placeholder “Al-Muhasaba 4:12” with real narration + source metadata.

3. **Pillars of Readiness** (bento)  
   - Header: grid icon + title in primary  
   - 2× square tiles: **Physical** (emerald bar, `85% STRENGTH`), **Intellect** (tertiary bar, `62% DEPTH`)  
   - Full-width **Spiritual Awareness**: gold self-improvement icon, “Muhasaba completed: N Days”, large gold score

4. **Daily Log Actions**  
   - Row list (not heavy cards): icon + title + subtitle + chevron  
   - `New Morning Log` — “Capture your state of mind”  
   - `Evening Reflection` — “Close the day with Muhasaba”  
   - Divider / bottom border style; hover/press → `surface-variant`

5. **Atmospheric image**  
   - Full-bleed cinematic still, grayscale/contrast, opacity ~60%; softens to 100% on press (optional)  
   - Keep solemn “command center” mood; avoid stock fitness clichés

6. **FAB** — quick add

**Interactions**

| Control | Action |
|---------|--------|
| Reflect | Opens narration detail / journal prompt |
| Pillar tiles | Navigate to Physical / Intellect / Spiritual |
| Morning / Evening rows | Open respective log flows |
| FAB | Action sheet: log prayer, morning note, evening reflection |
| Sync | Trigger local→Supabase sync when signed in |

---

### 4.2 Physical Readiness — `physical_readiness`

**Purpose:** Steps/load awareness + LLM training modules + session logging.

**Layout**

1. **Page header**  
   - Eyebrow: `SACRED DISCIPLINE` (gold mono)  
   - Title: `Physical Readiness` (serif)  
   - Body: “Your body is the vessel for wait…”

2. **Readiness Load card**  
   - Title emerald; subtitle `WEEKLY ACTIVITY TREND` mono  
   - Right: large gold `%` + `OPTIMAL`  
   - 7-day bar chart (Mon–Sun): muted bars `surface-variant`; peak days `primary` / today `secondary`  
   - **Data source:** pedometer aggregates (local); % is derived readiness load, not raw step count alone

3. **Record Session CTA** (`primary-container` filled)  
   - Large add icon, title `Record Session`, copy “Log your daily muhasaba of movement.”  
   - Button `INITIALIZE` (dark on emerald) → session logger / checklist for today’s plan

4. **Training modules** (stacked on mobile; 2-col on wide)  
   - Image header + gradient fade into card body  
   - Status chip: `ENDURANCE` (gold) / `AGILITY` (emerald)  
   - Title + short description  
   - Footer meta: `LVL NN` + duration (`45 MINS`) in mono  
   - **Maps to product:** LLM-generated companion workout plan cached locally

5. **Stillness of Action** strip  
   - Circular gold-border meditation icon + italic quote  
   - Optional Reflect button (shown on md+)

**Not in mock — required by product (add as subflows)**

- Fitness onboarding questionnaire (height, weight, baseline, medical, equipment) before first plan generation  
- Sign-in gate when generating via API  
- Live step count readout (can sit under Readiness Load or as a mono metric chip)

---

### 4.3 Spiritual / Muhasaba Focus — `muhasaba_audit`

**Purpose:** Daily salah presence logging, reflection prompt, readiness index, light discipline extras.

**Layout**

1. **Page header**  
   - Left: `DAILY AUDIT` (gold) + `Muhasaba Focus` (serif display)  
   - Right: Hijri date (mono) + chip `ACTIVE READINESS` (emerald container)

2. **Presence Audit (Salat)**  
   - Card with flare watermark  
   - Rows separated by 1px dividers:  
     - `FAJR` — “Pre-Dawn Connection” — dual presence circles (full / partial) in mock  
     - `DHUHR / ASR` — “Mid-Day Resilience” — completed check  
     - `MAGHRIB / ISHA` — “Evening Reflection” — `Awaiting Hour...` when locked by time  
   - **Align with product overview:** v1 is a **binary daily Namaz log** (5 prayers, done / not done) + micro-journal *“What stood between your heart and Allah during this prayer?”*  
   - **Implementation choice:** keep the mock’s visual language (rows, mono labels, circular controls) but expand to **five discrete prayers** (Fajr, Dhuhr, Asr, Maghrib, Isha). Use a single done/not-done control per prayer; open micro-journal sheet on mark-complete. Grouping Dhuhr/Asr is mock shorthand only — do not ship combined logging if it fights the binary-five model.

3. **Ready Summary**  
   - Gold bolt title  
   - Large gold-bordered score (circle or square per final polish — mock PNG leans square “88 / INDEX”; HTML uses circle — **prefer circle + INDEX pill** from HTML for consistency with dashboard ring language)  
   - Short mentor blurb (later: weekly AI audit excerpt or rolling local heuristic)  
   - Full-width gold button `DOWNLOAD PDF LOG` (Phase 3+; can hide until export exists)

4. **Prompt of the Day**  
   - Left gold accent border  
   - Serif blockquote prompt  
   - Textarea on `surface-container-lowest`, focus border gold  
   - `AUTO-SAVING LOCALLY` (mono, right-aligned)  
   - **Maps to:** Hudur micro-journal / evening reflection; weekly Muhasaba aggregates these texts

5. **Micro metrics** (2-up)  
   - Reading `45 / 60 min`  
   - Journaling `Completed`  
   - Nice-to-have for v1; can bind later to Intellect timers

6. **Societal Readiness checklist**  
   - Community / skill tasks with checkboxes; completed = muted + strikethrough  
   - **Stretch / Phase 2+** relative to core overview — keep in UI plan as designed, ship after Namaz log + journal are solid

7. **Local storage footer** — trust cue

**Weekly AI audit (product Phase 3 — not a separate Stitch screen yet)**

Reuse Spiritual visual language:

- Notification entry → full-screen or sheet: Diagnostic / Remedy / Prescription sections  
- Source Serif for prescription text; mono chips for “CACHED LOCALLY” / “Week of …”  
- Skeleton loaders (Framer Motion) while `/api/analyze-salah` runs

---

### 4.4 Screens missing from Stitch (plan placeholders)

| Screen | Priority | UI direction |
|--------|----------|--------------|
| **Sign-in** | P0 for sync/AI | Minimal: brand wordmark, email + password or magic link, no sign-up link (web signup later). Same dark shell, gold primary button |
| **Intellect** | P1 | Daily Ghaybah narration list/detail; reuse Daily Commandment card DNA; library of local texts |
| **Fitness questionnaire** | P1 | Multi-step form, mono labels, emerald continue |
| **Workout checklist** | P1 | Checklist rows like Daily Log Actions; check → local save |
| **Weekly Muhasaba report** | P1 | Three-block mentor layout (see above) |
| **Settings / sync status** | P2 | Account, prayer calculation location, notification toggles, last synced timestamp |
| **Native widget preview** | P3 | Out of app chrome; document separately in Phase 4 |

---

## 5. Component catalog (build these once)

| Component | Spec |
|-----------|------|
| `AppTopBar` | Account, brand, sync, optional READY |
| `BottomTabs` | 4 tabs, gold active |
| `ReadyPulse` | Gold dot + optional label |
| `ReadinessRing` | SVG dual-stroke ring + center stack |
| `CommandmentCard` | Label, serif quote, ref, Reflect CTA |
| `PillarTile` / `PillarBanner` | Icon, title, bar or score |
| `LogActionRow` | Icon, title, subtitle, chevron |
| `MetricCard` | Icon, mono label, value |
| `StatusChip` | Mono caps: Completed / Pending / ACTIVE READINESS |
| `DisciplineCard` | Bordered surface container, optional watermark |
| `PresenceRow` | Prayer name, subtitle, binary control + expand journal |
| `PromptComposer` | Serif prompt + autosave textarea |
| `TrainingModuleCard` | Image, chip, title, meta LVL/duration |
| `WeeklyLoadChart` | 7 bars, today = gold |
| `PrimaryButton` | Emerald fill / Gold fill variants |
| `DisciplineButton` | Slate + 1px gold border |
| `FAB` | Emerald + |

Inputs: 1px border boxes; active = **gold bottom border / border** only (no thick rings).

---

## 6. Information architecture

```
Tab: Readiness          Tab: Physical           Tab: Intellect        Tab: Spiritual
└─ Dashboard            └─ Physical home        └─ Ghaybah feed       └─ Muhasaba Focus
   ├─ Commandment          ├─ Load + steps         └─ Narration detail     ├─ Presence (5 prayers)
   ├─ Pillars              ├─ Record session                               ├─ Micro-journal
   ├─ Morning log →        ├─ Modules → checklist                          ├─ Prompt of day
   ├─ Evening log →        └─ Questionnaire (first run)                    ├─ Ready summary
   └─ FAB quick sheet                                                      └─ Weekly audit (sheet)
Account (top) → Sign-in / profile / settings
```

---

## 7. Mapping Stitch → product features

| Product feature | Primary UI home |
|-----------------|-----------------|
| Kitab al-Ghaybah (in-app) | Dashboard Daily Commandment + Intellect tab |
| Step tracker + LLM workouts | Physical tab |
| Salah times + binary log + Hudur journal | Spiritual Presence Audit + prompt/journal |
| Weekly AI Muhasaba | Spiritual Ready Summary + dedicated audit view; local cache badge |
| Local-first + sync | Top sync control; autosave labels; Supabase only when signed in |

---

## 8. Implementation notes (Next.js + Capacitor)

1. Encode tokens as CSS variables in `globals.css` matching DESIGN.md names (`--primary`, `--secondary`, surface ladder).
2. Dark-only for v1 (`class="dark"` always); no light theme in mocks.
3. Safe areas: `pb-8` on tab bar for Android/iOS home indicator; top bar respects status bar inset via Capacitor CSS env.
4. Max content width `max-w-lg` on phone dashboard; Physical/Spiritual can use full width with 20px margins.
5. Replace remote Googleusercontent hero images with licensed local assets before store release; keep grayscale command-center mood.
6. Prefer Lucide over Material Symbols for bundle consistency with project overview.
7. Where DESIGN.md (sharp 4px) and HTML (softer `rounded-xl`) conflict, **follow DESIGN.md for components**, keep mock **layout hierarchy and copy structure**.

---

## 9. Build order (UI)

1. Tokens + fonts + `AppTopBar` + `BottomTabs` shell  
2. Readiness Dashboard (ring, commandment, pillars, log rows, FAB)  
3. Spiritual Muhasaba Focus (5-prayer binary log + journal + prompt autosave)  
4. Physical Readiness (chart, record CTA, module cards)  
5. Sign-in screen  
6. Intellect placeholder + Ghaybah detail  
7. Questionnaire + workout checklist + weekly audit view  
8. Motion polish (pulse, ring, sync)

---

## 10. Open visual decisions (defaults)

| Topic | Default for build |
|-------|-------------------|
| Tab order | Readiness → Physical → Intellect → Spiritual |
| Prayer logging | Five separate binary rows (not grouped Dhuhr/Asr) |
| Ready Summary score shape | Circle + INDEX pill (HTML) |
| Societal Readiness | UI present, behind feature flag until Phase 2 |
| PDF download | Hide button until export exists |
| “Terminal” note in project overview | Superseded by Sacred Discipline Stitch system for all UI |

---

## Summary

Implement a **dark, emerald-and-gold Sacred Discipline** shell with four tabs. Ship the three Stitch screens as the visual backbone—Dashboard, Physical, Spiritual—adapting Spiritual’s prayer list to the agreed **five-prayer binary + micro-journal** model, and extending with Sign-in, Intellect, questionnaire, and weekly audit views in the same token language.
