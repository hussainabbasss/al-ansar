import { NextResponse } from "next/server";
import { extractJsonObject, generateLlmText } from "@/lib/llm/providers";
import type { FitnessPlanPayload, FitnessProfile } from "@/lib/physical/types";
import { buildFallbackPlan } from "@/lib/physical/fallback-plan";

export const runtime = "nodejs";

const PLAN_SCHEMA_PROMPT = `You are a cautious fitness coach for a Shia readiness app (Al-Ansaar).
Return ONLY valid JSON matching this shape:
{
  "summary": "string",
  "stillnessQuote": "string",
  "monthlyCaloriesEstimate": number,
  "weeks": [
    {
      "week": 1,
      "theme": "string",
      "estimatedCaloriesBurn": number,
      "days": [
        {
          "day": "Mon",
          "title": "string",
          "focus": "string",
          "estimatedCalories": number,
          "durationMins": number,
          "exercises": [
            {
              "id": "w1-mon-1",
              "name": "string",
              "detail": "string",
              "howTo": "Clear step-by-step instructions for how to perform the exercise safely",
              "estimatedCalories": number
            }
          ]
        }
      ]
    }
  ],
  "modules": [
    {
      "id": "mod-endurance",
      "title": "string",
      "description": "string",
      "chip": "ENDURANCE",
      "chipTone": "gold",
      "level": "LVL 01",
      "duration": "45 MINS",
      "week": 1
    }
  ]
}
Rules:
- Exactly 4 weeks (week values 1..4).
- Each week has the requested daysPerWeek training days (Mon–Sun abbreviations).
- estimatedCalories are standard MET-style estimates for an adult matching the profile (not live tracker data).
- Every exercise MUST include howTo: 3–6 concrete coaching cues (setup, movement, breathing, common mistakes to avoid).
- chipTone must be "gold" or "emerald".
- Respect medicalNotes; prefer conservative volume when notes are non-empty.
- No markdown fences, no commentary outside JSON.`;

function isProfile(body: unknown): body is { profile: FitnessProfile } {
  if (!body || typeof body !== "object") return false;
  const p = (body as { profile?: FitnessProfile }).profile;
  return !!p && typeof p.heightCm === "number" && typeof p.weightKg === "number";
}

function parsePlan(text: string): FitnessPlanPayload | null {
  const parsed = extractJsonObject(text) as FitnessPlanPayload | null;
  if (!parsed?.weeks || parsed.weeks.length !== 4) return null;
  return parsed;
}

async function callLlmPlan(
  profile: FitnessProfile,
): Promise<{ plan: FitnessPlanPayload; provider: string } | null> {
  const llm = await generateLlmText({
    system: PLAN_SCHEMA_PROMPT,
    user: `Generate a one-month companion training plan for this profile:\n${JSON.stringify(profile, null, 2)}`,
    temperature: 0.4,
    geminiModel: process.env.GEMINI_FITNESS_MODEL ?? "gemini-2.0-flash",
    bazaarlinkModel:
      process.env.BAZAARLINK_FITNESS_MODEL ??
      process.env.BAZAARLINK_MODEL ??
      "google/gemini-2.5-flash",
  });
  if (!llm.ok) return null;
  const plan = parsePlan(llm.text);
  if (!plan) return null;
  return { plan, provider: llm.provider };
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isProfile(body)) {
      return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
    }

    const llm = await callLlmPlan(body.profile);
    const plan = llm?.plan ?? buildFallbackPlan(body.profile);

    return NextResponse.json({
      plan,
      source: llm ? "llm" : "fallback",
      provider: llm?.provider ?? "local-fallback",
    });
  } catch {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
