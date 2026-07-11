# Project Intezari

<img src="./docs/banner.png" alt="Project Intezari — Imam al-Asr (atfs)" width="100%" />

<center>
<h2>اَللّٰهُمَّ عَرِّفْنِىْ حُجَّتَكَ - فَاِنَّكَ اِنْ لَّمْ تُعَرِّ فْنِىْ حُجَّتَكَ ضَلَلْتُ عَنْ دِيْنِىْ</h2>
<p>Allahumma a'rrifni hujjatak fa innaka in lam to a'rifni hujjatak, zalal to an deeni.</p>
<h3>Oh Allah make me recognize Your Proof (Imam) — For, if you do not make me recognize Your Proof, I will deviate from my religion</h3>
</center>

Local-first app that treats **Intizar** — waiting for Imam al-Mahdi (atfs) — as active preparation: physical readiness, intellectual grounding, and spiritual mindfulness.

Open source. Use it, fork it, build on it. An Android APK will be uploaded here when the app is finished.

---

## Kitab al-Ghaybah (Intellect)

Bundled corpus: [`content/kitab-al-ghaybah/ahadees.json`](content/kitab-al-ghaybah/ahadees.json) — **60 ahadees** from *Kitab al-Ghaybah*.

How rotation works:

1. Each calendar day the app picks a pack of **7** narrations from the corpus and stores it on device.
2. The Intellect tab shows **3** at a time.
3. Opening Intellect again the same day rotates through that pack of 7.
4. A new day → new pack of 7.

No network required. Pack state lives in Capacitor Preferences (not cache).

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
- On-device: `@capacitor/preferences`
- Fitness plans: Gemini via `/api/generate-fitness` (deploy separately for Capacitor builds)

---

## Run locally

```bash
git clone https://github.com/hussainabbasss/intezari.git
cd intezari
npm install
cp .env.example .env.local
```

Set `GEMINI_API_KEY` in `.env.local` for live plan generation.

```bash
npm run dev          # web UI
npm run build:cap    # static export + cap sync
npm run cap:android  # open Android Studio
```

---

<p align="center"><em>اللّهُمَّ عَجِّلْ لِوَلِيِّكَ الْفَرَج</em></p>
