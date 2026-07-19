import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createBooking, getTeamMemberName } from "@/lib/square/bookings";
import { getServiceVariation } from "@/lib/square/catalog";
import { resolveBookingIdentity } from "@/lib/bookingIdentity";
import { recordEvent } from "@/lib/tracking";
import { notifyFourHandRequest } from "@/lib/telegram";
import { notifyFourHandRequestSms } from "@/lib/sms";
import { FOUR_HANDS_REQUEST_ITEM_NAME } from "@/lib/services-config";
import { linkContactToBooking } from "@/lib/marketingContacts";
import { getDefaultLandingPageId } from "@/lib/variant";

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

interface WireContact {
  givenName?: string;
  familyName?: string;
  phoneNumber?: string;
  emailAddress?: string;
}

/** Priced from the catalog rather than trusting a client-sent total — the same reasoning
 * createBooking already applies to add-on service_variation_version. Used only for
 * marketing.contacts' booking_price column; has no bearing on what Square actually charges. */
async function computeBookingPriceCents(segments: WireSegment[], addOnVariationIds?: string[]): Promise<number> {
  const variationIds = [...segments.map((s) => s.serviceVariationId), ...(addOnVariationIds ?? [])];
  const resolved = await Promise.all(variationIds.map((id) => getServiceVariation(id)));
  return resolved.reduce((sum, r) => sum + (r?.variation.priceCents ?? 0), 0);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { customerId, slot, addOnVariationIds, customerNote, serviceName, contact, smsOptIn } = body ?? {};
  const wireSlot = slot as WireSlot | undefined;
  const wireContact = contact as WireContact | undefined;
  if (!customerId || !wireSlot?.startAt || !wireSlot.segments?.length) {
    return NextResponse.json({ error: "customerId and slot are required" }, { status: 400 });
  }

  // Re-derived server-side from the catalog item name (this app's existing convention for
  // identifying the 4-hand placeholder — see lib/services-config.ts) rather than trusting a
  // client-sent boolean directly. Worst case if a client lied about serviceName: a spammy lead +
  // a Telegram ping, no real Square appointment — strictly less than today's behavior, where
  // card/cancellation gating is already client-side only.
  const isFourHandsRequest = serviceName === FOUR_HANDS_REQUEST_ITEM_NAME;

  try {
    let bookingId: string;
    let bookingStatus: string;
    let bookingPriceCents: number | null;
    let bookingArtistName: string | null;
    const technicianName = await getTeamMemberName(wireSlot.segments[0].teamMemberId);

    if (isFourHandsRequest) {
      // No real Square appointment for this path — the Square customer/contact was already
      // found-or-created in /api/booking/customer. Just alert the team.
      bookingId = `four-hand-request-${randomUUID()}`;
      bookingStatus = "requested";
      // Neither price nor a specific artist is confirmed yet — staff calls to work both out
      // (see notifyFourHandRequest below), matching mani's own four-hand contact record.
      bookingPriceCents = null;
      bookingArtistName = null;
      await notifyFourHandRequest({
        customerName: wireContact ? `${wireContact.givenName ?? ""} ${wireContact.familyName ?? ""}`.trim() : undefined,
        phoneNumber: wireContact?.phoneNumber,
        preferredStartAt: wireSlot.startAt,
      });
      await notifyFourHandRequestSms({
        givenName: wireContact?.givenName,
        phoneNumber: wireContact?.phoneNumber,
        preferredStartAt: wireSlot.startAt,
      });
    } else {
      const created = await createBooking({
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
      bookingId = created.bookingId;
      bookingStatus = created.status ?? "ACCEPTED";
      bookingPriceCents = await computeBookingPriceCents(wireSlot.segments, addOnVariationIds);
      bookingArtistName = technicianName;
    }

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

    if (wireContact?.givenName && wireContact?.phoneNumber) {
      await linkContactToBooking({
        givenName: wireContact.givenName,
        phoneNumber: wireContact.phoneNumber,
        emailAddress: wireContact.emailAddress ?? null,
        smsConsent: Boolean(smsOptIn),
        squareCustomerId: customerId,
        squareBookingId: bookingId,
        bookingStatus,
        bookingStartAt: wireSlot.startAt,
        bookingServiceName: serviceName ?? "Unknown service",
        bookingPriceCents,
        bookingArtistName,
        submissionType: isFourHandsRequest ? "four_hand_request" : "booking",
        visitorId: identity.visitorId,
        landingPageId: identity.landingPageId ?? (await getDefaultLandingPageId()),
        variantId: identity.variantId,
      });
    }

    return NextResponse.json({ bookingId, technicianName });
  } catch (err) {
    console.error("Failed to create booking", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 502 });
  }
}
