import { NextResponse } from "next/server";
import { extractJsonObject, generateLlmText } from "@/lib/llm/providers";
import { duaCatalogForPrompt, resolvePrescriptionDua } from "@/lib/spiritual/duas";
import type { AuditRequestBody, AuditResultPayload } from "@/lib/spiritual/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a compassionate Shia spiritual mentor (Akhlaq tradition) for the Al-Ansaar readiness app.
You receive a user's salah presence log (done/not done + Hudur journals), optional evening reflection, and physical readiness data (calories burned from completed exercises, session titles).

Return ONLY valid JSON:
{
  "scope": "daily" | "weekly",
  "periodLabel": "string",
  "diagnostic": "string — psychological / environmental roots of distraction or strength, grounded in the data",
  "remedy": "string — practical, actionable advice from Ahl al-Bayt ethical tradition (no fabricated hadith quotes)",
  "prescriptionDuaId": "string — MUST be one of the provided corpus ids",
  "readyBlurb": "string — short Ready Summary line for the UI"
}

Rules:
- Echo the provided scope and periodLabel.
- Be solemn, specific to the data; never invent prayer counts or calories.
- prescriptionDuaId MUST be chosen from the corpus list by theme fit. Never invent dua text or ids.
- No markdown fences, no commentary outside JSON.`;

function isAuditBody(body: unknown): body is AuditRequestBody {
  if (!body || typeof body !== "object") return false;
  const b = body as AuditRequestBody;
  return (
    (b.scope === "daily" || b.scope === "weekly") &&
    typeof b.periodLabel === "string" &&
    Array.isArray(b.days) &&
    !!b.physical &&
    Array.isArray(b.physical.days)
  );
}

function normalizeResult(
  parsed: AuditResultPayload,
  scope: AuditRequestBody["scope"],
  periodLabel: string,
): AuditResultPayload {
  const dua = resolvePrescriptionDua(parsed.prescriptionDuaId);
  return {
    scope,
    periodLabel: parsed.periodLabel || periodLabel,
    diagnostic: String(parsed.diagnostic ?? "").trim(),
    remedy: String(parsed.remedy ?? "").trim(),
    prescriptionDuaId: dua.id,
    readyBlurb: String(parsed.readyBlurb ?? "").trim(),
  };
}

async function callAuditLlm(
  body: AuditRequestBody,
): Promise<
  | { ok: true; result: AuditResultPayload; provider: string }
  | { ok: false; reason: "missing_key" | "provider_error" | "parse" }
> {
  const catalog = duaCatalogForPrompt();
  const llm = await generateLlmText({
    system: SYSTEM_PROMPT,
    user: `Dua corpus (select prescriptionDuaId from these ids only):\n${JSON.stringify(catalog, null, 2)}\n\nUser readiness snapshot:\n${JSON.stringify(body, null, 2)}`,
    temperature: 0.35,
    geminiModel:
      process.env.GEMINI_AUDIT_MODEL ??
      process.env.GEMINI_FITNESS_MODEL ??
      "gemini-2.0-flash",
    bazaarlinkModel:
      process.env.BAZAARLINK_AUDIT_MODEL ??
      process.env.BAZAARLINK_MODEL ??
      "google/gemini-2.5-flash",
  });

  if (!llm.ok) {
    return {
      ok: false,
      reason: llm.reason === "missing_key" ? "missing_key" : "provider_error",
    };
  }

  const parsed = extractJsonObject(llm.text) as AuditResultPayload | null;
  if (!parsed?.diagnostic || !parsed?.remedy) {
    return { ok: false, reason: "parse" };
  }

  return {
    ok: true,
    provider: llm.provider,
    result: normalizeResult(parsed, body.scope, body.periodLabel),
  };
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isAuditBody(body)) {
      return NextResponse.json({ error: "Invalid audit payload" }, { status: 400 });
    }

    const llm = await callAuditLlm(body);
    if (!llm.ok) {
      const message =
        llm.reason === "missing_key"
          ? "No LLM API key configured (GEMINI_API_KEY or BAZAARLINK_API_KEY)"
          : "Audit unavailable";
      return NextResponse.json(
        { error: message, reason: llm.reason },
        { status: 503 },
      );
    }

    const dua = resolvePrescriptionDua(llm.result.prescriptionDuaId);
    const result: AuditResultPayload = {
      ...llm.result,
      prescriptionDuaId: dua.id,
    };

    return NextResponse.json({ result, provider: llm.provider });
  } catch {
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
