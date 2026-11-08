import { getSquareClient, locationId } from "./client";

const MANAGER_SHIFT_START_HOUR = 8;
const MANAGER_SHIFT_END_HOUR = 20;
const CONFIRMATION_GAP_MS = 2 * 3600 * 1000;

function laParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get("year"), m: get("month"), d: get("day"), h: get("hour") };
}

/** Los Angeles wall-clock time (hour 0-23) to a real instant, DST-safe. */
function laToInstant(y: number, m: number, d: number, h: number): Date {
  let guess = Date.UTC(y, m - 1, d, h);
  for (let i = 0; i < 2; i++) {
    const p = laParts(new Date(guess));
    guess += Date.UTC(y, m - 1, d, h) - Date.UTC(p.y, p.m - 1, p.d, p.h);
  }
  return new Date(guess);
}

/**
 * Managers work 08:00-20:00 PT. A booking made outside that shift may not start until two hours
 * after the next shift opens (10:00), so someone can confirm it with the technician (2026-11-08:
 * an overnight booking for 8:00 reached the technician only that morning). Bookings made during
 * the shift are unrestricted here; Square's own minimum lead time still applies.
 */
export function earliestBookableStart(now: Date): Date {
  const { y, m, d, h } = laParts(now);
  if (h >= MANAGER_SHIFT_START_HOUR && h < MANAGER_SHIFT_END_HOUR) return now;
  const nextDay = h >= MANAGER_SHIFT_END_HOUR ? 1 : 0;
  const base = new Date(Date.UTC(y, m - 1, d + nextDay));
  const opens = laToInstant(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), MANAGER_SHIFT_START_HOUR);
  return new Date(opens.getTime() + CONFIRMATION_GAP_MS);
}

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
 *
 * teamMemberId narrows every segment to one specific technician — needed now that a single
 * variation (price tier) can have more than one technician assigned (see lib/square/catalog.ts):
 * without this, searching "Nail Artist" would merge two different people's calendars into one
 * slot list with no way to tell whose slot is whose, or to show just one of them when the visitor
 * picked a specific person.
 */
export async function searchAvailability(
  serviceVariationIds: string[],
  // 30 days ahead — clients frequently rebook into next month, and 21 days was cutting that off
  // partway through (e.g. a visitor on Aug 27 only saw openings through ~Sep 17). Square's own
  // search_availability API hard-caps the query range at 32 days, so this stays safely under that.
  daysAhead = 30,
  teamMemberId?: string,
): Promise<AvailableSlot[]> {
  const client = getSquareClient();
  const now = new Date();
  const end = new Date(now.getTime() + daysAhead * 24 * 3600 * 1000);

  const response = await client.bookings.searchAvailability({
    query: {
      filter: {
        startAtRange: {
          startAt: earliestBookableStart(now).toISOString(),
          endAt: end.toISOString(),
        },
        locationId: locationId(),
        segmentFilters: serviceVariationIds.map((serviceVariationId) => ({
          serviceVariationId,
          teamMemberIdFilter: teamMemberId ? { any: [teamMemberId] } : undefined,
        })),
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
