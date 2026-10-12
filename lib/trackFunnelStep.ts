import { BOOKING_FLOW, type BookingFlowStep } from "@/lib/funnelFlow";

/** Fire-and-forget booking-funnel step event — see marketing.funnel_events. The caller is
 * responsible for deduping per modal session (see BookingModal.tsx's step effect), so
 * back-navigation to an already-visited step doesn't double count. */
export function trackFunnelStep(step: BookingFlowStep): void {
  try {
    navigator.sendBeacon?.(
      "/api/booking/funnel-event",
      JSON.stringify({
        flowKey: BOOKING_FLOW.flowKey,
        stepKey: step,
        stepIndex: BOOKING_FLOW.steps.indexOf(step),
        stepCountTotal: BOOKING_FLOW.steps.length,
      }),
    );
  } catch {
    // best-effort only — never block the booking flow on this
  }
}

/** What a visitor saw on the date/time step, recorded as an extra "datetime" funnel event with
 * metadata (Codex handoff task 2, 2026-10-12: most visitors leave between date/time and details,
 * and the step events alone don't say why). Non-personal numbers only. The funnel dashboard counts
 * distinct visitors per step, so this second "datetime" row doesn't change any count. */
export type AvailabilitySignal = {
  outcome: "ok" | "empty" | "failed";
  /** Open slots starting within the next 72 hours. */
  slotsNext3Days: number;
  /** Whole days from now to the first open slot; null when there are none. */
  daysToFirstSlot: number | null;
  totalSlots: number;
  technicianChosen: boolean;
  serviceCount: number;
};

export function trackAvailabilitySignal(signal: AvailabilitySignal): void {
  try {
    navigator.sendBeacon?.(
      "/api/booking/funnel-event",
      JSON.stringify({
        flowKey: BOOKING_FLOW.flowKey,
        stepKey: "datetime",
        stepIndex: BOOKING_FLOW.steps.indexOf("datetime"),
        stepCountTotal: BOOKING_FLOW.steps.length,
        signal,
      }),
    );
  } catch {
    // best-effort only
  }
}
