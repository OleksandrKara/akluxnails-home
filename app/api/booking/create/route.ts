import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/square/bookings";
import { resolveBookingIdentity } from "@/lib/bookingIdentity";
import { recordEvent } from "@/lib/tracking";

interface WireSlot {
  startAt: string;
  teamMemberId: string;
  serviceVariationId: string;
  serviceVariationVersion: string;
  durationMinutes: number;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { customerId, slot, addOnVariationIds, customerNote } = body ?? {};
  const wireSlot = slot as WireSlot | undefined;
  if (!customerId || !wireSlot?.startAt || !wireSlot.teamMemberId || !wireSlot.serviceVariationId) {
    return NextResponse.json({ error: "customerId and slot are required" }, { status: 400 });
  }

  try {
    const bookingId = await createBooking({
      customerId,
      slot: {
        startAt: wireSlot.startAt,
        teamMemberId: wireSlot.teamMemberId,
        serviceVariationId: wireSlot.serviceVariationId,
        serviceVariationVersion: BigInt(wireSlot.serviceVariationVersion),
        durationMinutes: wireSlot.durationMinutes,
      },
      addOnVariationIds,
      customerNote,
    });

    const identity = await resolveBookingIdentity(request);
    if (identity.visitorId && identity.landingPageId && identity.variantId) {
      await recordEvent({
        visitorId: identity.visitorId,
        landingPageId: identity.landingPageId,
        variantId: identity.variantId,
        eventType: "booking_completed",
        metadata: { bookingId },
      });
    }

    return NextResponse.json({ bookingId });
  } catch (err) {
    console.error("Failed to create booking", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 502 });
  }
}
