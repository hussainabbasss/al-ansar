export type ProgressStatus =
  | "NOT STARTED"
  | "BEHIND"
  | "ON TRACK"
  | "COMPLETE";

export type ProgressScoreInput = {
  prayersDone: number;
  prayersTotal?: number;
  exercisesDone: number;
  exercisesPlanned: number;
};

export type ProgressScore = {
  percent: number;
  status: ProgressStatus;
  /** Caption state word under the ring */
  state: string;
  namazPct: number;
  exercisePct: number | null;
};

/**
 * Today’s Progress ring: namaz weighs 2× exercise (category weights).
 * If no exercises planned, ring = namaz only.
 */
export function computeProgressScore(input: ProgressScoreInput): ProgressScore {
  const prayersTotal = input.prayersTotal ?? 5;
  const namazPct =
    prayersTotal > 0
      ? Math.min(1, Math.max(0, input.prayersDone / prayersTotal))
      : 0;

  if (input.exercisesPlanned <= 0) {
    const percent = Math.round(namazPct * 100);
    return {
      percent,
      status: statusFromPercent(percent),
      state: stateFromPercent(percent),
      namazPct,
      exercisePct: null,
    };
  }

  const exercisePct = Math.min(
    1,
    Math.max(0, input.exercisesDone / input.exercisesPlanned),
  );
  const percent = Math.round(((2 * namazPct + exercisePct) / 3) * 100);
  return {
    percent,
    status: statusFromPercent(percent),
    state: stateFromPercent(percent),
    namazPct,
    exercisePct,
  };
}

export function statusFromPercent(percent: number): ProgressStatus {
  if (percent <= 0) return "NOT STARTED";
  if (percent < 50) return "BEHIND";
  if (percent < 100) return "ON TRACK";
  return "COMPLETE";
}

function stateFromPercent(percent: number): string {
  if (percent <= 0) return "Not started";
  if (percent < 50) return "Behind";
  if (percent < 100) return "Prepared";
  return "Complete";
}
