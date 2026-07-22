"use client";

import { useEffect, useState } from "react";
import { LOCATION } from "@/lib/siteData";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import StarIcon from "@/components/icons/StarIcon";
import type { SelectedService, TechnicianRef, WireSlot } from "../types";
import type { BookingFlow } from "../useBookingFlow";

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

interface TaggedSlot {
  slot: WireSlot;
  /** Only set in "any tech" mode when more than one technician was actually searched — omitted
   * in specific-tech mode since the filter above already makes that clear. */
  technicianName?: string;
}

interface TechInfo {
  name: string;
  /** Derived from the raw Square variation name (e.g. "Top Nail Artist" vs "Nail Artist") rather
   * than hardcoded by person — so this keeps working unchanged whenever a new technician joins
   * under either tier. */
  isTop: boolean;
}

function variationIdsFor(selectedServices: SelectedService[], techId?: string): string {
  return selectedServices
    .map((sel) => {
      if (!techId || sel.service.variations.length <= 1) return sel.variation.variationId;
      const matched = sel.service.variations.find((v) => v.technicians?.some((t) => t.id === techId));
      return matched ? matched.variationId : sel.variation.variationId;
    })
    .join(",");
}

/** What the visit would cost if this specific technician did every tiered service in it — used
 * by the filter chips so the price difference between technicians is obvious up front, not just
 * discoverable by scrolling the merged time list. Independent of the current (possibly stale
 * once a different technician's been picked before) `sel.variation` — always recomputed fresh
 * from each service's own variation list. */
function totalForTech(selectedServices: SelectedService[], techId: string): number {
  return selectedServices.reduce((sum, sel) => {
    const addOnCents = sel.addOns.reduce((s2, a) => s2 + (a.variations[0]?.priceCents ?? 0), 0);
    const variationCents =
      sel.service.variations.length > 1
        ? (sel.service.variations.find((v) => v.technicians?.some((t) => t.id === techId))?.priceCents ??
          sel.variation.priceCents)
        : sel.variation.priceCents;
    return sum + variationCents + addOnCents;
  }, 0);
}

/** Every currently-selected variation Square explicitly restricts to specific technicians, other
 * than the main service's own tiering (that's handled separately — tiering *is* the technician
 * choice, not an extra constraint on top of it): a single-variation main service, or any selected
 * add-on, that Square's catalog assigns to specific people rather than leaving unrestricted. Used
 * to narrow "Choose your nail tech" down to people who can actually perform everything the
 * visitor picked — e.g. a nail-art add-on only some technicians are assigned to do — not just the
 * main tiered service. A variation with no restriction (technicians undefined/empty) doesn't
 * narrow anything; only an explicit, non-empty assignment does. */
function restrictions(selectedServices: SelectedService[]): TechnicianRef[][] {
  const result: TechnicianRef[][] = [];
  for (const sel of selectedServices) {
    if (sel.service.variations.length <= 1 && sel.variation.technicians?.length) {
      result.push(sel.variation.technicians);
    }
    for (const addOn of sel.addOns) {
      const restriction = addOn.variations[0]?.technicians;
      if (restriction?.length) result.push(restriction);
    }
  }
  return result;
}

function chipClasses(active: boolean): string {
  return `rounded-[var(--radius-pill)] px-3.5 py-2 text-sm font-medium transition-colors ${
    active
      ? "bg-[var(--color-accent)] text-white"
      : "bg-[var(--color-card)] text-[var(--color-ink)] ring-1 ring-[var(--color-border)] hover:ring-[var(--color-accent)]"
  }`;
}

// A read (this is a GET, safe to repeat) — 2 retries absorb a transient blip before the visitor
// ever sees anything go wrong. See lib/fetchWithTimeout.ts for why this exists at all.
async function fetchSlots(variationIds: string, teamMemberId?: string): Promise<WireSlot[]> {
  const params = new URLSearchParams({ variationIds });
  if (teamMemberId) params.set("teamMemberId", teamMemberId);
  const res = await fetchWithTimeout(`/api/booking/availability?${params.toString()}`, { retries: 2 });
  if (!res.ok) throw new Error(`Failed to load availability (${res.status})`);
  const data = await res.json();
  return data.slots ?? [];
}

export default function DateTimeStep({ flow }: { flow: BookingFlow }) {
  const [taggedSlots, setTaggedSlots] = useState<TaggedSlot[] | null>(null);
  const [error, setError] = useState(false);
  const [showTechInfo, setShowTechInfo] = useState(false);
  const { selectedServices, selectedTechId } = flow.state;

  // Distinct named technicians across every currently-selected service — a tiered service
  // contributes every one of its tiers' names (that's the actual point of "choose your nail
  // tech" for them); a single-variation service contributes its own assigned technician(s), if
  // Square restricts it to specific people (e.g. only one technician does Japanese manicures) —
  // a returning visitor who already knows who they want should see that name even for a service
  // that was never "tiered" in the pricing sense. Scales to however many real technicians the
  // catalog resolves (see lib/square/catalog.ts), not hardcoded to any fixed count.
  const techs = new Map<string, TechInfo>();
  for (const sel of selectedServices) {
    const variationsToCheck = sel.service.variations.length > 1 ? sel.service.variations : [sel.variation];
    for (const v of variationsToCheck) {
      const isTop = /top/i.test(v.name);
      for (const tech of v.technicians ?? []) {
        const existing = techs.get(tech.id);
        techs.set(tech.id, { name: tech.name, isTop: existing?.isTop || isTop });
      }
    }
  }
  // Narrow to technicians who can also perform every restricted add-on (or restricted
  // single-variation main service) currently selected — someone who can't do a picked nail-art
  // design shouldn't be offered as a choice at all, not just fail silently later.
  for (const restriction of restrictions(selectedServices)) {
    const allowedIds = new Set(restriction.map((t) => t.id));
    for (const id of [...techs.keys()]) {
      if (!allowedIds.has(id)) techs.delete(id);
    }
  }
  // Shown even for exactly one name — a service only one technician is assigned to still
  // deserves to say so on this screen, not just when there's an actual choice to make.
  const showTechFilter = techs.size >= 1;
  // Only worth explaining the tier difference when the currently-selected techs actually differ
  // by tier — a future all-regular or all-top staff wouldn't show a confusing, pointless link.
  const hasMixedTiers =
    [...techs.values()].some((t) => t.isTop) && [...techs.values()].some((t) => !t.isTop);
  const isAnyMode = selectedTechId === null && showTechFilter;
  const serviceItemIds = selectedServices
    .map((sel) => sel.service.itemId)
    .sort()
    .join(",");

  // If a previously-picked technician can no longer perform everything currently selected (the
  // visitor went back and added something only some technicians are assigned to do), fall back to
  // "Any" instead of searching for someone no longer eligible and showing "no openings". This
  // component remounts fresh every time DateTimeStep is (re-)entered, so a mount-only check is
  // enough — selectedTechId is the one piece of state that can carry over from before.
  useEffect(() => {
    if (selectedTechId !== null && !techs.has(selectedTechId)) {
      flow.setTech(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedServices.length === 0) return;
    let cancelled = false;

    async function load() {
      try {
        let results: TaggedSlot[];
        if (isAnyMode) {
          // teamMemberId is required here, not just the variation — two technicians can now
          // share the same price tier (variation), so without it Square would merge both
          // people's slots into one search with no way to tell whose is whose.
          //
          // allSettled, not all: one technician's search failing (even after fetchWithTimeout's
          // own retries) shouldn't blank out everyone else's real, available times — only fail
          // outright if every single technician's search failed.
          const settled = await Promise.allSettled(
            [...techs.entries()].map(async ([techId, info]) => {
              const slots = await fetchSlots(variationIdsFor(selectedServices, techId), techId);
              return slots.map((slot): TaggedSlot => ({ slot, technicianName: info.name }));
            }),
          );
          results = [];
          let anyFulfilled = false;
          for (const outcome of settled) {
            if (outcome.status === "fulfilled") {
              anyFulfilled = true;
              results.push(...outcome.value);
            }
          }
          if (!anyFulfilled) throw new Error("Every technician's availability search failed");
        } else {
          const slots = await fetchSlots(
            variationIdsFor(selectedServices, selectedTechId ?? undefined),
            selectedTechId ?? undefined,
          );
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

  /** "Which nail tech does the work" as a filter right here, rather than a separate step before
   * this one — one screen instead of two, and the price difference between technicians is right
   * next to the choice instead of hidden behind a name-only picker. A star marks the Top tier
   * and a collapsed-by-default link explains why, so the reason for the price gap is one tap
   * away without adding permanent weight to an already busy screen. A soft gradient divider below
   * separates this block from the time-slot list beneath it. */
  function renderTechFilter() {
    if (!showTechFilter) return null;
    // Exactly one eligible technician isn't a real choice to offer as "Any" vs. their name (both
    // produce the same result) — just say who does this service, so a returning visitor who
    // already knows who they want sees it confirmed right away.
    const onlyTech = techs.size === 1 ? [...techs.values()][0] : null;
    return (
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-2)]">Nail tech</p>
        {onlyTech ? (
          <p className="text-sm text-[var(--color-ink)]">
            <span className="inline-flex items-center gap-1 font-medium">
              {onlyTech.isTop && <StarIcon size={11} />}
              {onlyTech.name}
            </span>{" "}
            <span className="text-[var(--color-muted)]">does this service.</span>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => flow.setTech(null)} className={chipClasses(selectedTechId === null)}>
              Any nail tech
            </button>
            {[...techs.entries()].map(([id, info]) => (
              <button key={id} type="button" onClick={() => flow.setTech(id)} className={chipClasses(selectedTechId === id)}>
                <span className="inline-flex items-center gap-1">
                  {info.isTop && <StarIcon size={11} />}
                  {info.name}
                </span>{" "}
                · {formatPrice(totalForTech(selectedServices, id))}
              </button>
            ))}
          </div>
        )}
        {hasMixedTiers && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowTechInfo((v) => !v)}
              className="text-xs text-[var(--color-accent)] underline underline-offset-2"
            >
              What&apos;s the difference? <span aria-hidden>{showTechInfo ? "︿" : "⌄"}</span>
            </button>
            {showTechInfo && (
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-muted)]">
                <span className="inline-flex items-center gap-1 font-medium text-[var(--color-ink)]">
                  <StarIcon size={10} /> Top Nail Artist
                </span>{" "}
                has 2+ years of experience and typically finishes this service in about 2 hours. A Nail Artist
                gives the same great result in about 2.5–3 hours.
              </p>
            )}
          </div>
        )}
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
      </div>
    );
  }

  if (!taggedSlots) {
    return (
      <div>
        <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
          Choose a time
        </h3>
        <button type="button" onClick={() => flow.goTo("services")} className="mt-1 text-xs text-[var(--color-accent)] underline">
          Back to services
        </button>
        {renderTechFilter()}
        <p className="mt-4 text-sm text-[var(--color-muted)]">Loading available times…</p>
      </div>
    );
  }

  if (error || taggedSlots.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
          Choose a time
        </h3>
        <button type="button" onClick={() => flow.goTo("services")} className="mt-1 text-xs text-[var(--color-accent)] underline">
          Back to services
        </button>
        {renderTechFilter()}
        <div className="mt-4 rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-5 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-card)] text-xl" aria-hidden>
            📅
          </div>
          <p className="mt-3 text-sm font-medium text-[var(--color-ink)]">
            {error ? "Couldn't load availability right now" : "No openings for this combination in the next few weeks"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {showTechFilter && selectedTechId !== null
              ? "Try “Any nail tech”, or give us a call and we'll find a time that works for you."
              : "Try removing a service, or give us a call and we'll find a time that works for you."}
          </p>
          <a
            href={LOCATION.phoneHref}
            className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-base font-medium text-white hover:bg-[var(--color-accent-hover)]"
          >
            📞 Call {LOCATION.phone}
          </a>
        </div>
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
      {renderTechFilter()}
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
