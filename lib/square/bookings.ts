import { randomUUID } from "crypto";
import { getSquareClient, locationId } from "./client";
import type { AvailableSlot } from "./availability";

export interface CreateBookingInput {
  customerId: string;
  slot: AvailableSlot;
  addOnVariationIds?: string[];
  customerNote?: string;
}

export async function createBooking(input: CreateBookingInput): Promise<string> {
  const client = getSquareClient();

  const appointmentSegments = [
    {
      durationMinutes: input.slot.durationMinutes,
      serviceVariationId: input.slot.serviceVariationId,
      serviceVariationVersion: input.slot.serviceVariationVersion,
      teamMemberId: input.slot.teamMemberId,
    },
    ...(input.addOnVariationIds ?? []).map((variationId) => ({
      durationMinutes: 0,
      serviceVariationId: variationId,
      teamMemberId: input.slot.teamMemberId,
    })),
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
  return response.booking.id;
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
