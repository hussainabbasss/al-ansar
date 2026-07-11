import { burnedCaloriesForDay } from "./schedule";
import {
  loadFitnessPlan,
  loadSessionProgress,
  sessionDayKey,
  type SessionProgress,
} from "./storage";
import type { StoredFitnessPlan } from "./types";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(a: Date, b: Date): number {
  const ms =
    startOfLocalDay(b).getTime() - startOfLocalDay(a).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function parseLocalDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

export type PhysicalDayDetail = {
  date: string;
  planDayTitle: string | null;
  caloriesBurned: number;
  plannedCount: number;
  completedCount: number;
  completedExercises: { id: string; name: string }[];
  /** Plan week + day label when a session exists for this calendar date. */
  sessionHref: string | null;
};

export function physicalForCalendarDate(
  plan: StoredFitnessPlan | null,
  progress: SessionProgress,
  dateKey: string,
): PhysicalDayDetail {
  const empty: PhysicalDayDetail = {
    date: dateKey,
    planDayTitle: null,
    caloriesBurned: 0,
    plannedCount: 0,
    completedCount: 0,
    completedExercises: [],
    sessionHref: null,
  };
  if (!plan) return empty;

  const target = parseLocalDateKey(dateKey);
  const origin = startOfLocalDay(new Date(plan.generatedAt));
  const offset = daysBetween(origin, target);
  if (offset < 0 || offset >= 28) return empty;

  const weekNumber = Math.floor(offset / 7) + 1;
  const week = plan.weeks.find((w) => w.week === weekNumber);
  if (!week) return empty;

  const label = DOW[target.getDay()];
  const dayIndex = week.days.findIndex((d) => d.day === label);
  if (dayIndex < 0) return empty;

  const day = week.days[dayIndex]!;
  const key = sessionDayKey(week.week, day.day);
  const ids = progress.completed[key] ?? [];
  const burned = burnedCaloriesForDay(week, dayIndex, ids);
  const completedExercises = day.exercises
    .filter((e) => ids.includes(e.id))
    .map((e) => ({ id: e.id, name: e.name }));

  return {
    date: dateKey,
    planDayTitle: day.title,
    caloriesBurned: burned,
    plannedCount: day.exercises.length,
    completedCount: completedExercises.length,
    completedExercises,
    sessionHref: `/physical/session/?week=${week.week}`,
  };
}

export async function loadPhysicalForDate(
  dateKey: string,
): Promise<PhysicalDayDetail> {
  const [plan, progress] = await Promise.all([
    loadFitnessPlan(),
    loadSessionProgress(),
  ]);
  return physicalForCalendarDate(plan, progress, dateKey);
}
