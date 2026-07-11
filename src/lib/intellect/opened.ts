import { getDurableJson, setDurableJson } from "@/lib/storage/durable";
import { localDateKey } from "@/lib/spiritual/storage";

const OPENED_KEY = "intezari.intellect.openedByDate";

type OpenedMap = Record<string, true>;

export async function loadOpenedMap(): Promise<OpenedMap> {
  return (await getDurableJson<OpenedMap>(OPENED_KEY)) ?? {};
}

export async function wasIntellectOpenedOn(date: string): Promise<boolean> {
  const map = await loadOpenedMap();
  return map[date] === true;
}

export async function markIntellectOpened(
  date = localDateKey(),
): Promise<void> {
  const map = await loadOpenedMap();
  if (map[date]) return;
  map[date] = true;
  await setDurableJson(OPENED_KEY, map);
}
