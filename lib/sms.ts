import "server-only";

interface FourHandSmsInput {
  givenName?: string;
  phoneNumber?: string;
  preferredStartAt: string;
}

const INTERNAL_BASE_URL = process.env.SALARYREVIEW_INTERNAL_BASE_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

// The salon (San Diego, CA) is Pacific Time — preferredStartAt arrives as UTC ISO 8601 (see
// DateTimeStep, which is Pacific-labeled but submits in UTC), so it's converted here rather than
// read raw. Mirrors TelegramNotificationService.formatPreferredTime's pattern on the salaryReview
// side (that copy is for the Telegram alert text; this one is for the customer-facing SMS body).
function formatPreferredTime(isoStartAt: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(isoStartAt));
  } catch {
    return isoStartAt;
  }
}

/** Best-effort SMS confirming a new 4-hand lead, relayed through salaryReview (which owns the
 * Twilio credentials — this app never holds them). Never throws: an outage, missing config, or
 * missing consent must never block the booking flow, matching notifyFourHandRequest's (Telegram)
 * fail-open convention. The "four_hand_request_received" template is TRANSACTIONAL — salaryReview's
 * TwilioSmsService sends it regardless of marketing SMS consent. */
export async function notifyFourHandRequestSms(input: FourHandSmsInput): Promise<void> {
  if (!INTERNAL_BASE_URL || !INTERNAL_API_KEY) {
    console.warn("4-hand SMS skipped — SALARYREVIEW_INTERNAL_BASE_URL/INTERNAL_API_KEY not configured");
    return;
  }
  if (!input.phoneNumber) {
    console.warn("4-hand SMS skipped — no phone number");
    return;
  }
  try {
    const res = await fetch(`${INTERNAL_BASE_URL}/api/internal/notifications/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Internal-Api-Key": INTERNAL_API_KEY },
      body: JSON.stringify({
        templateKey: "four_hand_request_received",
        phoneNumber: input.phoneNumber,
        variables: {
          name: input.givenName ?? "there",
          preferredTime: formatPreferredTime(input.preferredStartAt),
        },
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.warn("4-hand SMS relay responded", res.status);
  } catch (err) {
    console.error("4-hand SMS failed (booking flow unaffected)", err);
  }
}
