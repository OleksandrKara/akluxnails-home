import { NextRequest, NextResponse } from "next/server";
import { getItemByName } from "@/lib/square/catalog";
import { searchAvailability } from "@/lib/square/availability";
import { createBooking } from "@/lib/square/bookings";
import { findOrCreateCustomer } from "@/lib/square/customers";
import { FOUR_HANDS_REQUEST_ITEM_NAME } from "@/lib/services-config";
import { resolveBookingIdentity } from "@/lib/bookingIdentity";
import { recordEvent } from "@/lib/tracking";

/**
 * 4-hand appointments need two technicians coordinated by staff, so there's no real self-service
 * time picker — matching mani's existing pattern, this just captures the lead (contact info +
 * SMS consent) and books Square's placeholder item at the next open slot so it shows up on the
 * calendar and in reporting; staff follow up to schedule the actual appointment.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { givenName, familyName, phoneNumber, emailAddress, smsOptIn } = body ?? {};
  if (!givenName || !phoneNumber) {
    return NextResponse.json({ error: "givenName and phoneNumber are required" }, { status: 400 });
  }

  try {
    const item = await getItemByName(FOUR_HANDS_REQUEST_ITEM_NAME);
    const variation = item?.variations[0];
    if (!variation) {
      return NextResponse.json({ error: "4-hands request isn't available right now" }, { status: 502 });
    }

    const slots = await searchAvailability([variation.variationId], 32);
    if (slots.length === 0) {
      return NextResponse.json({ error: "No openings found — please call us instead" }, { status: 502 });
    }

    const customerId = await findOrCreateCustomer({
      givenName,
      familyName,
      phoneNumber,
      emailAddress,
      smsOptIn: Boolean(smsOptIn),
    });

    const bookingId = await createBooking({
      customerId,
      slot: slots[0],
      customerNote: "4-hand appointment request submitted via akluxnails.com — contact customer to schedule the actual date/time.",
    });

    const identity = await resolveBookingIdentity(request);
    if (identity.visitorId && identity.landingPageId && identity.variantId) {
      await recordEvent({
        visitorId: identity.visitorId,
        landingPageId: identity.landingPageId,
        variantId: identity.variantId,
        eventType: "booking_completed",
        metadata: { bookingId, fourHandsRequest: true },
      });
    }

    return NextResponse.json({ bookingId });
  } catch (err) {
    console.error("Failed to submit 4-hands request", err);
    return NextResponse.json({ error: "Something went wrong. Please call us instead." }, { status: 502 });
  }
}
