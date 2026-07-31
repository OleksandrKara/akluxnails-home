import { NextRequest, NextResponse } from "next/server";
import { verifyRebookingPromoSignature } from "@/lib/rebookingPromo";

/**
 * Used by BookingModalProvider (a client component rendered in the root layout, above any page's
 * own server-rendered searchParams) to verify the promo link's signature without ever holding the
 * secret client-side — see openspec/changes/same-day-rebooking-discount design.md D8. The
 * homepage's own server-rendered banner verifies directly (it already runs server-side), so this
 * route exists purely for the booking-flow state, not the banner.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("promo");
  const expRaw = searchParams.get("exp");
  const signature = searchParams.get("sig");

  if (!code || !expRaw || !signature) {
    return NextResponse.json({ valid: false });
  }
  const expEpochSeconds = Number(expRaw);
  if (!Number.isFinite(expEpochSeconds)) {
    return NextResponse.json({ valid: false });
  }
  if (!verifyRebookingPromoSignature(code, expEpochSeconds, signature)) {
    return NextResponse.json({ valid: false });
  }
  return NextResponse.json({ valid: true, code, expEpochSeconds, signature });
}
