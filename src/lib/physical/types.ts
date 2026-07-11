export type FitnessLevel = "beginner" | "intermediate" | "advanced";
export type FitnessGoal = "endurance" | "strength" | "mobility" | "balanced";
export type Equipment = "bodyweight" | "home" | "gym";

export type FitnessProfile = {
  heightCm: number;
  weightKg: number;
  age: number;
  level: FitnessLevel;
  goal: FitnessGoal;
  equipment: Equipment;
  medicalNotes: string;
  daysPerWeek: number;
};

export type PlanExercise = {
  id: string;
  name: string;
  detail: string;
  /** Step-by-step cue for how to perform the movement */
  howTo: string;
  estimatedCalories: number;
};

export type PlanDay = {
  day: string;
  title: string;
  focus: string;
  estimatedCalories: number;
  durationMins: number;
  exercises: PlanExercise[];
};

export type PlanWeek = {
  week: number;
  theme: string;
  estimatedCaloriesBurn: number;
  days: PlanDay[];
};

export type PlanModule = {
  id: string;
  title: string;
  description: string;
  chip: string;
  chipTone: "gold" | "emerald";
  level: string;
  duration: string;
  week: number;
};

/** LLM / fallback response body (without local metadata). */
export type FitnessPlanPayload = {
  summary: string;
  stillnessQuote: string;
  monthlyCaloriesEstimate: number;
  weeks: PlanWeek[];
  modules: PlanModule[];
};

/** Durable stored plan. */
export type StoredFitnessPlan = FitnessPlanPayload & {
  generatedAt: string;
  expiresAt: string;
  profile: FitnessProfile;
  source: "llm" | "fallback";
};

export const PLAN_LOCK_DAYS = 30;

export function planIsLocked(plan: StoredFitnessPlan, now = new Date()): boolean {
  return now.getTime() < new Date(plan.expiresAt).getTime();
}

export function daysUntilUnlock(plan: StoredFitnessPlan, now = new Date()): number {
  const ms = new Date(plan.expiresAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
