import { parsePhoneNumberFromString } from "libphonenumber-js/min";

/** Server-side check for phone numbers coming from the site's forms (components/PhoneInput sends
 * E.164 for any country; older clients may still send a bare US number). Returns E.164 for a valid
 * number, null otherwise. A number without "+" is read as US. */
export function toE164(raw: unknown): string | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const parsed = parsePhoneNumberFromString(value, "US");
  return parsed && parsed.isValid() ? parsed.number : null;
}
