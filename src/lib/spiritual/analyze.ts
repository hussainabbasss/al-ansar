import type { AuditRequestBody, AuditResultPayload } from "./types";
import { isOnline } from "./online";

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
}

export type AnalyzeError =
  | "offline"
  | "http"
  | "invalid"
  | "unavailable"
  | "missing_key";

export async function requestSalahAudit(
  body: AuditRequestBody,
): Promise<{ ok: true; result: AuditResultPayload } | { ok: false; error: AnalyzeError }> {
  if (!isOnline()) return { ok: false, error: "offline" };

  try {
    const res = await fetch(`${apiBase()}/api/analyze-salah`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        reason?: string;
      } | null;
      if (data?.reason === "missing_key") {
        return { ok: false, error: "missing_key" };
      }
      if (res.status >= 500) return { ok: false, error: "unavailable" };
      return { ok: false, error: "http" };
    }
    const data = (await res.json()) as { result?: AuditResultPayload };
    if (
      !data.result?.diagnostic ||
      !data.result?.remedy ||
      !data.result?.prescriptionDuaId
    ) {
      return { ok: false, error: "invalid" };
    }
    return { ok: true, result: data.result };
  } catch {
    return { ok: false, error: "offline" };
  }
}
