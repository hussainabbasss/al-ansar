export type PrayerId = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export type PrayerLog = {
  id: PrayerId;
  done: boolean;
  journal: string;
};

export type DayNamazLog = {
  date: string;
  prayers: PrayerLog[];
};

export type AuditScope = "daily" | "weekly";

/** Raw LLM / API body before dua resolution. */
export type AuditResultPayload = {
  scope: AuditScope;
  periodLabel: string;
  diagnostic: string;
  remedy: string;
  prescriptionDuaId: string;
  readyBlurb: string;
};

export type StoredDailyAudit = AuditResultPayload & {
  date: string;
  generatedAt: string;
};

export type StoredWeeklyAudit = AuditResultPayload & {
  weekKey: string;
  weekOf: string;
  generatedAt: string;
};

export type PhysicalDaySnapshot = {
  date: string;
  planDayTitle: string | null;
  caloriesBurned: number;
  completedExercises: { id: string; name: string }[];
};

export type PrayerDaySnapshot = {
  date: string;
  prayers: PrayerLog[];
  promptAnswer?: string;
};

export type AuditRequestBody = {
  scope: AuditScope;
  periodLabel: string;
  days: PrayerDaySnapshot[];
  physical: {
    totalCaloriesBurned: number;
    days: PhysicalDaySnapshot[];
  };
  priorDailyExcerpt?: string;
};

export const PRAYER_META: {
  id: PrayerId;
  name: string;
  subtitle: string;
}[] = [
  { id: "fajr", name: "FAJR", subtitle: "Pre-Dawn Connection" },
  { id: "dhuhr", name: "DHUHR", subtitle: "Mid-Day Resilience" },
  { id: "asr", name: "ASR", subtitle: "Afternoon Steadiness" },
  { id: "maghrib", name: "MAGHRIB", subtitle: "Evening Threshold" },
  { id: "isha", name: "ISHA", subtitle: "Night Seal" },
];

export function emptyPrayerLogs(): PrayerLog[] {
  return PRAYER_META.map((p) => ({
    id: p.id,
    done: false,
    journal: "",
  }));
}
