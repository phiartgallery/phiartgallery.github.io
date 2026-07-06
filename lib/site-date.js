import { DateTime } from "luxon";

export const TZ = "America/New_York";

/**
 * Coerce a front-matter date value into a Luxon DateTime in the gallery's
 * timezone — robustly, whether it arrives as:
 *   - a string ("2026-07-25T20:00:00")            → interpreted as local (TZ)
 *   - a Date (js-yaml parses unquoted ISO as UTC) → its wall-clock read back
 *                                                    and re-interpreted as local
 * This matters because the CMS datetime widget stores local wall-clock times
 * (picker_utc: false) and editors think in local time, not UTC.
 */
export function siteDate(v) {
  if (v == null || v === "") return DateTime.invalid("empty");
  if (v instanceof Date) {
    return DateTime.fromObject(
      {
        year: v.getUTCFullYear(),
        month: v.getUTCMonth() + 1,
        day: v.getUTCDate(),
        hour: v.getUTCHours(),
        minute: v.getUTCMinutes(),
        second: v.getUTCSeconds(),
      },
      { zone: TZ }
    );
  }
  return DateTime.fromISO(String(v), { zone: TZ });
}

/** current | upcoming | past for an exhibit's run dates. */
export function exhibitStatus(openDate, closeDate) {
  const now = DateTime.now().setZone(TZ);
  const open = siteDate(openDate);
  const close = siteDate(closeDate).endOf("day");
  if (!open.isValid || !close.isValid) return "current";
  if (now < open) return "upcoming";
  if (now > close) return "past";
  return "current";
}
