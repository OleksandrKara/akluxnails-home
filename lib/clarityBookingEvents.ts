"use client";

import type { BookingFlowStep } from "@/lib/funnelFlow";

/** Fixed, non-personal event names make booking recordings filterable in Clarity. The site's
 * marketing funnel and Square attribution remain the source of truth for conversion counts. */
export type ClarityBookingEvent =
  | "booking_opened"
  | `booking_step_${BookingFlowStep}`
  | "booking_completed"
  | "four_hand_request_submitted"
  | "booking_submit_failed";

export function trackClarityBookingEvent(event: ClarityBookingEvent): void {
  try {
    (window as Window & { clarity?: (action: "event", name: string) => void }).clarity?.("event", event);
  } catch {
    // Analytics is best-effort and must never interrupt a booking.
  }
}
