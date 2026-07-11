import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { loadPhysicalForDate } from "@/lib/physical/day-snapshot";
import { localDateKey } from "@/lib/spiritual/storage";
import {
  allExerciseIds,
  DAYS_AHEAD,
  exerciseEveningId,
  exerciseMorningId,
  todayExerciseIds,
} from "./ids";

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function atLocalHour(day: Date, hour: number): Date {
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hour,
    0,
    0,
    0,
  );
}

async function ensureDisplayPermission(): Promise<boolean> {
  const perm = await LocalNotifications.requestPermissions();
  return perm.display === "granted";
}

export async function cancelTodayExerciseReminders(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({
      notifications: todayExerciseIds().map((id) => ({ id })),
    });
  } catch {
    // ignore
  }
}

/**
 * Call when the user completes their first exercise of the day.
 * Cancels remaining 10:00 / 18:00 reminders for today.
 */
export async function onFirstExerciseCompletedToday(): Promise<void> {
  await cancelTodayExerciseReminders();
}

/** Two reminders/day at 10:00 and 18:00 if today’s session has zero completions. */
export async function scheduleExerciseReminders(
  now = new Date(),
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    if (!(await ensureDisplayPermission())) return;

    const ids = allExerciseIds();
    try {
      await LocalNotifications.cancel({
        notifications: ids.map((id) => ({ id })),
      });
    } catch {
      // none
    }

    const origin = startOfLocalDay(now);
    const notifications: {
      id: number;
      title: string;
      body: string;
      schedule: { at: Date };
      extra: { href: string };
    }[] = [];

    for (let d = 0; d < DAYS_AHEAD; d++) {
      const day = addDays(origin, d);
      const dateKey = localDateKey(day);
      const physical = await loadPhysicalForDate(dateKey);

      if (physical.completedCount > 0) continue;

      const href = physical.sessionHref ?? "/physical/";
      const slots = [
        { id: exerciseMorningId(d), at: atLocalHour(day, 10) },
        { id: exerciseEveningId(d), at: atLocalHour(day, 18) },
      ];

      for (const slot of slots) {
        if (slot.at.getTime() <= now.getTime()) continue;
        notifications.push({
          id: slot.id,
          title: "Al-Ansaar",
          body: "Time to train — your body is the vessel for the wait.",
          schedule: { at: slot.at },
          extra: { href },
        });
      }
    }

    if (notifications.length) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch {
    // silent
  }
}
