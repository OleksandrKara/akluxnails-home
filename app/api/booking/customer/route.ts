import { NextRequest, NextResponse } from "next/server";
import { findOrCreateCustomer } from "@/lib/square/customers";
import { resolveBookingIdentity } from "@/lib/bookingIdentity";
import { recordEvent } from "@/lib/tracking";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { givenName, familyName, phoneNumber, emailAddress } = body ?? {};
  if (!givenName || !phoneNumber) {
    return NextResponse.json({ error: "givenName and phoneNumber are required" }, { status: 400 });
  }

  try {
    const customerId = await findOrCreateCustomer({ givenName, familyName, phoneNumber, emailAddress });

    const identity = await resolveBookingIdentity(request);
    if (identity.visitorId && identity.landingPageId && identity.variantId) {
      await recordEvent({
        visitorId: identity.visitorId,
        landingPageId: identity.landingPageId,
        variantId: identity.variantId,
        eventType: "booking_started",
      });
    }

    return NextResponse.json({ customerId });
  } catch (err) {
    console.error("Failed to find or create customer", err);
    return NextResponse.json({ error: "Failed to save contact details" }, { status: 502 });
  }
}
