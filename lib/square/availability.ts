import { getSquareClient, locationId } from "./client";

export interface SlotSegment {
  teamMemberId: string;
  serviceVariationId: string;
  serviceVariationVersion: bigint;
  durationMinutes: number;
}

export interface AvailableSlot {
  startAt: string;
  segments: SlotSegment[];
}

/**
 * Searches availability for one or more service variations together — Square's own API supports
 * multi-segment search natively (one segment_filter per service), returning slots where every
 * segment is covered by a mutually-available team member back-to-back. This is how a visitor
 * booking, say, a manicure + pedicure in one visit gets a single real appointment instead of two
 * separately-booked ones.
 */
export async function searchAvailability(
  serviceVariationIds: string[],
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
        segmentFilters: serviceVariationIds.map((serviceVariationId) => ({ serviceVariationId })),
      },
    },
  });

  const slots: AvailableSlot[] = [];
  for (const availability of response.availabilities ?? []) {
    if (!availability.startAt || !availability.appointmentSegments?.length) continue;
    const segments: SlotSegment[] = [];
    for (const segment of availability.appointmentSegments) {
      if (!segment.teamMemberId || !segment.serviceVariationId) {
        segments.length = 0;
        break;
      }
      segments.push({
        teamMemberId: segment.teamMemberId,
        serviceVariationId: segment.serviceVariationId,
        serviceVariationVersion: segment.serviceVariationVersion ?? BigInt(0),
        durationMinutes: segment.durationMinutes ?? 60,
      });
    }
    if (segments.length === serviceVariationIds.length) {
      slots.push({ startAt: availability.startAt, segments });
    }
  }
  return slots;
}
