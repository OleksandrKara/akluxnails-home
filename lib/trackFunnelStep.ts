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
