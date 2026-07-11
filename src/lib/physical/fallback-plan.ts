import type {
  FitnessPlanPayload,
  FitnessProfile,
  PlanDay,
  PlanWeek,
} from "./types";

function dayNames(count: number): string[] {
  const all = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return all.slice(0, Math.min(6, Math.max(3, count)));
}

function buildDay(
  week: number,
  day: string,
  goal: FitnessProfile["goal"],
  level: FitnessProfile["level"],
): PlanDay {
  const base =
    level === "beginner" ? 220 : level === "intermediate" ? 320 : 420;
  const focus =
    goal === "balanced"
      ? day === "Mon" || day === "Thu"
        ? "strength"
        : day === "Wed"
          ? "mobility"
          : "endurance"
      : goal;

  const exercises = [
    {
      id: `w${week}-${day}-1`,
      name: focus === "mobility" ? "Joint flow + breath" : "Warm-up mobility",
      detail: "5–8 min · hips, T-spine, ankles",
      howTo:
        "Stand tall. Slowly circle ankles, then open/close the hips with gentle knee circles. Thread the needle for the upper back (T-spine): on all fours, slide one arm under the body, then reach it to the ceiling. Breathe slowly through the nose. Keep range pain-free.",
      estimatedCalories: Math.round(base * 0.15),
    },
    {
      id: `w${week}-${day}-2`,
      name:
        focus === "strength"
          ? "Functional strength block"
          : focus === "mobility"
            ? "Deep stretch + control"
            : "Zone 2 conditioning",
      detail:
        focus === "strength"
          ? "Squat / hinge / push pattern · controlled tempo"
          : focus === "mobility"
            ? "Hip openers, shoulder CARs, quiet breathing"
            : "Brisk walk or easy jog · conversational pace",
      howTo:
        focus === "strength"
          ? "Squat: feet under shoulders, sit hips back and down, knees track over toes, stand by driving through mid-foot. Hinge: soft knees, push hips back, flat back, feel hamstrings, return tall. Push: hands under shoulders (floor or incline), body as one line, lower chest with control, press up without flaring ribs. 3 rounds, rest as needed."
          : focus === "mobility"
            ? "Hold each stretch 30–45 seconds per side. For hip openers, keep the back long and breathe into the tight side. For shoulder CARs, move the arm in the largest comfortable circle while ribs stay quiet. Never force a bounce."
            : "Walk or jog at a pace where you can speak full sentences. Soft foot strike, relaxed shoulders, steady breathing. If heart rate feels hard, slow down — Zone 2 is sustainable, not a sprint.",
      estimatedCalories: Math.round(base * 0.55),
    },
    {
      id: `w${week}-${day}-3`,
      name: "Core brace + stillness",
      detail: "Dead bug / side plank · 3 min seated intention",
      howTo:
        "Dead bug: lie on back, arms up, knees at 90°. Exhale and press low back gently into the floor, then extend opposite arm and leg without arching. Alternate sides. Side plank: elbow under shoulder, body in a straight line, squeeze glute; hold or do short sets. Finish seated: spine tall, eyes soft, 3 minutes of quiet breath and intention for service.",
      estimatedCalories: Math.round(base * 0.3),
    },
  ];

  const estimatedCalories = exercises.reduce((s, e) => s + e.estimatedCalories, 0);

  return {
    day,
    title:
      focus === "endurance"
        ? "Companion endurance"
        : focus === "strength"
          ? "Functional strength"
          : focus === "mobility"
            ? "Mobility & stillness"
            : "Balanced readiness",
    focus,
    estimatedCalories,
    durationMins: level === "beginner" ? 35 : level === "intermediate" ? 45 : 55,
    exercises,
  };
}

/** Offline / no-API fallback with the same JSON schema as the LLM. */
export function buildFallbackPlan(profile: FitnessProfile): FitnessPlanPayload {
  const days = dayNames(profile.daysPerWeek);
  const weeks: PlanWeek[] = [1, 2, 3, 4].map((week) => {
    const weekDays = days.map((d) => buildDay(week, d, profile.goal, profile.level));
    const estimatedCaloriesBurn = weekDays.reduce(
      (s, d) => s + d.estimatedCalories,
      0,
    );
    const themes = ["Foundation", "Build", "Intensify", "Consolidate"];
    return {
      week,
      theme: themes[week - 1]!,
      estimatedCaloriesBurn,
      days: weekDays,
    };
  });

  const monthlyCaloriesEstimate = weeks.reduce(
    (s, w) => s + w.estimatedCaloriesBurn,
    0,
  );

  return {
    summary: `A ${profile.daysPerWeek}-day/${profile.level} companion plan oriented to ${profile.goal}, scaled for ${profile.heightCm} cm / ${profile.weightKg} kg. Standard calorie estimates assume steady effort — adjust if medical notes apply: ${profile.medicalNotes || "none"}.`,
    stillnessQuote:
      "Strength is not in the struggle, but in the readiness to struggle.",
    monthlyCaloriesEstimate,
    weeks,
    modules: [
      {
        id: "mod-endurance",
        title: "Companion Endurance",
        description:
          "Long-duration metabolic work to sustain focus under fatigue.",
        chip: "ENDURANCE",
        chipTone: "gold",
        level: profile.level === "beginner" ? "LVL 02" : "LVL 04",
        duration: "45 MINS",
        week: 1,
      },
      {
        id: "mod-agility",
        title: "Functional Agility",
        description:
          "Multi-planar movement and reactive drills for tactical readiness.",
        chip: "AGILITY",
        chipTone: "emerald",
        level: profile.level === "advanced" ? "LVL 07" : "LVL 05",
        duration: "30 MINS",
        week: 2,
      },
    ],
  };
}
