"use client";

import { useEffect, useState } from "react";
import { LOCATION } from "@/lib/siteData";
import type { SelectedService, WireSlot } from "../types";
import type { BookingFlow } from "../useBookingFlow";

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

interface TaggedSlot {
  slot: WireSlot;
  /** Only set in "any tech" mode when more than one technician was actually searched — omitted
   * in specific-tech mode since the customer already picked that person one screen ago. */
  technicianName?: string;
}

function variationIdsFor(selectedServices: SelectedService[], techId?: string): string {
  return selectedServices
    .map((sel) => {
      if (!techId || sel.service.variations.length <= 1) return sel.variation.variationId;
      const matched = sel.service.variations.find((v) => v.technicianId === techId);
      return matched ? matched.variationId : sel.variation.variationId;
    })
    .join(",");
}

async function fetchSlots(variationIds: string): Promise<WireSlot[]> {
  const res = await fetch(`/api/booking/availability?variationIds=${encodeURIComponent(variationIds)}`);
  const data = await res.json();
  return data.slots ?? [];
}

export default function DateTimeStep({ flow }: { flow: BookingFlow }) {
  const [taggedSlots, setTaggedSlots] = useState<TaggedSlot[] | null>(null);
  const [error, setError] = useState(false);
  const { selectedServices, selectedTechId } = flow.state;

  // Distinct named technicians across the currently-selected tiered services — same computation
  // as TechStep. Only matters here for "any" mode: with more than one real technician, "any"
  // means searching every one of their calendars and merging the results.
  const techs = new Map<string, string>();
  for (const sel of selectedServices) {
    if (sel.service.variations.length <= 1) continue;
    for (const v of sel.service.variations) {
      if (v.technicianId && v.technicianName) techs.set(v.technicianId, v.technicianName);
    }
  }
  const isAnyMode = selectedTechId === null && techs.size > 1;
  const serviceItemIds = selectedServices
    .map((sel) => sel.service.itemId)
    .sort()
    .join(",");

  useEffect(() => {
    if (selectedServices.length === 0) return;
    let cancelled = false;

    async function load() {
      try {
        let results: TaggedSlot[];
        if (isAnyMode) {
          const combos = await Promise.all(
            [...techs.entries()].map(async ([techId, techName]) => {
              const slots = await fetchSlots(variationIdsFor(selectedServices, techId));
              return slots.map((slot) => ({ slot, technicianName: techName }));
            }),
          );
          results = combos.flat();
        } else {
          const slots = await fetchSlots(variationIdsFor(selectedServices));
          results = slots.map((slot) => ({ slot }));
        }
        results.sort((a, b) => a.slot.startAt.localeCompare(b.slot.startAt));
        if (!cancelled) setTaggedSlots(results);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
      setTaggedSlots(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTechId, serviceItemIds]);

  if (!taggedSlots) {
    return <p className="text-sm text-[var(--color-muted)]">Loading available times…</p>;
  }
  if (error || taggedSlots.length === 0) {
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

  const byDay = new Map<string, TaggedSlot[]>();
  for (const tagged of taggedSlots) {
    const day = formatDay(tagged.slot.startAt);
    byDay.set(day, [...(byDay.get(day) ?? []), tagged]);
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
              {daySlots.map((tagged) => (
                <button
                  key={tagged.slot.startAt + tagged.slot.segments[0]?.teamMemberId}
                  type="button"
                  onClick={() => flow.selectSlot(tagged.slot)}
                  className="rounded-[var(--radius-pill)] px-3 py-1.5 text-sm ring-1 ring-[var(--color-border)] hover:bg-[var(--color-accent-tint-2)]"
                >
                  {formatTime(tagged.slot.startAt)}
                  {tagged.technicianName && (
                    <span className="text-[var(--color-muted)]"> · {tagged.technicianName}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
