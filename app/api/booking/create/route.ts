import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createBooking, getTeamMemberName } from "@/lib/square/bookings";
import { getServiceVariation } from "@/lib/square/catalog";
import { resolveBookingIdentity } from "@/lib/bookingIdentity";
import { recordEvent } from "@/lib/tracking";
import { notifyFourHandRequest } from "@/lib/telegram";
import { notifyFourHandRequestSms } from "@/lib/sms";
import { FOUR_HANDS_DISPLAY_PRICE_CENTS, FOUR_HANDS_REQUEST_ITEM_NAME } from "@/lib/services-config";
import { linkContactToBooking } from "@/lib/marketingContacts";
import { getDefaultLandingPageId } from "@/lib/variant";
import { verifyRebookingPromoSignature } from "@/lib/rebookingPromo";
import { enrollRebookingPromo } from "@/lib/rebookingPromoEnroll";

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

interface WirePromo {
  code: string;
  expEpochSeconds: number;
  signature: string;
}

/** Staff-facing note on the Square Booking for a promo-flagged appointment — the discount itself
 * auto-applies via a Square CatalogPricingRule scoped to a customer group (see
 * openspec/changes/same-day-rebooking-discount design.md D7 and
 * openspec/changes/lapsed-customer-winback-automation design.md D9); this note exists purely so
 * staff don't ALSO apply the old manual "Same day rebooking discount," which would stack the
 * discounts. */
const REBOOKING_PROMO_SELLER_NOTES: Record<string, string> = {
  REBOOK10:
    "🎁 Same-day rebooking promo — the $10 discount auto-applies at checkout (min. $99 order). " +
    "Do NOT also apply the manual 'Same day rebooking discount' or the customer gets $20 off, not $10.",
  WINBACK5:
    "🎁 Win-back promo — the $5 discount auto-applies at checkout (min. $99 order). " +
    "Do NOT also apply the manual 'Same day rebooking discount' on top of it.",
};

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
  const { customerId, slot, addOnVariationIds, customerNote, serviceName, contact, smsOptIn, promo } = body ?? {};
  const wireSlot = slot as WireSlot | undefined;
  const wireContact = contact as WireContact | undefined;
  const wirePromo = promo as WirePromo | null | undefined;
  if (!customerId || !wireSlot?.startAt || !wireSlot.segments?.length) {
    return NextResponse.json({ error: "customerId and slot are required" }, { status: 400 });
  }

  // Re-derived server-side from the catalog item name (this app's existing convention for
  // identifying the 4-hand placeholder — see lib/services-config.ts) rather than trusting a
  // client-sent boolean directly. Worst case if a client lied about serviceName: a spammy lead +
  // a Telegram ping, no real Square appointment — strictly less than today's behavior, where
  // card/cancellation gating is already client-side only.
  const isFourHandsRequest = serviceName === FOUR_HANDS_REQUEST_ITEM_NAME;

  // Independently re-verified here — never trusts that the client's own page render or
  // BookingModalProvider already checked this (a caller could hit this API directly with a
  // hand-crafted request) — see openspec/changes/same-day-rebooking-discount design.md D8.
  const promoValid =
    !isFourHandsRequest &&
    Boolean(wirePromo) &&
    verifyRebookingPromoSignature(wirePromo!.code, wirePromo!.expEpochSeconds, wirePromo!.signature) &&
    wirePromo!.expEpochSeconds * 1000 > Date.now();

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
        estimatedPrice: FOUR_HANDS_DISPLAY_PRICE_CENTS / 100,
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
        sellerNote: promoValid ? REBOOKING_PROMO_SELLER_NOTES[wirePromo!.code] : undefined,
      });
      bookingId = created.bookingId;
      bookingStatus = created.status ?? "ACCEPTED";
      bookingPriceCents = await computeBookingPriceCents(wireSlot.segments, addOnVariationIds);
      bookingArtistName = technicianName;

      if (promoValid) {
        // Best-effort, doesn't block booking success either way — see design.md D7/D8.
        await enrollRebookingPromo({
          squareCustomerId: customerId,
          expEpochSeconds: wirePromo!.expEpochSeconds,
          signature: wirePromo!.signature,
          promoCode: wirePromo!.code,
          customerName: wireContact ? `${wireContact.givenName ?? ""} ${wireContact.familyName ?? ""}`.trim() : undefined,
          phoneNumber: wireContact?.phoneNumber,
          appointmentStartAt: wireSlot.startAt,
        });
      }
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
