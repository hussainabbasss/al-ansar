import { getDurableJson, setDurableJson } from "@/lib/storage/durable";
import type { FitnessProfile, StoredFitnessPlan } from "./types";

const PROFILE_KEY = "intezari.physical.profile";
const PLAN_KEY = "intezari.physical.plan";
const SESSION_KEY = "intezari.physical.sessionProgress";

export type SessionProgress = {
  /** `${week}-${day}` → completed exercise ids */
  completed: Record<string, string[]>;
};

export async function loadFitnessProfile(): Promise<FitnessProfile | null> {
  return getDurableJson<FitnessProfile>(PROFILE_KEY);
}

export async function saveFitnessProfile(profile: FitnessProfile): Promise<void> {
  await setDurableJson(PROFILE_KEY, profile);
}

export async function loadFitnessPlan(): Promise<StoredFitnessPlan | null> {
  return getDurableJson<StoredFitnessPlan>(PLAN_KEY);
}

export async function saveFitnessPlan(plan: StoredFitnessPlan): Promise<void> {
  await setDurableJson(PLAN_KEY, plan);
}

export async function loadSessionProgress(): Promise<SessionProgress> {
  const data = await getDurableJson<SessionProgress>(SESSION_KEY);
  return data ?? { completed: {} };
}

export async function saveSessionProgress(progress: SessionProgress): Promise<void> {
  await setDurableJson(SESSION_KEY, progress);
}

export function sessionDayKey(week: number, day: string): string {
  return `${week}-${day}`;
}
