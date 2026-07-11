# 04 — Spiritual: Namaz Log, Daily & Weekly Muhasaba

**Status:** Implemented  
**Product context:** [`project-overview.md`](./project-overview.md)  
**UI context:** [`ui-plan.md`](./ui-plan.md), [`01-ui.md`](./01-ui.md)  
**Storage pattern:** same durable Preferences approach as [`02-intellect.md`](./02-intellect.md) / [`03-physical.md`](./03-physical.md)  
**LLM:** same **Google Gemini** key as Physical (`GEMINI_API_KEY`)

---

## What we are building

1. **Durable binary Namaz log** — five daily prayers (Fajr → Isha), done / not done, each with an optional Hudur micro-journal (“What stood between your heart and Allah during this prayer?”).
2. **Correct Hijri date** on the Spiritual page (live calculation, not mock string).
3. **UI cleanup** — remove the single Eye design from Presence Audit (watermark + header icon).
4. **Daily audit (on-demand)** — one Gemini run per local calendar day; locked for **24 hours** after a successful generation; button **disabled when offline**.
5. **Weekly Muhasaba (automatic)** — no manual “Open Weekly Audit” button. App generates once per week (Thursday night / Friday morning local), caches result, fires a **local notification** that deep-links to `/spiritual/audit/`. If offline at trigger time, generate on the **next successful online check** and notify then. Weekly CTA also **disabled / skipped when offline**.
6. **Holistic audit payload** — both audits include salah presence + Hudur journals **and** physical achievements (sessions completed, calories burned) for the scoped day or week.
7. **Spiritual prescription** — an **actual dua** from a curated Shia corpus (Sahifa al-Sajjadiyya / Mafatih-style entries shipped in-repo). Gemini **selects a corpus id**; it never invents dua text.

---

## Language we agreed on

| Term | Meaning |
|------|---------|
| **Namaz log** | Binary five-prayer day log + Hudur micro-journal per completed prayer. No rakat / qadha / jamāʿah in this pass. |
| **Daily audit** | On-demand Gemini mentor report for **today only**. Max **once per 24h** after success. |
| **Weekly audit** | Auto Muhasaba for the prior week. Notification-driven; no weekly button on Spiritual. |
| **Actual dua** | Text resolved from local corpus by id. LLM may only choose among allowed ids. |
| **Offline disable** | Audit generation requires network. Cached reports remain readable offline. |

---

## Decisions made

| Decision | Choice |
|----------|--------|
| Weekly trigger | Thursday night / Friday morning (local device time), per product overview |
| Notification | Capacitor local notification → `/spiritual/audit/` for that week’s cached report |
| Missed online window | Defer generation until next online opportunity; then notify |
| Daily rate limit | One successful run per local day; UI locked until 24h / next day window |
| Weekly button | **Remove** from Ready Summary (and dashboard FAB paths that imply manual weekly run) |
| Daily result surface | Show on Spiritual (inline Ready Summary / sheet) + optional short history; weekly stays on `/spiritual/audit/` |
| LLM provider | Gemini via existing `GEMINI_API_KEY` (same as `/api/generate-fitness`) |
| Eye design | Remove from Presence Audit card |

---

## Assumptions

- Sign-in gate for AI is **out of scope** this pass (same as Physical) — online + rate limit is enough.
- Week boundary for Muhasaba: **Friday-start week** (Thursday night closes the week) aligned with the notification schedule.
- Hijri display uses a reputable JS Hijri library with **Islamic civil / tabular** conversion suitable for UI date labels (not prayer-time fiqh). Prayer-time engine remains a later pass.
- Dua corpus ships as JSON under `content/` (parallel to Kitab al-Ghaybah); start with a small curated set (≥ 8 entries) covering distraction, lethargy, gratitude, steadfastness, morning/evening, after salah.
- Namaz + audit caches use **Preferences** (not SQLite) for this pass; volume is small.
- Prompt of the Day / Reading / Journaling metrics can remain heuristic or lightly bound; core of this pass is log + audits + Hijri + Eye removal.
- Ready Index can stay a **local heuristic** from today’s prayer completion (+ optional journal presence) until audits exist; after a daily audit, Ready Summary blurb may show the latest diagnostic excerpt.

---

## Storage

| Store | Use | Cleared by Android “Clear cache”? |
|-------|-----|-------------------------------------|
| `@capacitor/preferences` | Daily namaz logs, prompt drafts, audit caches, rate-limit timestamps | **No** |
| Bundled `content/duas/*.json` | Canonical dua text + citations | N/A |
| LLM HTTP response | Transient — immediately written to Preferences | N/A |
| WebView / HTTP cache | **Forbidden** for logs / audits | Yes — do not use |

### Keys

- `intezari.spiritual.namazByDate` — map `YYYY-MM-DD` → `{ prayers: PrayerLog[] }`
- `intezari.spiritual.promptByDate` — optional evening prompt answers by date
- `intezari.spiritual.dailyAudit` — latest daily audit JSON + `generatedAt` + `date`
- `intezari.spiritual.dailyAuditLockUntil` — ISO timestamp; UI disabled until now ≥ lock
- `intezari.spiritual.weeklyAudit` — latest weekly audit JSON + `weekOf` / `generatedAt`
- `intezari.spiritual.weeklyAuditWeekKey` — idempotency key so the week is not regenerated repeatedly
- `intezari.spiritual.lastWeeklyAttemptAt` — for offline retry backoff

### Prayer log shape

```json
{
  "date": "2026-07-11",
  "prayers": [
    {
      "id": "fajr",
      "done": true,
      "journal": "Sleep inertia; mind on deadlines."
    }
  ]
}
```

Ids: `fajr` | `dhuhr` | `asr` | `maghrib` | `isha`.

---

## Dua corpus (anti-hallucination)

Path: `content/duas/shia-duas.json` (exact filename flexible).

Required fields per entry:

- `id` — stable slug
- `source` — e.g. `Sahifa al-Sajjadiyya`, `Mafatih al-Jinan`
- `title` — short English title
- `ref` — dua / chapter citation
- `arabic` — authentic Arabic text (optional if length is large; prefer include)
- `translation` — careful English rendering
- `themes` — tags the model may match (`distraction`, `lethargy`, `steadfastness`, …)

**Server rule:** response must include `prescriptionDuaId` that exists in the corpus. Client (and server) resolve display text **only** from the corpus. If the model returns an unknown id, pick a deterministic fallback id (e.g. `sahifa-morning-evening`) and still show real scripture — never model-authored dua prose.

---

## Audit input payload

Both endpoints receive an aggregated snapshot (server never trusts client for the Gemini key).

### Daily (`POST /api/analyze-salah` with `scope: "daily"`)

- Today’s five prayers: done flags + journals
- Optional prompt-of-day answer
- Physical for today: completed exercise ids / names, calories burned that day, day title if a plan exists
- Intellect optional: whether today’s narration pack was opened (nice-to-have)

### Weekly (`scope: "weekly"`)

- Seven days of namaz + journals
- Physical for the week: per-day burn, total burn, sessions completed
- Prior daily audit excerpt if present (optional context)

### Response shape (both)

```json
{
  "scope": "daily" | "weekly",
  "periodLabel": "string",
  "diagnostic": "string",
  "remedy": "string",
  "prescriptionDuaId": "sahifa-…",
  "readyBlurb": "string"
}
```

Provider: **Gemini** (`GEMINI_API_KEY`, model env e.g. `GEMINI_AUDIT_MODEL` defaulting to the same flash model as fitness). Never ship the key in the Capacitor bundle.

No invented offline “fake dua” fallback for generation — if offline or API fails, **do not** invent an audit; keep the previous cache (if any) and show a clear error / disabled state.

---

## Connectivity & rate limits

| Action | Online required? | Rate limit |
|--------|------------------|------------|
| Toggle namaz / save journal | No | None |
| Read cached daily / weekly audit | No | None |
| Run **Daily audit** | **Yes** — button disabled offline | One success / 24h (`dailyAuditLockUntil`) |
| Auto **Weekly audit** | **Yes** — skip + retry when online | One success / week key |

Detect online via `navigator.onLine` + failed fetch; prefer treating a failed audit POST as offline/unavailable.

---

## UI rules

### Spiritual page (`/spiritual/`)

1. Header: live **Hijri date** (mono) + `ACTIVE READINESS` chip.
2. **Presence Audit (Salat)** — five `PresenceRow`s; **no Eye watermark / Eye title icon**. Completing a prayer opens `JournalSheet`. Persist immediately to Preferences.
3. **Ready Summary** — local index + blurb; replace “Open Weekly Audit” with **Run Daily Audit** (gold). Disabled when offline or inside the 24h lock (show remaining time / “Available after …”).
4. After a successful daily audit, update blurb from `readyBlurb`; keep a link or affordance to re-read today’s diagnostic/remedy/prescription (sheet or inline expand). **Do not** re-add a weekly generate button.
5. Weekly report access: notification deep-link and/or a quiet “Last weekly Muhasaba” text link **only when a cache exists** (read-only — not a generate CTA).

### Weekly audit page (`/spiritual/audit/`)

- Render cached weekly report: Diagnostic / Remedy / Prescription (corpus dua: title, ref, translation, optional Arabic).
- `CACHED LOCALLY` chip + week label.
- Empty state: “Your weekly Muhasaba arrives with a notification each week” — no generate button.

### Notifications

- Schedule / check on app resume and after namaz saves when online.
- Copy tone: solemn, short — e.g. “Your weekly Muhasaba is ready.”
- Tap → `/spiritual/audit/`.

### Dashboard / FAB

- Remove or retarget any “Weekly Muhasaba path” that implied manual generation; prefer Spiritual tab or open cached audit if present.

---

## Hijri date

- Compute from the **Karachi** calendar day (`Asia/Karachi`), not the device timezone.
- Format example: `14th Rabi' al-Thani 1447` (or project-consistent mono styling).
- Replace `mockSpiritual.hijriDate` entirely.

---

## How to build it (implementation order)

1. Add dua corpus JSON + typed loader (mirror intellect corpus pattern).
2. Spiritual storage module: namaz by date, audit caches, locks.
3. Wire Spiritual page to durable namaz log + journal sheet; drop mocks for prayers.
4. Hijri helper + header binding; remove Eye from Presence Audit.
5. Aggregate helpers: day/week snapshot from spiritual + physical Preferences.
6. `POST /api/analyze-salah` (Gemini) with corpus id validation; client caller + online gate.
7. Daily Audit button + 24h lock + result UI; remove weekly generate button.
8. Weekly scheduler + local notification + `/spiritual/audit/` cache render.
9. Update README to match shipped behavior.

---

## API / Capacitor split

- `next dev`: Route Handler `/api/analyze-salah`
- Static export / Capacitor: `NEXT_PUBLIC_API_BASE_URL` → deployed API origin (same pattern as fitness)

---

## Out of scope

- Supabase sync of namaz / audits
- Sign-in gate for AI
- Live prayer-time notifications / Qum calculation engine
- PDF export of Ready Summary
- SQLite migration for logs
- Invented / model-authored duas
- Pedometer as audit input (use Physical plan session progress + calories only)

---

## Done when

- [x] `04-spiritual.md` written and confirmed
- [x] Namaz log persists per local day; Hudur journals save on device
- [x] Hijri date on Spiritual is correct for the device calendar day
- [x] Eye design removed from Presence Audit
- [x] Daily Audit uses Gemini (`GEMINI_API_KEY`), once / 24h, disabled offline
- [x] Weekly Audit auto-runs + notifies; no weekly generate button
- [x] Both audits include salah + physical day/week data
- [x] Prescription dua always resolves from local Shia corpus
- [x] Cached audits readable offline; generation never invents scripture
- [x] Build succeeds (export + API modes)
