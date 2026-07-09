/**
 * This app's booking-flow step order/labels, for booking-funnel tracking
 * (see marketing.funnel_events, shared with mani and salaryReview). Differently-shaped booking
 * flows — this one asks for contact info last; mani asks first — don't need to share step names,
 * just this {flowKey, steps} shape, so the dashboard can compare them by relative position
 * instead of by step name. Adding a step here later needs no backend/dashboard change —
 * step_index and step_count_total are derived from this list at send time.
 */
export const BOOKING_FLOW = {
  flowKey: "homepage_booking_v1",
  steps: ["services", "addons", "datetime", "details"] as const,
};

export type BookingFlowStep = (typeof BOOKING_FLOW.steps)[number];
