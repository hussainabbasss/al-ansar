import type { PlanWeek, StoredFitnessPlan } from "./types";

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function daysBetween(a: Date, b: Date): number {
  const ms = startOfLocalDay(b).getTime() - startOfLocalDay(a).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/** Plan day 0 of week 1 starts on the local calendar day the plan was generated. */
export function weekStartDate(plan: StoredFitnessPlan, weekNumber: number): Date {
  const origin = startOfLocalDay(new Date(plan.generatedAt));
  return addDays(origin, (weekNumber - 1) * 7);
}

/**
 * Whether exercise checkmarks are allowed for this day index (0-based) in a week.
 * Future days/weeks are viewable but not tickable.
 */
export function isPlanDayTickable(
  plan: StoredFitnessPlan,
  weekNumber: number,
  dayIndex: number,
  now = new Date(),
): boolean {
  const today = startOfLocalDay(now);
  const start = weekStartDate(plan, weekNumber);
  const end = addDays(start, 7);
  if (today < start) return false;
  if (today >= end) return true;
  const offset = daysBetween(start, today);
  return dayIndex <= offset;
}

export function planDayLabel(dayIndex: number): string {
  return `D${dayIndex + 1}`;
}

export function currentPlanDayIndex(
  plan: StoredFitnessPlan,
  weekNumber: number,
  now = new Date(),
): number {
  const today = startOfLocalDay(now);
  const start = weekStartDate(plan, weekNumber);
  if (today < start) return -1;
  return daysBetween(start, today);
}

export function burnedCaloriesForDay(
  week: PlanWeek,
  dayIndex: number,
  completedIds: string[],
): number {
  const day = week.days[dayIndex];
  if (!day) return 0;
  return day.exercises
    .filter((e) => completedIds.includes(e.id))
    .reduce((sum, e) => sum + e.estimatedCalories, 0);
}
