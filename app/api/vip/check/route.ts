import { toE164 } from "@/lib/phoneServer";
import { NextRequest, NextResponse } from "next/server";

const INTERNAL_BASE_URL = process.env.SALARYREVIEW_INTERNAL_BASE_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

/**
 * Backs the /vip page (the in-salon VIP card, owner request 2026-10-01): a client types their phone
 * number, salaryReview checks for a visit today (booking or payment, Pacific time) and, if so,
 * signs a VIP10 promo that expires at midnight. See salaryReview VipRebookEligibilityService.
 *
 * Anyone can type any number here, so: a per-IP rate limit, only first names come back (never the
 * Square customer id or any booking detail), and "unknown number" and "no visit today" get the
 * same answer.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const attempts = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  if (attempts.size > 5000) {
    for (const [key, times] of attempts) {
      if (times.every((t) => now - t >= WINDOW_MS)) attempts.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ eligible: false, reason: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const phoneE164 = toE164(body?.phoneNumber);
  if (!phoneE164) {
    return NextResponse.json({ eligible: false, reason: "invalid_phone" });
  }

  if (!INTERNAL_BASE_URL || !INTERNAL_API_KEY) {
    console.warn("VIP check skipped: SALARYREVIEW_INTERNAL_BASE_URL/INTERNAL_API_KEY not configured");
    return NextResponse.json({ eligible: false, reason: "error" });
  }
  try {
    // No business id: resolves to AK.LUX.NAILS, same as the promo enroll call (lib/rebookingPromoEnroll.ts).
    const res = await fetch(`${INTERNAL_BASE_URL}/api/internal/vip-rebook/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Internal-Api-Key": INTERNAL_API_KEY },
      body: JSON.stringify({ phoneNumber: phoneE164 }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn("VIP check relay responded", res.status);
      return NextResponse.json({ eligible: false, reason: "error" });
    }
    const data = await res.json();
    if (!data.eligible) {
      const reason = data.reason === "no_visit_today" || data.reason === "invalid_phone" ? data.reason : "error";
      return NextResponse.json({ eligible: false, reason });
    }
    return NextResponse.json({
      eligible: true,
      promo: { code: data.promoCode, expEpochSeconds: data.expEpochSeconds, signature: data.signature },
      givenName: data.givenName ?? null,
      technicianName: data.technicianName ?? null,
      teamMemberId: data.teamMemberId ?? null,
      newClient: Boolean(data.newClient),
    });
  } catch (err) {
    console.error("VIP check failed", err);
    return NextResponse.json({ eligible: false, reason: "error" });
  }
}
