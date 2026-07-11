import {
  CalculationMethod,
  Coordinates,
  PrayerTimes,
} from "adhan";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { setDurableJson } from "@/lib/storage/durable";
import { resolveCoords } from "@/lib/location/coords";
import {
  allPrayerIds,
  DAYS_AHEAD,
  PRAYER_NAMES,
  prayerNotifId,
} from "./ids";

/**
 * Calculation method: University of Tehran / Institute of Geophysics
 * (adhan’s closest built-in to Qum / Leva Institute Shia conventions).
 */
export const PRAYER_METHOD_LABEL =
  "Tehran (Institute of Geophysics) — closest to Qum/Leva in adhan";

const SCHEDULED_THROUGH_KEY = "intezari.notifications.prayerScheduledThrough";

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function prayerTimesForDay(
  lat: number,
  lng: number,
  day: Date,
): { name: (typeof PRAYER_NAMES)[number]; at: Date }[] {
  const coords = new Coordinates(lat, lng);
  const params = CalculationMethod.Tehran();
  const times = new PrayerTimes(coords, day, params);
  return [
    { name: "Fajr", at: times.fajr },
    { name: "Dhuhr", at: times.dhuhr },
    { name: "Asr", at: times.asr },
    { name: "Maghrib", at: times.maghrib },
    { name: "Isha", at: times.isha },
  ];
}

async function ensureDisplayPermission(): Promise<boolean> {
  const perm = await LocalNotifications.requestPermissions();
  return perm.display === "granted";
}

/** Schedule 5 salah alerts for the next DAYS_AHEAD days. Native only. */
export async function schedulePrayerNotifications(
  now = new Date(),
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    if (!(await ensureDisplayPermission())) return;

    const { lat, lng } = await resolveCoords();
    const ids = allPrayerIds();
    try {
      await LocalNotifications.cancel({
        notifications: ids.map((id) => ({ id })),
      });
    } catch {
      // none pending
    }

    const origin = startOfLocalDay(now);
    const notifications: {
      id: number;
      title: string;
      body: string;
      schedule: { at: Date };
      extra: { href: string };
    }[] = [];

    for (let d = 0; d < DAYS_AHEAD; d++) {
      const day = addDays(origin, d);
      const slots = prayerTimesForDay(lat, lng, day);
      slots.forEach((slot, prayerIndex) => {
        if (slot.at.getTime() <= now.getTime()) return;
        notifications.push({
          id: prayerNotifId(d, prayerIndex),
          title: "Al-Ansaar",
          body: `It is time for ${slot.name}.`,
          schedule: { at: slot.at },
          extra: { href: "/spiritual/" },
        });
      });
    }

    if (notifications.length) {
      await LocalNotifications.schedule({ notifications });
    }

    const through = addDays(origin, DAYS_AHEAD - 1);
    await setDurableJson(
      SCHEDULED_THROUGH_KEY,
      through.toISOString().slice(0, 10),
    );
  } catch {
    // Web / denied / plugin missing — silent
  }
}
