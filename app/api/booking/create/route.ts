import { NextRequest, NextResponse } from "next/server";
import { createBooking, getTeamMemberName } from "@/lib/square/bookings";
import { resolveBookingIdentity } from "@/lib/bookingIdentity";
import { recordEvent } from "@/lib/tracking";

interface WireSegment {
  teamMemberId: string;
  serviceVariationId: string;
  serviceVariationVersion: string;
  durationMinutes: number;
}

interface WireSlot {
  startAt: string;
  segments: WireSegment[];
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { customerId, slot, addOnVariationIds, customerNote } = body ?? {};
  const wireSlot = slot as WireSlot | undefined;
  if (!customerId || !wireSlot?.startAt || !wireSlot.segments?.length) {
    return NextResponse.json({ error: "customerId and slot are required" }, { status: 400 });
  }

  try {
    const bookingId = await createBooking({
      customerId,
      slot: {
        startAt: wireSlot.startAt,
        segments: wireSlot.segments.map((seg) => ({
          teamMemberId: seg.teamMemberId,
          serviceVariationId: seg.serviceVariationId,
          serviceVariationVersion: BigInt(seg.serviceVariationVersion),
          durationMinutes: seg.durationMinutes,
        })),
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

    const technicianName = await getTeamMemberName(wireSlot.segments[0].teamMemberId);

    return NextResponse.json({ bookingId, technicianName });
  } catch (err) {
    console.error("Failed to create booking", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 502 });
  }
}
