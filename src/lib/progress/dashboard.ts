import { getHadithById, type Hadith } from "@/lib/intellect/corpus";
import { loadOrCreateDailyPack } from "@/lib/intellect/daily-pack";
import { wasIntellectOpenedOn } from "@/lib/intellect/opened";
import { loadPhysicalForDate } from "@/lib/physical/day-snapshot";
import { loadDayNamaz, localDateKey } from "@/lib/spiritual/storage";
import { computeProgressScore, type ProgressScore } from "./score";
import { loadMorningNoteForDate } from "./storage";

export type ProgressDashboard = {
  dateKey: string;
  score: ProgressScore;
  prayersDone: number;
  prayersTotal: number;
  physicalPct: number;
  physicalMetric: string;
  intellectOpened: boolean;
  intellectPct: number;
  intellectMetric: string;
  spiritualScore: number;
  spiritualSubtitle: string;
  commandment: Hadith | null;
  morningNote: string;
  exerciseSessionHref: string | null;
};

export async function loadProgressDashboard(
  now = new Date(),
): Promise<ProgressDashboard> {
  const dateKey = localDateKey(now);
  const [namaz, physical, intellectOpened, packResult, morningNote] =
    await Promise.all([
      loadDayNamaz(dateKey),
      loadPhysicalForDate(dateKey),
      wasIntellectOpenedOn(dateKey),
      loadOrCreateDailyPack(now),
      loadMorningNoteForDate(dateKey),
    ]);

  const prayersDone = namaz.prayers.filter((p) => p.done).length;
  const prayersTotal = namaz.prayers.length || 5;
  const score = computeProgressScore({
    prayersDone,
    prayersTotal,
    exercisesDone: physical.completedCount,
    exercisesPlanned: physical.plannedCount,
  });

  const physicalPct =
    physical.plannedCount > 0
      ? Math.round((physical.completedCount / physical.plannedCount) * 100)
      : 0;
  const physicalMetric =
    physical.plannedCount > 0
      ? `${physicalPct}% · ${physical.completedCount}/${physical.plannedCount}`
      : "NO SESSION";

  const spiritualScore = Math.round((prayersDone / prayersTotal) * 100);

  const commandmentId = packResult.pack.ids[0];
  const commandment = commandmentId
    ? (getHadithById(commandmentId) ?? null)
    : null;

  return {
    dateKey,
    score,
    prayersDone,
    prayersTotal,
    physicalPct,
    physicalMetric,
    intellectOpened,
    intellectPct: intellectOpened ? 100 : 0,
    intellectMetric: intellectOpened ? "READ" : "UNREAD",
    spiritualScore,
    spiritualSubtitle: `Namaz completed: ${prayersDone}/${prayersTotal}`,
    commandment,
    morningNote,
    exerciseSessionHref: physical.sessionHref,
  };
}
