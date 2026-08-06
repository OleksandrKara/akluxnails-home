import "server-only";

const INTERNAL_BASE_URL = process.env.SALARYREVIEW_INTERNAL_BASE_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

interface EnrollInput {
  squareCustomerId: string;
  expEpochSeconds: number;
  signature: string;
  customerName?: string;
  phoneNumber?: string;
  appointmentStartAt?: string;
  /** REBOOK10 or WINBACK5 — omitted defaults to REBOOK10 on salaryReview's side (backward
   * compatible, see openspec/changes/lapsed-customer-winback-automation design.md D9). */
  promoCode?: string;
}

/** Enrolls a customer in the Square auto-discount group for the same-day-rebooking ($10) or
 * lapsed-customer-winback ($5) promo, and (server-side, via salaryReview) alerts staff — see
 * openspec/changes/same-day-rebooking-discount design.md D7 and
 * openspec/changes/lapsed-customer-winback-automation design.md D9. Best-effort: never blocks or
 * fails the booking itself. The signature is re-verified again on salaryReview's side
 * independently — this call alone proves nothing on its own, matching design.md D8. */
export async function enrollRebookingPromo(input: EnrollInput): Promise<void> {
  if (!INTERNAL_BASE_URL || !INTERNAL_API_KEY) {
    console.warn("Rebooking-promo enroll skipped — SALARYREVIEW_INTERNAL_BASE_URL/INTERNAL_API_KEY not configured");
    return;
  }
  try {
    const res = await fetch(`${INTERNAL_BASE_URL}/api/internal/rebooking-promo/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Internal-Api-Key": INTERNAL_API_KEY },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.warn("Rebooking-promo enroll relay responded", res.status);
  } catch (err) {
    console.error("Rebooking-promo enroll failed (booking flow unaffected)", err);
  }
}
