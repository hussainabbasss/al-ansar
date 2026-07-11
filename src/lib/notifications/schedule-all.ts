import { Capacitor } from "@capacitor/core";
import { maybeRunWeeklyMuhasaba } from "@/lib/spiritual/weekly";
import { scheduleExerciseReminders } from "./exercise";
import { schedulePrayerNotifications } from "./prayer";

let scheduling = false;

/** Reschedule prayer + exercise notifications and check weekly Muhasaba. */
export async function refreshLocalSchedules(now = new Date()): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    try {
      await maybeRunWeeklyMuhasaba(now);
    } catch {
      // ignore
    }
    return;
  }
  if (scheduling) return;
  scheduling = true;
  try {
    await Promise.all([
      schedulePrayerNotifications(now),
      scheduleExerciseReminders(now),
      maybeRunWeeklyMuhasaba(now),
    ]);
  } catch {
    // ignore
  } finally {
    scheduling = false;
  }
}
