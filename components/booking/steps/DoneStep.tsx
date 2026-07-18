"use client";

import type { BookingFlow } from "../useBookingFlow";
import { googleCalendarUrl, icsDataUrl } from "../calendarLinks";
import { FOUR_HANDS_REQUEST_ITEM_NAME } from "@/lib/services-config";

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

function GoogleCalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

function CalendarDownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 2.5v3.5M16 2.5v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 12v5m0 0l-2.2-2.2M12 17l2.2-2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DoneStep({ flow, onClose }: { flow: BookingFlow; onClose: () => void }) {
  const { selectedServices, slot, technicianName } = flow.state;
  if (selectedServices.length === 0 || !slot) return null;

  const isFourHandsRequest =
    selectedServices.length === 1 && selectedServices[0].service.name === FOUR_HANDS_REQUEST_ITEM_NAME;

  const title = isFourHandsRequest
    ? "4-Hand Appointment Request at AK.LUX.NAILS"
    : `${selectedServices.map((sel) => sel.service.name).join(" + ")} at AK.LUX.NAILS`;
  const description = [
    ...selectedServices.map((sel) => `${sel.service.name} (${sel.variation.name})`),
    ...selectedServices.flatMap((sel) => sel.addOns.map((a) => `+ ${a.name}`)),
    technicianName ? `With ${technicianName}` : null,
    isFourHandsRequest ? null : `Total: ${formatPrice(flow.totalCents)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const totalDurationMinutes = slot.segments.reduce((sum, seg) => sum + seg.durationMinutes, 0);
  const calendarEvent = { title, startAt: slot.startAt, durationMinutes: totalDurationMinutes || 60, description };

  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success-bg)] text-2xl text-[var(--color-success)]">
        ✓
      </div>
      <h3 className="mt-3 text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        {isFourHandsRequest ? "Request received!" : "You're booked!"}
      </h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {isFourHandsRequest
          ? "We'll contact you to confirm the exact time works for two technicians."
          : "We'll text or email you a confirmation shortly."}
      </p>

      <dl className="mt-5 space-y-2 rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-4 text-left text-sm">
        {selectedServices.map((sel) => (
          <div key={sel.service.itemId}>
            <div className="flex justify-between">
              <dt className="text-[var(--color-muted)]">Service</dt>
              <dd className="text-[var(--color-ink)]">
                {sel.service.name} ({sel.variation.name})
              </dd>
            </div>
            {sel.addOns.map((a) => (
              <div key={a.itemId} className="flex justify-between">
                <dt className="text-[var(--color-muted)]">Add-on</dt>
                <dd className="text-[var(--color-ink)]">{a.name}</dd>
              </div>
            ))}
          </div>
        ))}
        {technicianName && (
          <div className="flex justify-between">
            <dt className="text-[var(--color-muted)]">With</dt>
            <dd className="text-[var(--color-ink)]">{technicianName}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-[var(--color-muted)]">{isFourHandsRequest ? "Preferred time" : "When"}</dt>
          <dd className="text-[var(--color-ink)]">{formatDateTime(slot.startAt)}</dd>
        </div>
        {!isFourHandsRequest && (
          <div className="flex justify-between border-t border-[var(--color-accent-border-soft)] pt-2 font-semibold">
            <dt className="text-[var(--color-ink)]">Total</dt>
            <dd className="text-[var(--color-ink)]">{formatPrice(flow.totalCents)}</dd>
          </div>
        )}
      </dl>

      {!isFourHandsRequest && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <a
            href={googleCalendarUrl(calendarEvent)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] shadow-sm ring-1 ring-[var(--color-border)] transition hover:shadow-md"
          >
            <GoogleCalendarIcon />
            Google Calendar
          </a>
          <a
            href={icsDataUrl(calendarEvent)}
            download="appointment.ics"
            className="flex items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] shadow-sm ring-1 ring-[var(--color-border)] transition hover:shadow-md"
          >
            <CalendarDownloadIcon />
            Download .ics
          </a>
        </div>
      )}

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
