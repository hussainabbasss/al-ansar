import { PLAN_LOCK_DAYS, type FitnessProfile, type StoredFitnessPlan } from "./types";
import { buildFallbackPlan } from "./fallback-plan";
import { saveFitnessPlan, saveFitnessProfile } from "./storage";

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
}

export async function requestFitnessPlan(
  profile: FitnessProfile,
): Promise<StoredFitnessPlan> {
  const generatedAt = new Date();
  const expiresAt = new Date(generatedAt);
  expiresAt.setDate(expiresAt.getDate() + PLAN_LOCK_DAYS);

  let payload = buildFallbackPlan(profile);
  let source: StoredFitnessPlan["source"] = "fallback";

  try {
    const res = await fetch(`${apiBase()}/api/generate-fitness`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        plan?: ReturnType<typeof buildFallbackPlan>;
      };
      if (data.plan?.weeks?.length === 4) {
        payload = data.plan;
        source = "llm";
      }
    }
  } catch {
    // Offline / static export without API — keep fallback
  }

  const stored: StoredFitnessPlan = {
    ...payload,
    generatedAt: generatedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    profile,
    source,
  };

  await saveFitnessProfile(profile);
  await saveFitnessPlan(stored);
  return stored;
}
