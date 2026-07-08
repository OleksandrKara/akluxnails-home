"use client";

import { useState } from "react";
import type { BookingFlow } from "../useBookingFlow";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ConfirmStep({ flow }: { flow: BookingFlow }) {
  const { service, variation, addOns, slot, contact, customerId } = flow.state;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    if (!customerId || !slot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          slot,
          addOnVariationIds: addOns.map((a) => a.variations[0]?.variationId).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      flow.bookingCreated(data.bookingId);
    } catch {
      setError("Something went wrong confirming your booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!service || !variation || !slot) return null;

  return (
    <div>
      <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        Review & confirm
      </h3>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-[var(--color-muted)]">Service</dt>
          <dd className="text-[var(--color-ink)]">
            {service.name} ({variation.name})
          </dd>
        </div>
        {addOns.map((a) => (
          <div key={a.itemId} className="flex justify-between">
            <dt className="text-[var(--color-muted)]">+ {a.name}</dt>
            <dd className="text-[var(--color-ink)]">{formatPrice(a.variations[0]?.priceCents ?? 0)}</dd>
          </div>
        ))}
        <div className="flex justify-between">
          <dt className="text-[var(--color-muted)]">When</dt>
          <dd className="text-[var(--color-ink)]">{formatDateTime(slot.startAt)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--color-muted)]">Contact</dt>
          <dd className="text-[var(--color-ink)]">
            {contact.givenName} {contact.familyName} · {contact.phoneNumber}
          </dd>
        </div>
        <div className="flex justify-between border-t border-[var(--color-border)] pt-2 font-semibold">
          <dt className="text-[var(--color-ink)]">Total</dt>
          <dd className="text-[var(--color-ink)]">{formatPrice(flow.totalCents)}</dd>
        </div>
      </dl>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={onConfirm}
        disabled={submitting}
        className="mt-6 w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
      >
        {submitting ? "Booking…" : "Confirm booking"}
      </button>
    </div>
  );
}
