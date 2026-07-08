import { getSquareClient, locationId } from "./client";

export interface AvailableSlot {
  startAt: string;
  teamMemberId: string;
  serviceVariationId: string;
  serviceVariationVersion: bigint;
  durationMinutes: number;
}

/**
 * Searches availability for a single service variation, letting any qualified team member fill
 * the slot (no team_member_id_filter) — the resolved team member for each slot comes back on the
 * availability itself and is what gets passed straight through to booking creation.
 */
export async function searchAvailability(
  serviceVariationId: string,
  daysAhead = 21,
): Promise<AvailableSlot[]> {
  const client = getSquareClient();
  const now = new Date();
  const end = new Date(now.getTime() + daysAhead * 24 * 3600 * 1000);

  const response = await client.bookings.searchAvailability({
    query: {
      filter: {
        startAtRange: {
          startAt: now.toISOString(),
          endAt: end.toISOString(),
        },
        locationId: locationId(),
        segmentFilters: [{ serviceVariationId }],
      },
    },
  });

  const slots: AvailableSlot[] = [];
  for (const availability of response.availabilities ?? []) {
    const segment = availability.appointmentSegments?.[0];
    if (!availability.startAt || !segment?.teamMemberId || !segment.serviceVariationId) continue;
    slots.push({
      startAt: availability.startAt,
      teamMemberId: segment.teamMemberId,
      serviceVariationId: segment.serviceVariationId,
      serviceVariationVersion: segment.serviceVariationVersion ?? BigInt(0),
      durationMinutes: segment.durationMinutes ?? 60,
    });
  }
  return slots;
}
