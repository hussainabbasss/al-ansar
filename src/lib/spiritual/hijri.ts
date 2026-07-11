import { toHijri } from "hijri-converter";

const MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Ula",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qa'dah",
  "Dhu al-Hijjah",
] as const;

/** Spiritual calendar day follows Karachi (PKT), not the device TZ. */
export const HIJRI_TIMEZONE = "Asia/Karachi";

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function gregorianPartsInTimeZone(
  d: Date,
  timeZone: string,
): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(d);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { year, month, day };
}

/** Hijri date for the current calendar day in Karachi. */
export function formatHijriDate(d = new Date()): string {
  const { year, month, day } = gregorianPartsInTimeZone(d, HIJRI_TIMEZONE);
  const { hy, hm, hd } = toHijri(year, month, day);
  const monthName = MONTHS[hm - 1] ?? `Month ${hm}`;
  return `${ordinal(hd)} ${monthName} ${hy}`;
}
