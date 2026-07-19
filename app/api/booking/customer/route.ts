import { NextRequest, NextResponse } from "next/server";
import { findOrCreateCustomer } from "@/lib/square/customers";
import { resolveBookingIdentity } from "@/lib/bookingIdentity";
import { recordEvent } from "@/lib/tracking";
import { recordStep1Contact } from "@/lib/marketingContacts";
import { getDefaultLandingPageId } from "@/lib/variant";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { givenName, familyName, phoneNumber, emailAddress, smsOptIn } = body ?? {};
  if (!givenName || !phoneNumber) {
    return NextResponse.json({ error: "givenName and phoneNumber are required" }, { status: 400 });
  }

  try {
    const customerId = await findOrCreateCustomer({
      givenName,
      familyName,
      phoneNumber,
      emailAddress,
      smsOptIn: Boolean(smsOptIn),
    });

    const identity = await resolveBookingIdentity(request);
    if (identity.visitorId && identity.landingPageId && identity.variantId) {
      await recordEvent({
        visitorId: identity.visitorId,
        landingPageId: identity.landingPageId,
        variantId: identity.variantId,
        eventType: "booking_started",
      });
    }

    // marketing.contacts must show this lead regardless of whether the vid/variant cookies
    // resolved — see lib/marketingContacts.ts for why this app writes here at all now.
    await recordStep1Contact({
      givenName,
      phoneNumber,
      emailAddress: emailAddress ?? null,
      squareCustomerId: customerId,
      visitorId: identity.visitorId,
      landingPageId: identity.landingPageId ?? (await getDefaultLandingPageId()),
      variantId: identity.variantId,
    });

    return NextResponse.json({ customerId });
  } catch (err) {
    console.error("Failed to find or create customer", err);
    return NextResponse.json({ error: "Failed to save contact details" }, { status: 502 });
  }
}
