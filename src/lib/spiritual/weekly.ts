import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { buildWeeklyAuditRequest } from "./aggregate";
import { requestSalahAudit } from "./analyze";
import { isOnline } from "./online";
import {
  loadLastWeeklyAttemptAt,
  loadWeeklyAuditWeekKey,
  saveLastWeeklyAttemptAt,
  saveWeeklyAudit,
} from "./storage";
import { closedMuhasabaWeek } from "./week";
import type { StoredWeeklyAudit } from "./types";

const NOTIF_ID = 4004;

async function notifyWeeklyReady(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") return;
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIF_ID,
          title: "Al-Ansaar",
          body: "Your weekly Muhasaba is ready.",
          schedule: { at: new Date(Date.now() + 800) },
          extra: { href: "/spiritual/audit/" },
        },
      ],
    });
  } catch {
    // Web / denied — silent
  }
}

/**
 * If the closed Muhasaba week has no cached audit and we are online past the
 * Thursday 21:00 trigger, generate once and notify.
 */
export async function maybeRunWeeklyMuhasaba(
  now = new Date(),
): Promise<StoredWeeklyAudit | null> {
  const closed = closedMuhasabaWeek(now);
  if (!closed.ready) return null;

  const existingKey = await loadWeeklyAuditWeekKey();
  if (existingKey === closed.weekKey) return null;

  if (!isOnline()) return null;

  const lastAttempt = await loadLastWeeklyAttemptAt();
  if (lastAttempt) {
    const elapsed = now.getTime() - new Date(lastAttempt).getTime();
    if (elapsed < 15 * 60 * 1000) return null;
  }

  await saveLastWeeklyAttemptAt(now.toISOString());

  const payload = await buildWeeklyAuditRequest(closed.weekKey);
  const res = await requestSalahAudit(payload);
  if (!res.ok) return null;

  const stored: StoredWeeklyAudit = {
    ...res.result,
    scope: "weekly",
    weekKey: closed.weekKey,
    weekOf: res.result.periodLabel,
    generatedAt: now.toISOString(),
  };
  await saveWeeklyAudit(stored);
  await notifyWeeklyReady();
  return stored;
}
