import { getDurableJson, setDurableJson } from "@/lib/storage/durable";
import { localDateKey } from "@/lib/spiritual/storage";

const MORNING_KEY = "intezari.progress.morningNoteByDate";

type MorningMap = Record<string, string>;

export async function loadMorningNoteMap(): Promise<MorningMap> {
  return (await getDurableJson<MorningMap>(MORNING_KEY)) ?? {};
}

export async function loadMorningNoteForDate(date: string): Promise<string> {
  const map = await loadMorningNoteMap();
  return map[date] ?? "";
}

export async function saveMorningNoteForDate(
  date: string,
  value: string,
): Promise<void> {
  const map = await loadMorningNoteMap();
  map[date] = value;
  await setDurableJson(MORNING_KEY, map);
}

export async function loadTodayMorningNote(now = new Date()): Promise<string> {
  return loadMorningNoteForDate(localDateKey(now));
}

export async function saveTodayMorningNote(
  value: string,
  now = new Date(),
): Promise<void> {
  await saveMorningNoteForDate(localDateKey(now), value);
}
