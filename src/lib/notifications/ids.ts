/**
 * Notification ID ranges (avoid weekly Muhasaba 4004):
 * - Prayer: 4100–4169 (7 days × 5 prayers, stride 10)
 * - Exercise: 4200–4213 (7 days × 2 slots)
 */

export const DAYS_AHEAD = 7;

export const PRAYER_NAMES = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
] as const;

export function prayerNotifId(dayOffset: number, prayerIndex: number): number {
  return 4100 + dayOffset * 10 + prayerIndex;
}

export function exerciseMorningId(dayOffset: number): number {
  return 4200 + dayOffset * 2;
}

export function exerciseEveningId(dayOffset: number): number {
  return 4200 + dayOffset * 2 + 1;
}

export function allPrayerIds(): number[] {
  const ids: number[] = [];
  for (let d = 0; d < DAYS_AHEAD; d++) {
    for (let p = 0; p < 5; p++) ids.push(prayerNotifId(d, p));
  }
  return ids;
}

export function allExerciseIds(): number[] {
  const ids: number[] = [];
  for (let d = 0; d < DAYS_AHEAD; d++) {
    ids.push(exerciseMorningId(d), exerciseEveningId(d));
  }
  return ids;
}

export function todayExerciseIds(): number[] {
  return [exerciseMorningId(0), exerciseEveningId(0)];
}
