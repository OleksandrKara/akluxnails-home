import "server-only";

interface FourHandNotifyInput {
  customerName?: string;
  phoneNumber?: string;
  preferredStartAt: string;
  /** Marketing display estimate in dollars (see FOUR_HANDS_DISPLAY_PRICE_CENTS) — not a real
   * Square price, just enough context for the manager reading the alert. */
  estimatedPrice?: number;
}

const INTERNAL_BASE_URL = process.env.SALARYREVIEW_INTERNAL_BASE_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

/** Best-effort Telegram alert for a new 4-hand lead, relayed through salaryReview (which owns the
 * bot token — this app never holds it). Never throws: an outage or missing config must never
 * block the booking flow, matching every other tracking call in this app. */
export async function notifyFourHandRequest(input: FourHandNotifyInput): Promise<void> {
  if (!INTERNAL_BASE_URL || !INTERNAL_API_KEY) {
    console.warn("4-hand Telegram alert skipped — SALARYREVIEW_INTERNAL_BASE_URL/INTERNAL_API_KEY not configured");
    return;
  }
  try {
    const res = await fetch(`${INTERNAL_BASE_URL}/api/internal/notifications/four-hand-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Internal-Api-Key": INTERNAL_API_KEY },
      body: JSON.stringify({ source: "akluxnails-home", ...input }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.warn("4-hand Telegram alert relay responded", res.status);
  } catch (err) {
    console.error("4-hand Telegram alert failed (booking flow unaffected)", err);
  }
}
