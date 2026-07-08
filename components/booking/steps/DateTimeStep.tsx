"use client";

import { useEffect, useState } from "react";
import { LOCATION } from "@/lib/siteData";
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

  if (!slots) {
    return <p className="text-sm text-[var(--color-muted)]">Loading available times…</p>;
  }
  if (error || slots.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-5 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-card)] text-xl" aria-hidden>
          📅
        </div>
        <p className="mt-3 text-sm font-medium text-[var(--color-ink)]">
          {error ? "Couldn't load availability right now" : "No openings for this combination in the next few weeks"}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Try removing a service, or give us a call and we&apos;ll find a time that works for you.
        </p>
        <a
          href={LOCATION.phoneHref}
          className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-base font-medium text-white hover:bg-[var(--color-accent-hover)]"
        >
          📞 Call {LOCATION.phone}
        </a>
        <button
          type="button"
          onClick={() => flow.goTo("services")}
          className="mt-3 block w-full text-xs text-[var(--color-accent)] underline"
        >
          Back to services
        </button>
      </div>
    );
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
