/** Friday-start week helpers for Muhasaba. Weeks run Fri 00:00 → Thu 23:59. */

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseLocalDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Most recent Friday on or before `d` (local). */
export function fridayOnOrBefore(d: Date): Date {
  const day = startOfLocalDay(d);
  const dow = day.getDay(); // 0 Sun … 5 Fri
  const sinceFriday = (dow - 5 + 7) % 7;
  return addDays(day, -sinceFriday);
}

/**
 * The Fri–Thu week that has already closed as of `now`.
 * Closes Thursday 21:00 local — before that, the previous week is still "current closed".
 */
export function closedMuhasabaWeek(now = new Date()): {
  weekKey: string;
  start: Date;
  end: Date;
  triggerAt: Date;
  ready: boolean;
} {
  const today = startOfLocalDay(now);
  const currentFriday = fridayOnOrBefore(today);
  // Candidate closed week: the Fri–Thu whose Thursday is the most recent Thursday
  // that has reached 21:00.
  let weekStart = addDays(currentFriday, -7);
  let thursday = addDays(weekStart, 6);
  let triggerAt = new Date(thursday);
  triggerAt.setHours(21, 0, 0, 0);

  // If we're already past this week's Thursday 21:00, the "current" Fri week is closed.
  const thisWeekThursday = addDays(currentFriday, 6);
  const thisTrigger = new Date(thisWeekThursday);
  thisTrigger.setHours(21, 0, 0, 0);
  if (now.getTime() >= thisTrigger.getTime()) {
    weekStart = currentFriday;
    thursday = thisWeekThursday;
    triggerAt = thisTrigger;
  }

  return {
    weekKey: formatLocalDate(weekStart),
    start: weekStart,
    end: thursday,
    triggerAt,
    ready: now.getTime() >= triggerAt.getTime(),
  };
}

export function datesInWeek(weekStart: Date): string[] {
  return Array.from({ length: 7 }, (_, i) =>
    formatLocalDate(addDays(weekStart, i)),
  );
}

export function weekPeriodLabel(weekStart: Date, weekEnd: Date): string {
  const a = formatLocalDate(weekStart);
  const b = formatLocalDate(weekEnd);
  return `Week of ${a} → ${b}`;
}
