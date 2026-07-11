import { NextResponse } from "next/server";
import type { FitnessPlanPayload, FitnessProfile } from "@/lib/physical/types";
import { buildFallbackPlan } from "@/lib/physical/fallback-plan";

export const runtime = "nodejs";

const PLAN_SCHEMA_PROMPT = `You are a cautious fitness coach for a Shia readiness app (Intezari).
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

function extractJson(text: string): FitnessPlanPayload | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as FitnessPlanPayload;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as FitnessPlanPayload;
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function callGemini(
  profile: FitnessProfile,
): Promise<FitnessPlanPayload | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const model = process.env.GEMINI_FITNESS_MODEL ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: PLAN_SCHEMA_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a one-month companion training plan for this profile:\n${JSON.stringify(profile, null, 2)}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Gemini fitness error", res.status, errText.slice(0, 400));
    return null;
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const raw = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!raw) return null;

  const parsed = extractJson(raw);
  if (!parsed?.weeks || parsed.weeks.length !== 4) return null;
  return parsed;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isProfile(body)) {
      return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
    }

    const llm = await callGemini(body.profile);
    const plan = llm ?? buildFallbackPlan(body.profile);

    return NextResponse.json({
      plan,
      source: llm ? "llm" : "fallback",
    });
  } catch {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
