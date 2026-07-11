import { getDurableJson, setDurableJson } from "@/lib/storage/durable";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

/** Qom, Iran — fallback when GPS is denied / unavailable. */
export const QOM_COORDS = { lat: 34.6416, lng: 50.8746 } as const;

const LAST_KNOWN_KEY = "intezari.location.lastKnown";

export type LatLng = { lat: number; lng: number; updatedAt?: string };

export async function loadLastKnownCoords(): Promise<LatLng | null> {
  return getDurableJson<LatLng>(LAST_KNOWN_KEY);
}

export async function saveLastKnownCoords(
  lat: number,
  lng: number,
): Promise<void> {
  await setDurableJson(LAST_KNOWN_KEY, {
    lat,
    lng,
    updatedAt: new Date().toISOString(),
  } satisfies LatLng);
}

/**
 * Resolve coords: live GPS → last known → Qom default.
 * Never throws; always returns usable coordinates.
 */
export async function resolveCoords(): Promise<LatLng> {
  if (Capacitor.isNativePlatform()) {
    try {
      const perm = await Geolocation.requestPermissions();
      if (perm.location === "granted" || perm.coarseLocation === "granted") {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 8000,
        });
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        await saveLastKnownCoords(lat, lng);
        return { lat, lng };
      }
    } catch {
      // fall through
    }
  }

  const last = await loadLastKnownCoords();
  if (last) return last;
  return { lat: QOM_COORDS.lat, lng: QOM_COORDS.lng };
}
