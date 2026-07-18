import { DEFAULT_MESSAGE, FRIENDLY_MESSAGES } from "./cardErrors";

// Client-side counterpart to cardErrors.ts's friendlyCardErrorMessage — deliberately has no
// `import { SquareError } from "square"` (that pulls the whole Square SDK into the browser
// bundle), so this stays a tiny, browser-safe file. Reuses the exact same wording via
// FRIENDLY_MESSAGES so a customer sees one consistent message regardless of whether the failure
// happened during client-side tokenize() or the server-side "store card on file" call.

export interface TokenizeErrorDetail {
  message?: string;
  code?: string;
  field?: string;
  type?: string;
}

// Best-effort keyword fallback for when the Web Payments SDK's tokenize() error doesn't carry a
// Square error `code` (its client-side validation errors aren't always as structured as the
// server-side Cards/Payments API's), but does name which input the problem is with via `field`
// or its own free-text `message`.
const FIELD_KEYWORDS: { pattern: RegExp; message: string }[] = [
  { pattern: /cvv|security code/i, message: FRIENDLY_MESSAGES.CVV_FAILURE },
  { pattern: /postal|zip/i, message: FRIENDLY_MESSAGES.INVALID_POSTAL_CODE },
  { pattern: /expir/i, message: FRIENDLY_MESSAGES.INVALID_EXPIRATION },
  { pattern: /card.?number|pan\b/i, message: FRIENDLY_MESSAGES.PAN_FAILURE },
];

/** Picks the friendliest, most specific message available for a failed card.tokenize() result —
 * tries Square's own error `code` first (same taxonomy as the server-side Cards API, when
 * present), then the `field` name, then keyword-matches the free-text `message`, and only falls
 * back to a fully generic message if none of those identify what's actually wrong. */
export function friendlyTokenizeErrorMessage(errors: TokenizeErrorDetail[] | undefined): string {
  const first = errors?.[0];
  if (!first) return DEFAULT_MESSAGE;

  if (first.code && FRIENDLY_MESSAGES[first.code]) return FRIENDLY_MESSAGES[first.code];

  const haystack = `${first.field ?? ""} ${first.type ?? ""} ${first.message ?? ""}`;
  for (const { pattern, message } of FIELD_KEYWORDS) {
    if (pattern.test(haystack)) return message;
  }

  // Square's own message is still more specific than our fully generic fallback, when present.
  return first.message ?? DEFAULT_MESSAGE;
}
