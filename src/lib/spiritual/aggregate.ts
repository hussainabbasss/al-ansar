import { physicalForCalendarDate } from "@/lib/physical/day-snapshot";
import {
  loadFitnessPlan,
  loadSessionProgress,
} from "@/lib/physical/storage";
import { loadDayNamaz, loadPromptForDate } from "./storage";
import type {
  AuditRequestBody,
  PhysicalDaySnapshot,
  PrayerDaySnapshot,
} from "./types";
import {
  addDays,
  datesInWeek,
  parseLocalDate,
  weekPeriodLabel,
} from "./week";

function toAuditPhysical(
  detail: ReturnType<typeof physicalForCalendarDate>,
): PhysicalDaySnapshot {
  return {
    date: detail.date,
    planDayTitle: detail.planDayTitle,
    caloriesBurned: detail.caloriesBurned,
    completedExercises: detail.completedExercises,
  };
}

async function prayerSnapshot(dateKey: string): Promise<PrayerDaySnapshot> {
  const log = await loadDayNamaz(dateKey);
  const promptAnswer = await loadPromptForDate(dateKey);
  return {
    date: dateKey,
    prayers: log.prayers,
    promptAnswer: promptAnswer || undefined,
  };
}

export async function buildDailyAuditRequest(
  dateKey: string,
): Promise<AuditRequestBody> {
  const [plan, progress, day] = await Promise.all([
    loadFitnessPlan(),
    loadSessionProgress(),
    prayerSnapshot(dateKey),
  ]);
  const physical = toAuditPhysical(
    physicalForCalendarDate(plan, progress, dateKey),
  );
  return {
    scope: "daily",
    periodLabel: `Day ${dateKey}`,
    days: [day],
    physical: {
      totalCaloriesBurned: physical.caloriesBurned,
      days: [physical],
    },
  };
}

export async function buildWeeklyAuditRequest(
  weekKey: string,
): Promise<AuditRequestBody> {
  const start = parseLocalDate(weekKey);
  const end = addDays(start, 6);
  const dateKeys = datesInWeek(start);
  const [plan, progress, ...days] = await Promise.all([
    loadFitnessPlan(),
    loadSessionProgress(),
    ...dateKeys.map((d) => prayerSnapshot(d)),
  ]);

  const physicalDays = dateKeys.map((d) =>
    toAuditPhysical(physicalForCalendarDate(plan, progress, d)),
  );
  const totalCaloriesBurned = physicalDays.reduce(
    (s, d) => s + d.caloriesBurned,
    0,
  );

  return {
    scope: "weekly",
    periodLabel: weekPeriodLabel(start, end),
    days,
    physical: {
      totalCaloriesBurned,
      days: physicalDays,
    },
  };
}

export function computeReadyIndex(
  prayers: { done: boolean; journal: string }[],
): number {
  if (!prayers.length) return 0;
  const doneWeight = 16;
  const journalWeight = 4;
  let score = 0;
  for (const p of prayers) {
    if (p.done) score += doneWeight;
    if (p.done && p.journal.trim()) score += journalWeight;
  }
  return Math.min(99, Math.round(score));
}
