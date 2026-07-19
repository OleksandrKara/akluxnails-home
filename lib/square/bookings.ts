import { randomUUID } from "crypto";
import { getSquareClient, locationId } from "./client";
import type { AvailableSlot } from "./availability";
import { getServiceVariation } from "./catalog";

export interface CreateBookingInput {
  customerId: string;
  slot: AvailableSlot;
  addOnVariationIds?: string[];
  customerNote?: string;
}

export interface CreatedBooking {
  bookingId: string;
  /** Square's own appointment status (e.g. "ACCEPTED") — surfaced so callers (marketing.contacts
   * writes) don't have to guess/hardcode it. */
  status: string | null;
}

export async function createBooking(input: CreateBookingInput): Promise<CreatedBooking> {
  const client = getSquareClient();
  const primaryTeamMemberId = input.slot.segments[0]?.teamMemberId;

  // Square requires service_variation_version on every appointment segment, add-ons included —
  // the client only sends add-on variation ids (see ServicesStep/AddOnsStep), so the current
  // catalog version has to be resolved here rather than trusted from the client anyway.
  const addOnSegments = await Promise.all(
    (input.addOnVariationIds ?? []).map(async (variationId) => {
      const resolved = await getServiceVariation(variationId);
      if (!resolved) throw new Error(`Add-on variation ${variationId} not found in catalog`);
      return {
        durationMinutes: 0,
        serviceVariationId: variationId,
        serviceVariationVersion: resolved.variation.variationVersion,
        teamMemberId: primaryTeamMemberId,
      };
    }),
  );

  const appointmentSegments = [
    ...input.slot.segments.map((segment) => ({
      durationMinutes: segment.durationMinutes,
      serviceVariationId: segment.serviceVariationId,
      serviceVariationVersion: segment.serviceVariationVersion,
      teamMemberId: segment.teamMemberId,
    })),
    ...addOnSegments,
  ];

  const response = await client.bookings.create({
    idempotencyKey: randomUUID(),
    booking: {
      startAt: input.slot.startAt,
      locationId: locationId(),
      customerId: input.customerId,
      customerNote: input.customerNote,
      appointmentSegments,
    },
  });

  if (!response.booking?.id) {
    throw new Error("Square did not return a booking id");
  }
  return { bookingId: response.booking.id, status: response.booking.status ?? null };
}

/** Best-effort display name for the confirmation screen — never blocks booking success on this. */
export async function getTeamMemberName(teamMemberId: string): Promise<string | null> {
  try {
    const client = getSquareClient();
    const response = await client.teamMembers.get({ teamMemberId });
    const givenName = response.teamMember?.givenName;
    return givenName ?? null;
  } catch (err) {
    console.error("Failed to look up team member name", err);
    return null;
  }
}
