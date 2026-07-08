"use client";

import type { BookingFlow } from "../useBookingFlow";
import { googleCalendarUrl, icsDataUrl } from "../calendarLinks";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DoneStep({ flow, onClose }: { flow: BookingFlow; onClose: () => void }) {
  const { service, variation, addOns, slot, technicianName } = flow.state;
  if (!service || !variation || !slot) return null;

  const title = `${service.name} at AK.LUX.NAILS`;
  const description = [
    `${service.name} (${variation.name})`,
    ...addOns.map((a) => `+ ${a.name}`),
    technicianName ? `With ${technicianName}` : null,
    `Total: ${formatPrice(flow.totalCents)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const calendarEvent = { title, startAt: slot.startAt, durationMinutes: slot.durationMinutes, description };

  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success-bg)] text-2xl text-[var(--color-success)]">
        ✓
      </div>
      <h3 className="mt-3 text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        You&apos;re booked!
      </h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">We&apos;ll text or email you a confirmation shortly.</p>

      <dl className="mt-5 space-y-2 rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-4 text-left text-sm">
        <div className="flex justify-between">
          <dt className="text-[var(--color-muted)]">Service</dt>
          <dd className="text-[var(--color-ink)]">
            {service.name} ({variation.name})
          </dd>
        </div>
        {addOns.map((a) => (
          <div key={a.itemId} className="flex justify-between">
            <dt className="text-[var(--color-muted)]">Add-on</dt>
            <dd className="text-[var(--color-ink)]">{a.name}</dd>
          </div>
        ))}
        {technicianName && (
          <div className="flex justify-between">
            <dt className="text-[var(--color-muted)]">With</dt>
            <dd className="text-[var(--color-ink)]">{technicianName}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-[var(--color-muted)]">When</dt>
          <dd className="text-[var(--color-ink)]">{formatDateTime(slot.startAt)}</dd>
        </div>
        <div className="flex justify-between border-t border-[var(--color-accent-border-soft)] pt-2 font-semibold">
          <dt className="text-[var(--color-ink)]">Total</dt>
          <dd className="text-[var(--color-ink)]">{formatPrice(flow.totalCents)}</dd>
        </div>
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <a
          href={googleCalendarUrl(calendarEvent)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[var(--radius-pill)] px-4 py-2.5 text-center text-sm font-medium ring-1 ring-[var(--color-border)] hover:bg-[var(--color-accent-tint-2)]"
        >
          Add to Google Calendar
        </a>
        <a
          href={icsDataUrl(calendarEvent)}
          download="appointment.ics"
          className="rounded-[var(--radius-pill)] px-4 py-2.5 text-center text-sm font-medium ring-1 ring-[var(--color-border)] hover:bg-[var(--color-accent-tint-2)]"
        >
          Add to Calendar (.ics)
        </a>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-4 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
      >
        Done
      </button>
    </div>
  );
}
