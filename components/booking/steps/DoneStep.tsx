"use client";

import type { BookingFlow } from "../useBookingFlow";

export default function DoneStep({ flow, onClose }: { flow: BookingFlow; onClose: () => void }) {
  const { slot } = flow.state;

  return (
    <div className="text-center">
      <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        You&apos;re booked!
      </h3>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        {slot && `See you ${new Date(slot.startAt).toLocaleString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}.`}{" "}
        We&apos;ll text or email you a confirmation shortly.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
      >
        Done
      </button>
    </div>
  );
}
