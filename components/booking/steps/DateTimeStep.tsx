"use client";

import { useEffect, useState } from "react";
import type { WireSlot } from "../types";
import type { BookingFlow } from "../useBookingFlow";

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function DateTimeStep({ flow }: { flow: BookingFlow }) {
  const [slots, setSlots] = useState<WireSlot[] | null>(null);
  const [error, setError] = useState(false);
  const variationIds = flow.state.selectedServices.map((sel) => sel.variation.variationId).join(",");

  useEffect(() => {
    if (!variationIds) return;
    let cancelled = false;
    fetch(`/api/booking/availability?variationIds=${encodeURIComponent(variationIds)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      setSlots(null);
    };
  }, [variationIds]);

  if (error) {
    return <p className="text-sm text-[var(--color-muted)]">Couldn&apos;t load availability. Please try again shortly.</p>;
  }
  if (!slots) {
    return <p className="text-sm text-[var(--color-muted)]">Loading available times…</p>;
  }
  if (slots.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">No openings in the next few weeks — please call us to book.</p>;
  }

  const byDay = new Map<string, WireSlot[]>();
  for (const slot of slots) {
    const day = formatDay(slot.startAt);
    byDay.set(day, [...(byDay.get(day) ?? []), slot]);
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        Choose a time
      </h3>
      <button type="button" onClick={() => flow.goTo("services")} className="mt-1 text-xs text-[var(--color-accent)] underline">
        Back to services
      </button>
      <div className="mt-4 max-h-96 space-y-4 overflow-y-auto">
        {[...byDay.entries()].map(([day, daySlots]) => (
          <div key={day}>
            <h4 className="text-sm font-semibold text-[var(--color-muted-2)]">{day}</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {daySlots.map((slot) => (
                <button
                  key={slot.startAt + slot.segments[0]?.teamMemberId}
                  type="button"
                  onClick={() => flow.selectSlot(slot)}
                  className="rounded-[var(--radius-pill)] px-3 py-1.5 text-sm ring-1 ring-[var(--color-border)] hover:bg-[var(--color-accent-tint-2)]"
                >
                  {formatTime(slot.startAt)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
