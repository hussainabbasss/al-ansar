import { getDurableJson, setDurableJson } from "@/lib/storage/durable";
import {
  emptyPrayerLogs,
  type DayNamazLog,
  type PrayerId,
  type PrayerLog,
  type StoredDailyAudit,
  type StoredWeeklyAudit,
} from "./types";

const NAMAZ_KEY = "intezari.spiritual.namazByDate";
const PROMPT_KEY = "intezari.spiritual.promptByDate";
const DAILY_AUDIT_KEY = "intezari.spiritual.dailyAudit";
const DAILY_LOCK_KEY = "intezari.spiritual.dailyAuditLockUntil";
const WEEKLY_AUDIT_KEY = "intezari.spiritual.weeklyAudit";
const WEEKLY_KEY_KEY = "intezari.spiritual.weeklyAuditWeekKey";
const WEEKLY_ATTEMPT_KEY = "intezari.spiritual.lastWeeklyAttemptAt";

type NamazMap = Record<string, DayNamazLog>;
type PromptMap = Record<string, string>;

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function loadNamazMap(): Promise<NamazMap> {
  return (await getDurableJson<NamazMap>(NAMAZ_KEY)) ?? {};
}

export async function loadDayNamaz(date: string): Promise<DayNamazLog> {
  const map = await loadNamazMap();
  const existing = map[date];
  if (existing?.prayers?.length === 5) return existing;
  return { date, prayers: emptyPrayerLogs() };
}

export async function saveDayNamaz(log: DayNamazLog): Promise<void> {
  const map = await loadNamazMap();
  map[log.date] = log;
  await setDurableJson(NAMAZ_KEY, map);
}

export async function updatePrayer(
  date: string,
  id: PrayerId,
  patch: Partial<Pick<PrayerLog, "done" | "journal">>,
): Promise<DayNamazLog> {
  const log = await loadDayNamaz(date);
  const prayers = log.prayers.map((p) =>
    p.id === id ? { ...p, ...patch } : p,
  );
  const next = { date, prayers };
  await saveDayNamaz(next);
  return next;
}

export async function loadPromptMap(): Promise<PromptMap> {
  return (await getDurableJson<PromptMap>(PROMPT_KEY)) ?? {};
}

export async function loadPromptForDate(date: string): Promise<string> {
  const map = await loadPromptMap();
  return map[date] ?? "";
}

export async function savePromptForDate(
  date: string,
  value: string,
): Promise<void> {
  const map = await loadPromptMap();
  map[date] = value;
  await setDurableJson(PROMPT_KEY, map);
}

export async function loadDailyAudit(): Promise<StoredDailyAudit | null> {
  return getDurableJson<StoredDailyAudit>(DAILY_AUDIT_KEY);
}

export async function saveDailyAudit(audit: StoredDailyAudit): Promise<void> {
  await setDurableJson(DAILY_AUDIT_KEY, audit);
  const lockUntil = new Date(audit.generatedAt);
  lockUntil.setHours(lockUntil.getHours() + 24);
  await setDurableJson(DAILY_LOCK_KEY, lockUntil.toISOString());
}

export async function loadDailyAuditLockUntil(): Promise<string | null> {
  return getDurableJson<string>(DAILY_LOCK_KEY);
}

export async function isDailyAuditLocked(now = new Date()): Promise<boolean> {
  const until = await loadDailyAuditLockUntil();
  if (!until) return false;
  return now.getTime() < new Date(until).getTime();
}

export async function loadWeeklyAudit(): Promise<StoredWeeklyAudit | null> {
  return getDurableJson<StoredWeeklyAudit>(WEEKLY_AUDIT_KEY);
}

export async function saveWeeklyAudit(audit: StoredWeeklyAudit): Promise<void> {
  await setDurableJson(WEEKLY_AUDIT_KEY, audit);
  await setDurableJson(WEEKLY_KEY_KEY, audit.weekKey);
}

export async function loadWeeklyAuditWeekKey(): Promise<string | null> {
  return getDurableJson<string>(WEEKLY_KEY_KEY);
}

export async function loadLastWeeklyAttemptAt(): Promise<string | null> {
  return getDurableJson<string>(WEEKLY_ATTEMPT_KEY);
}

export async function saveLastWeeklyAttemptAt(iso: string): Promise<void> {
  await setDurableJson(WEEKLY_ATTEMPT_KEY, iso);
}
