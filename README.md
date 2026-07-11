# Project Al-Ansaar (الانصار)

<p align="center">
  <img src="./docs/banner.png" alt="Al-Ansaar — Imam al-Asr (atfs)" width="420" />
</p>

<p align="center">
  <img src="./docs/dua-al-ahd.png" alt="Dua Al-A'hd — O Allah, make me among His helpers (Ansaar)" width="560" />
</p>

**Al-Ansaar** (الانصار) — local-first readiness training for the Shia community. It treats **Intizar** — waiting for Imam al-Mahdi (atfs) — as active preparation: physical readiness, intellectual grounding, and spiritual mindfulness.

Open source. Use it, fork it, build on it. An Android APK will be uploaded here when the app is finished.

---

## Progress (home)

The home tab is **Progress**, opened under the calligraphic brand mark **الانصار**. The ring shows **today’s** completion % from:

- **Namaz** (2× weight) — five daily prayers done / not done
- **Exercise** (1× weight) — today’s planned session checklist (omitted from the formula if no session is planned)

Pillars, Daily Commandment (from today’s Kitab al-Ghaybah pack), and morning note all read from on-device Preferences.

**Morning note**: FAB or “New Morning Log” opens a sheet; text is stored per local calendar day on the device.

**Local notifications** (native):

- Five salah alerts from Tehran/Qum-style prayer times (GPS when allowed; otherwise last known or Qom)
- Two exercise reminders at **10:00** and **18:00** if you have not started today’s session; cancelled after the first exercise is completed

---

## Kitab al-Ghaybah (Intellect)

Bundled corpus: [`content/kitab-al-ghaybah/ahadees.json`](content/kitab-al-ghaybah/ahadees.json) — **60 ahadees** from *Kitab al-Ghaybah*.

How rotation works:

1. Each calendar day the app picks a pack of **7** narrations from the corpus and stores it on device.
2. The Intellect tab shows **3** at a time.
3. Opening Intellect again the same day rotates through that pack of 7.
4. A new day → new pack of 7.

No network required. Pack state lives in Capacitor Preferences (not cache). Visiting Intellect marks the day as “read” on Progress.

---

## Spiritual (Muhasaba)

Binary **Namaz log** (Fajr → Isha) with Hudur micro-journals — saved on device per calendar day. Hijri date on the Spiritual tab is live (Umm al-Qura).

**Daily Audit** (Gemini, same `GEMINI_API_KEY` as fitness): runs on demand, once every 24 hours, disabled offline. Uses today’s prayers, journals, and physical burn/completions. Prescription dua is chosen from the bundled Shia corpus ([`content/duas/shia-duas.json`](content/duas/shia-duas.json)) — never invented by the model.

**Weekly Muhasaba**: automatic after Thursday 21:00 local (Friday-start week). No generate button. When online, the app generates, caches the report, and fires a local notification. Read it at `/spiritual/audit/`.

---

## Physical

Fill a short questionnaire (height, weight, age, fitness level, goal, equipment, medical notes, days per week). The app calls the fitness API (Gemini) and saves a **4-week plan** on device.

That plan drives:

- Weekly calorie burn chart
- Training modules
- Session checklist (exercises for the selected day)

If the API is unreachable, a local JSON fallback with the same shape is used so the flow still works offline. **Add details** locks for 30 days after generation; after that you can regenerate or keep the current plan.

---

## Stack

- Next.js (static export) + Capacitor (Android-first)
- Tailwind CSS, Framer Motion
- Calligraphy: **Aref Ruqaa** for الانصار
- On-device: `@capacitor/preferences`, `@capacitor/local-notifications`, `@capacitor/geolocation`
- Prayer times: `adhan` (Tehran method — closest to Qum/Leva in that library)
- Fitness + spiritual audits: Gemini via `/api/generate-fitness` and `/api/analyze-salah` (deploy separately for Capacitor builds)

---

## Run locally

```bash
git clone https://github.com/hussainabbasss/intezari.git
cd intezari
npm install
cp .env.example .env.local
```

Set `GEMINI_API_KEY` in `.env.local` for live fitness plans and spiritual audits.

```bash
npm run dev          # web UI
npm run build:cap    # static export + cap sync
npm run cap:android  # open Android Studio
```

---

<p align="center"><em>اللّهُمَّ عَجِّلْ لِوَلِيِّكَ الْفَرَج</em></p>
