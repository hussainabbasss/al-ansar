# 05 — Progress Linkup: Live Dashboard, Morning Note, Prayer & Exercise Notifications

**Status:** Implemented  
**Product context:** [`project-overview.md`](./project-overview.md)  
**UI context:** [`ui-plan.md`](./ui-plan.md), [`01-ui.md`](./01-ui.md)  
**Depends on:** [`02-intellect.md`](./02-intellect.md), [`03-physical.md`](./03-physical.md), [`04-spiritual.md`](./04-spiritual.md)  
**Storage pattern:** same durable Preferences approach as prior passes

---

## What we are building

1. **Rename Readiness → Progress** — home tab and ring chrome become Progress; route stays `/`.
2. **Live Progress ring %** — today’s achievement score from **namaz (2× weight)** + **today’s exercise checklist (1× weight)**. No mocks.
3. **Live pillar tiles** — Physical (session %), Intellect (opened today’s pack or not), Spiritual (namaz completion).
4. **Daily Commandment** — one narration from today’s durable Intellect pack (not mock copy).
5. **Morning note** — free-text state-of-mind from Progress FAB / “New Morning Log”, persisted locally per calendar day.
6. **Prayer-time local notifications** — five daily salah alerts from Qum/Leva-style calculation + device location (with fallback).
7. **Exercise reminders** — two local notifications per day (10:00 and 18:00) if the user has not started today’s session yet; cancel remaining when they complete the first exercise.

---

## Language we agreed on

| Term | Meaning |
|------|---------|
| **Progress page** | Home tab at `/` (formerly Readiness). Tab label + ring label rename; route unchanged. |
| **Today’s %** | Single local-calendar-day completion score — not lifetime / weekly readiness. |
| **Namaz total** | How many of the five daily prayers are marked done today (`fajr`…`isha`). |
| **Exercise** | Today’s planned Physical session checklist (completed vs scheduled). Not pedometer. |
| **Morning note** | Free-text state-of-mind for the day, stored on device; separate from Hudur journals and evening prompt. |
| **Local notification** | Capacitor `@capacitor/local-notifications` scheduled on-device (not remote FCM push). |

---

## Decisions made

| Decision | Choice |
|----------|--------|
| Ring formula | Category weights: namaz **2×**, exercise **1×**. If no exercises planned today, ring = namaz only. |
| Pillars | Wire all three from live stores this pass. |
| Daily Commandment | Bind to today’s Intellect pack (one narration from the durable 7). |
| Morning note UI | Sheet on Progress; evening reflection still → Spiritual. |
| Morning note storage | `intezari.progress.morningNoteByDate` map by `YYYY-MM-DD`; overwrite on edit. |
| Rename scope | Tab **Progress**, ring **PROGRESS**, caption “Daily Goals · …”. Keep “Pillars of Readiness”. Route `/`. |
| Ring status | `0` → NOT STARTED; `<50` → BEHIND; `<100` → ON TRACK; `100` → COMPLETE. |
| Intellect pillar | Pack opened at least once today → 100% / READ; else 0% / UNREAD. |
| Prayer method | JS prayer-times with **Qum / Leva** (or closest Shia method). GPS when granted; else last-known coords or default (Qom). All **5** prayers. |
| Prayer reschedule | On app launch / resume + after location obtained; schedule several days ahead. |
| Exercise reminders | **10:00** and **18:00** local. Fire only if **zero** completed exercises for today. Cancel remaining on **first** exercise done. |
| Deep links | Prayer → `/spiritual/`; exercise → `/physical/session/` (or `/physical/` if no plan). |
| Permissions | Request notification (+ location) from Progress first visit; web/dev no-op gracefully. |
| Scope | Progress linkup **and** prayer/exercise notifications in this same pass. |

---

## Assumptions

- “Opened Intellect pack” = user visited `/intellect/` at least once on that local date (persist a lightweight flag when the Intellect page loads / ensures pack).
- Commandment card picks a stable narration for the day (e.g. first id in today’s pack, or `ids[0]` after pack ensure) so the quote does not jump on every Progress remount.
- Prayer library choice may approximate Qum/Leva if the exact method name differs; document the chosen method constant in code.
- Default coords when GPS denied: Qom, Iran (~34.64° N, 50.88° E) until the user grants location or we store a last fix.
- Notification IDs must not collide with weekly Muhasaba (`4004`). Use a reserved range (e.g. prayer `4100–4199`, exercise `4200–4201`).
- Deep-link `extra.href` handling may already be partial for weekly audit; extend the same listener pattern for prayer/exercise if needed.
- Sync / Supabase / pedometer remain out of scope.

---

## Progress % formula

```
namazPct    = prayersDone / 5
exercisePct = exercisesDone / exercisesPlanned   // only if planned > 0

if planned > 0:
  percent = round( (2 * namazPct + 1 * exercisePct) / 3 * 100 )
else:
  percent = round( namazPct * 100 )
```

Status label from `percent` as in Decisions. Caption state word can mirror status (e.g. Prepared / Behind) for the existing ring caption slot.

Reuse / extend physical day resolution already used in `src/lib/spiritual/aggregate.ts` (`physicalForCalendarDate` pattern) so Progress and audits agree on “today’s exercises.”

---

## Storage

| Store | Use | Cleared by Android “Clear cache”? |
|-------|-----|-------------------------------------|
| `@capacitor/preferences` | Morning notes, intellect-opened flag, last geo coords, notification schedule meta | **No** |
| Existing spiritual / physical / intellect keys | Namaz, session progress, daily pack | **No** |
| WebView / HTTP cache | **Forbidden** for user progress data | Yes — do not use |

### New keys

- `intezari.progress.morningNoteByDate` — `{ "YYYY-MM-DD": "text" }`
- `intezari.intellect.openedByDate` — `{ "YYYY-MM-DD": true }` (or equivalent set/map)
- `intezari.location.lastKnown` — `{ lat, lng, updatedAt }` optional cache for prayer times
- Optional: `intezari.notifications.prayerScheduledThrough` — ISO date for idempotent rescheduling

### Existing keys (read)

- `intezari.spiritual.namazByDate`
- `intezari.physical.plan` + `intezari.physical.sessionProgress`
- Intellect daily pack Preferences key from pass 02

---

## UI rules

### Progress page (`/`)

1. **Ring** — live `%`, label `PROGRESS`, status from formula, caption `Daily Goals · {state}`.
2. **Daily Commandment** — today’s pack narration; Reflect → `/intellect/[id]/`.
3. **Pillars of Readiness**
   - Physical: today’s session completion % + metric string (e.g. `60% STRENGTH` or `3/5 DONE`)
   - Intellect: READ / UNREAD (100 / 0)
   - Spiritual: namaz-based score (e.g. done/5 → %) + subtitle with prayer count
4. **Daily Log Actions**
   - New Morning Log → open morning-note sheet (load today’s text if any)
   - Evening Reflection → `/spiritual/?focus=prompt`
5. **FAB** — Log prayer → Spiritual; Morning note → same sheet; Evening → Spiritual prompt.
6. Refresh on focus / visibility so returning from Spiritual/Physical updates the ring without a full remount hack if possible.

### Rename chrome

- `BottomTabs`: **Progress** (keep Zap icon unless design later changes).
- Ring / mock cleanup: stop using `mockPreparation` / `mockPillars` / `mockCommandment` on this page.
- README + any user-facing “Readiness” home references → Progress where they mean the home tab.

### Morning note sheet

- Title tone: solemn, short (“Morning note”).
- Multiline input; persist on blur / Save; show local-save cue consistent with Spiritual (“Stored on this device”).
- Empty state OK — note is optional and **not** in the ring %.

---

## Notifications

### Prayer times (5/day)

1. Add `@capacitor/geolocation` (or platform-appropriate) + a prayer-times JS dependency.
2. Resolve coords: current → lastKnown → Qom default.
3. Compute today’s (and next N days’) Fajr, Dhuhr, Asr, Maghrib, Isha with Qum/Leva-style method.
4. Schedule Capacitor local notifications at each time; body e.g. “It is time for Fajr.”
5. `extra.href`: `/spiritual/`.
6. Reschedule on launch/resume; cancel+replace stale IDs in the reserved prayer range.
7. Native only; skip silently on web.

### Exercise reminders (2/day)

1. Schedule **10:00** and **18:00** for today (and optionally next few days) when Progress/app resumes.
2. Before firing / when scheduling for “now,” if today’s completed exercise count **> 0**, do not keep pending reminders for that day — cancel them.
3. On **first** exercise checkbox save in session flow, cancel today’s remaining exercise notification IDs.
4. If no plan exists, still allow reminders (encourage opening Physical) **or** skip scheduling — **prefer schedule anyway** with deep link to `/physical/` so the habit exists before a plan.
5. `extra.href`: `/physical/session/` when a plan+day exists, else `/physical/`.

### Permissions

- First Progress visit (native): request notifications; request location when scheduling prayer times.
- Denied notifications: app works; no spam retries every render — remember soft “asked” if useful.
- Denied location: use fallback coords; prayer times still schedule.

---

## How to build it (implementation order)

1. Progress scoring helpers — namaz + exercise day snapshot → `%` + status; unit-friendly pure functions.
2. Morning note storage module + sheet UI on Progress.
3. Intellect “opened today” flag on Intellect page load; expose for Progress pillar.
4. Wire Progress page: ring, pillars, commandment from live data; rename tab/labels; drop home mocks.
5. Prayer-times module (coords + calculation) + notification scheduler (multi-day).
6. Exercise reminder scheduler + cancel-on-first-complete in session save path.
7. Hook schedulers into app shell / Progress mount + resume; deep-link extras if missing.
8. Update README to match Progress home, morning note, and notification behavior.

---

## Out of scope

- Remote push (FCM / APNs server)
- Supabase sync of morning notes or progress aggregates
- Pedometer / live steps in the Progress %
- Settings screen for custom reminder times / calculation method toggles (hard-code agreed defaults this pass)
- Changing Spiritual Ready Index formula (can stay as-is on Spiritual)
- Societal pillar / PDF export

---

## Done when

- [x] `05-linkup.md` written and confirmed
- [x] Home tab labeled Progress; ring shows live today % (namaz 2×, exercise 1×)
- [x] Pillars and Daily Commandment use real on-device data
- [x] Morning note saves per day in Preferences and opens from Progress
- [x] Five prayer-time local notifications schedule from Qum/Leva-style times + location/fallback
- [x] Two daily exercise reminders at 10:00 / 18:00; cancel after first exercise completed
- [x] Web/dev degrades gracefully; native build + `cap sync` succeed
- [x] README updated

---

## Confirm to build

Implemented after confirmation.`}