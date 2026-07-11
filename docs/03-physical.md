# 03 — Physical Plan & Durable Local Storage

**Status:** Implemented  
**Product context:** [`project-overview.md`](./project-overview.md)  
**UI context:** [`ui-plan.md`](./ui-plan.md), [`01-ui.md`](./01-ui.md)  
**Storage pattern:** same durable Preferences approach as [`02-intellect.md`](./02-intellect.md)

---

## What we are building

1. **Durable on-device storage** for the fitness profile + generated monthly training plan (Preferences — not cache).
2. **Gated Physical UI**: until a plan exists, only **Add details** is enabled; chart, modules, and Record Session stay disabled.
3. **Questionnaire** (height, weight, age, level, goal, equipment, medical notes) → **LLM** returns a **strict JSON** weekly plan for **4 weeks** (one month).
4. Plan is saved locally and drives the Physical screen (calories chart, modules, session checklist).
5. **Add details** locks for **30 days** after generation. After 30 days it unlocks again; user may regenerate **or keep** the current plan. Other components stay enabled after unlock.

## Storage principle

| Store | Use | Cleared by Android “Clear cache”? |
|-------|-----|-------------------------------------|
| `@capacitor/preferences` | Profile, plan JSON, session checkmarks, lock timestamps | **No** |
| LLM HTTP response | Transient only — immediately written to Preferences | N/A |
| WebView / HTTP cache | **Forbidden** for the plan | Yes — do not use |

Keys:

- `intezari.physical.profile` — last submitted questionnaire
- `intezari.physical.plan` — full monthly plan JSON + `generatedAt` / `expiresAt`
- `intezari.physical.sessionProgress` — completed exercise ids for the active day

## Questionnaire fields

| Field | Notes |
|-------|--------|
| Height (cm) | required |
| Weight (kg) | required |
| Age | required |
| Fitness level | beginner / intermediate / advanced |
| Primary goal | endurance / strength / mobility / balanced |
| Equipment | bodyweight / home / gym |
| Medical notes | free text, optional (“none”) |
| Days per week | 3–6 |

## LLM JSON contract

Endpoint: `POST /api/generate-fitness` (server; Capacitor client calls `NEXT_PUBLIC_API_BASE_URL` when statically exported).

Provider: **Google Gemini** via `GEMINI_API_KEY` (see `.env.example`). Never put the key in client code or Capacitor bundles.

Response shape (abbreviated):

```json
{
  "summary": "string",
  "stillnessQuote": "string",
  "monthlyCaloriesEstimate": 7200,
  "weeks": [
    {
      "week": 1,
      "theme": "Foundation",
      "estimatedCaloriesBurn": 1800,
      "days": [
        {
          "day": "Mon",
          "title": "Zone 2 + core",
          "focus": "endurance",
          "estimatedCalories": 320,
          "durationMins": 45,
          "exercises": [
            { "id": "w1-mon-1", "name": "Brisk walk", "detail": "20 min easy", "howTo": "Step-by-step cues…", "estimatedCalories": 140 }
          ]
        }
      ]
    }
  ],
  "modules": [
    {
      "id": "mod-endurance",
      "title": "Companion Endurance",
      "description": "…",
      "chip": "ENDURANCE",
      "chipTone": "gold",
      "level": "LVL 01",
      "duration": "45 MINS",
      "week": 1
    }
  ]
}
```

Calories are **standard estimates** for rendering the weekly burn chart — not live wearables in this pass.

If the API is unreachable / no `GEMINI_API_KEY`, the client uses a **local JSON fallback** with the same schema so offline-first still works.

## UI rules

### No plan yet

- Enable: **Add details**
- Disable (visually + non-interactive): calories card, Record Session, modules, stillness

### Plan active (< 30 days since `generatedAt`)

- Enable: all plan-driven components
- Disable: **Add details** (show lock date)

### Plan expired (≥ 30 days)

- Keep plan components **enabled** (user can continue the current plan)
- Re-enable **Add details** for optional regeneration
- Offer **Keep current plan** (no-op, dismisses prompt)

### Calories card

Replace “Readiness Load” with **Calories Burn** for the selected week (tabs Week 1–4). Bars = each day’s `estimatedCalories`; headline = week total.

### Session

Checklist mapped from today’s (or selected) day exercises in the JSON; checkmarks persisted in Preferences.

## API / Capacitor split

- `next dev` / non-export build: Route Handler at `/api/generate-fitness`
- Capacitor static export (`STATIC_EXPORT=1`): set `NEXT_PUBLIC_API_BASE_URL` to the deployed API origin

## Out of scope

- Pedometer / HealthKit live calories
- Supabase sync of plans
- Sign-in gate (can add later per product overview)

## Done when

- [x] `03-physical.md` written
- [x] Preferences holds profile + plan + session progress
- [x] Physical UI gated until first plan; Add details locks 30 days
- [x] LLM (or fallback) returns monthly JSON; UI maps chart/modules/session
- [x] Week tabs for calories; interactive checklist
- [x] Build succeeds (export + API modes documented)
