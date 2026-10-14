/** The salon's own time zone. Booking times are always shown in it (2026-10-14: the booking popup
 * printed slots in the visitor's device time zone, so anyone whose phone was set to another zone
 * saw shifted hours, e.g. "11:30 PM" and "1:00 AM" slots, and days split differently). */
export const SALON_TZ = "America/Los_Angeles";

/** True when the visitor's device is in another time zone than the salon. */
export function visitorOutsideSalonTz(): boolean {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone !== SALON_TZ;
  } catch {
    return false;
  }
}
