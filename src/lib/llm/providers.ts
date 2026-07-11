/**
 * Server-only LLM helpers.
 * Order: Google Gemini → BazaarLink (OpenAI-compatible) fallback.
 * Keys must live in `.env.local` — never in client bundles.
 */

export type LlmTextResult =
  | { ok: true; text: string; provider: "gemini" | "bazaarlink" }
  | {
      ok: false;
      reason: "missing_key" | "provider_error" | "empty";
    };

export function extractJsonObject(text: string): unknown | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function callGemini(opts: {
  system: string;
  user: string;
  temperature: number;
  model?: string;
}): Promise<LlmTextResult> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return { ok: false, reason: "missing_key" };

  const model =
    opts.model ??
    process.env.GEMINI_FITNESS_MODEL ??
    "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.system }] },
        contents: [
          {
            role: "user",
            parts: [{ text: opts.user }],
          },
        ],
        generationConfig: {
          temperature: opts.temperature,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (err) {
    console.error("Gemini network error", err);
    return { ok: false, reason: "provider_error" };
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Gemini error", res.status, errText.slice(0, 400));
    return { ok: false, reason: "provider_error" };
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!text) return { ok: false, reason: "empty" };
  return { ok: true, text, provider: "gemini" };
}

async function callBazaarLink(opts: {
  system: string;
  user: string;
  temperature: number;
  model?: string;
}): Promise<LlmTextResult> {
  const key = process.env.BAZAARLINK_API_KEY?.trim();
  if (!key) return { ok: false, reason: "missing_key" };

  const model =
    opts.model ??
    process.env.BAZAARLINK_MODEL ??
    "google/gemini-2.5-flash";
  const base = (
    process.env.BAZAARLINK_BASE_URL ?? "https://bazaarlink.ai/api/v1"
  ).replace(/\/$/, "");

  let res: Response;
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: opts.temperature,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
      }),
    });
  } catch (err) {
    console.error("BazaarLink network error", err);
    return { ok: false, reason: "provider_error" };
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("BazaarLink error", res.status, errText.slice(0, 400));
    return { ok: false, reason: "provider_error" };
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return { ok: false, reason: "empty" };
  return { ok: true, text, provider: "bazaarlink" };
}

/**
 * Prefer Gemini; if it fails or has no key, fall back to BazaarLink.
 */
export async function generateLlmText(opts: {
  system: string;
  user: string;
  temperature?: number;
  geminiModel?: string;
  bazaarlinkModel?: string;
}): Promise<LlmTextResult> {
  const temperature = opts.temperature ?? 0.4;
  const gemini = await callGemini({
    system: opts.system,
    user: opts.user,
    temperature,
    model: opts.geminiModel,
  });
  if (gemini.ok) return gemini;

  const bazaar = await callBazaarLink({
    system: opts.system,
    user: opts.user,
    temperature,
    model: opts.bazaarlinkModel,
  });
  if (bazaar.ok) return bazaar;

  if (
    gemini.reason === "missing_key" &&
    bazaar.reason === "missing_key"
  ) {
    return { ok: false, reason: "missing_key" };
  }
  return { ok: false, reason: "provider_error" };
}
