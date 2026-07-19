"use client";

import { useEffect, useState } from "react";
import type { ServicesResponse, WireServiceItem } from "../types";
import type { BookingFlow } from "../useBookingFlow";
import { FOUR_HANDS_REQUEST_ITEM_NAME } from "@/lib/services-config";

// The full menu (6+ items across 4 groups) overwhelms a first-time visitor — most bookings are one
// of these four, so they're shown first with everything else a tap away via "Show more services".
// Order matches how the owner ranks them.
const TOP_SERVICE_NAMES = [
  "Russian Gel-Overlay Manicure",
  "Gel Nail Extension",
  "Regular Pedicure Gel-Overlay (Dry)",
  FOUR_HANDS_REQUEST_ITEM_NAME,
];

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function RemoveIcon({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Remove from booking"
      className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-red-50 hover:text-red-600"
    >
      ×
    </button>
  );
}

// A small filled badge reads as a clear "selected" signal at a glance — same visual language as
// the checkmark badges elsewhere in the booking flow (DoneStep, SecureAppointmentCard) — rather
// than a bare colored unicode character sitting inline with the text.
function SelectedCheck() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-bold text-white">
      ✓
    </span>
  );
}

/** Card container classes shared by all three row variants — one selected look (accent ring +
 * soft accent-tinted fill) instead of each variant drifting its own slightly different treatment. */
function cardClasses(selected: boolean): string {
  return `rounded-[var(--radius-lg)] ring-1 transition-colors ${
    selected ? "ring-2 ring-[var(--color-accent)] bg-[var(--color-accent-tint-2)]" : "ring-[var(--color-border)]"
  }`;
}

function dividerClasses(selected: boolean): string {
  return selected ? "border-[var(--color-accent-border-soft)]" : "border-[var(--color-border)]";
}

export default function ServicesStep({ flow }: { flow: BookingFlow }) {
  const [data, setData] = useState<ServicesResponse | null>(null);
  const [error, setError] = useState(false);
  const { selectedServices } = flow.state;
  // null = no explicit user choice yet — falls back to the derived default below. Once the
  // customer taps either toggle button, their choice sticks regardless of the derived default.
  const [manualShowAll, setManualShowAll] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/booking/services")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return <p className="text-sm text-[var(--color-muted)]">Couldn&apos;t load services. Please try again shortly.</p>;
  }
  if (!data) {
    return <p className="text-sm text-[var(--color-muted)]">Loading services…</p>;
  }

  /** Multi-tier services (e.g. "Nail Artist" vs "Top Nail Artist") represent which provider does
   * the work — once one selected service has picked a provider tier, every other tiered service
   * in the same visit must use the same one, since it's the same tech doing the whole visit.
   * Matched generically by variation name so it isn't hardcoded to specific service names. */
  function lockedTierName(forItemId: string): string | null {
    const other = selectedServices.find((sel) => sel.service.itemId !== forItemId && sel.service.variations.length > 1);
    return other?.variation.name ?? null;
  }

  /** Add-ons live on their own step next, shown only if at least one selected service belongs to
   * a group that actually has add-on options (e.g. skip it entirely for a Men's-only booking). */
  function onContinue() {
    const hasApplicableAddOns = data!.groups.some(
      (group) =>
        group.addOnGroups.length > 0 &&
        group.services.some((svc) => selectedServices.some((sel) => sel.service.itemId === svc.itemId)),
    );
    if (hasApplicableAddOns) {
      flow.proceedToAddOns();
    } else {
      flow.proceedToDateTime();
    }
  }

  /** One service row's markup — shared by the collapsed top-picks view and the full grouped view
   * so neither can drift out of sync with the other's selection/variation-picker/locked-tier
   * behavior. */
  function renderServiceRow(svc: WireServiceItem) {
    const selected = selectedServices.find((sel) => sel.service.itemId === svc.itemId);
    const isTiered = svc.variations.length > 1;
    const lock = isTiered ? lockedTierName(svc.itemId) : null;
    const lockedVariation = lock ? (svc.variations.find((v) => v.name === lock) ?? null) : null;

    // Locked by another already-selected tiered service in this visit — there's really only one
    // valid tier here (same provider does the whole visit), so this reads as a plain single-price
    // row rather than a radio choice with no real second option.
    if (isTiered && lockedVariation) {
      return (
        <div key={svc.itemId} className={cardClasses(Boolean(selected))}>
          <div className="flex w-full items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => (selected ? flow.removeService(svc.itemId) : flow.addService(svc, lockedVariation))}
              className="flex flex-1 items-center justify-between text-left"
            >
              <span className="flex items-center gap-2 font-medium text-[var(--color-ink)]">
                {selected && <SelectedCheck />}
                {svc.name}
              </span>
              <span className="text-sm font-medium text-[var(--color-muted)]">
                {formatPrice(lockedVariation.priceCents)}
              </span>
            </button>
            {selected && <RemoveIcon onClick={() => flow.removeService(svc.itemId)} />}
          </div>
          <p className={`border-t px-4 py-2 text-xs text-[var(--color-muted)] ${dividerClasses(Boolean(selected))}`}>
            {lock} — matched to your other service so the same provider does your whole visit.
          </p>
        </div>
      );
    }

    // A real tier choice (Nail Artist vs. Top Nail Artist, etc.) — shown as chip-style radio
    // buttons right under the service name, always visible rather than hidden behind a
    // tap-to-expand panel, so it's unambiguous on mobile that picking a provider is expected, not
    // an optional detail. Selected chip is a solid accent fill (not just a tinted ring) so it reads
    // unmistakably as "chosen" against the row's own softer selected background.
    if (isTiered) {
      return (
        <div key={svc.itemId} className={cardClasses(Boolean(selected))}>
          <div className="flex w-full items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 font-medium text-[var(--color-ink)]">
              {selected && <SelectedCheck />}
              {svc.name}
            </span>
            {selected && <RemoveIcon onClick={() => flow.removeService(svc.itemId)} />}
          </div>
          <div className={`border-t px-4 py-3 ${dividerClasses(Boolean(selected))}`}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-2)]">
              Choose your artist
            </p>
            <div className="flex flex-wrap gap-2">
              {svc.variations.map((v) => {
                const checked = selected?.variation.variationId === v.variationId;
                return (
                  <label
                    key={v.variationId}
                    className={`flex cursor-pointer items-center gap-1 rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium transition-colors ${
                      checked
                        ? "bg-[var(--color-accent)] text-white"
                        : "bg-[var(--color-card)] text-[var(--color-ink)] ring-1 ring-[var(--color-border)] hover:ring-[var(--color-accent)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`tier-${svc.itemId}`}
                      checked={checked}
                      onChange={() => flow.addService(svc, v)}
                      className="sr-only"
                    />
                    {v.name}
                    <span className={checked ? "text-white/80" : "text-[var(--color-muted)]"}>
                      · {formatPrice(v.priceCents)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Single-variation: nothing to choose, so tapping the whole row adds/removes it directly.
    return (
      <div key={svc.itemId} className={cardClasses(Boolean(selected))}>
        <div className="flex w-full items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => (selected ? flow.removeService(svc.itemId) : flow.addService(svc, svc.variations[0]))}
            className="flex flex-1 items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 font-medium text-[var(--color-ink)]">
              {selected && <SelectedCheck />}
              {svc.name}
            </span>
            <span className="text-sm font-medium text-[var(--color-muted)]">
              {formatPrice(svc.variations[0].priceCents)}
            </span>
          </button>
          {selected && <RemoveIcon onClick={() => flow.removeService(svc.itemId)} />}
        </div>
      </div>
    );
  }

  const allServices = data.groups.flatMap((group) => group.services);
  const topServices = TOP_SERVICE_NAMES
    .map((name) => allServices.find((svc) => svc.name === name))
    .filter((svc): svc is WireServiceItem => Boolean(svc));

  // Defaults open if a previously-selected service, or a homepage-card preselection, isn't one of
  // the top picks — otherwise it'd be selected-but-invisible in the collapsed view. Pure derived
  // value (no effect needed) so the customer's own toggle always wins once they've made one.
  const pendingService = flow.state.pendingServiceId
    ? allServices.find((svc) => svc.itemId === flow.state.pendingServiceId)
    : null;
  const needsShowAllByDefault =
    selectedServices.some((sel) => !TOP_SERVICE_NAMES.includes(sel.service.name)) ||
    Boolean(pendingService && !TOP_SERVICE_NAMES.includes(pendingService.name));
  const showAll = manualShowAll ?? needsShowAllByDefault;

  return (
    <div>
      <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        Choose your services
      </h3>
      <p className="mt-1 text-xs text-[var(--color-muted)]">Add as many services as you&apos;d like in one visit.</p>

      {showAll ? (
        <>
          <div className="mt-4 space-y-6">
            {data.groups.map((group) => (
              <div key={group.title}>
                <h4 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-2)]">{group.title}</h4>
                <div className="mt-2 space-y-2">{group.services.map(renderServiceRow)}</div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setManualShowAll(false)}
            className="mt-4 flex w-full items-center justify-center gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] py-2.5 text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-tint-2)]"
          >
            Show top picks only <span aria-hidden>↑</span>
          </button>
        </>
      ) : (
        <>
          <div className="mt-4 space-y-2">{topServices.map(renderServiceRow)}</div>
          <button
            type="button"
            onClick={() => setManualShowAll(true)}
            className="mt-4 flex w-full items-center justify-center gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] py-2.5 text-sm font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-tint-2)]"
          >
            Show more services <span aria-hidden>↓</span>
          </button>
        </>
      )}

      {selectedServices.length > 0 && (
        <div className="sticky bottom-0 mt-6 -mx-6 border-t border-[var(--color-border)] bg-[var(--color-card)] px-6 py-4 will-change-transform">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-muted)]">
              {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""}
            </span>
            <span key={flow.totalCents} className="font-semibold text-[var(--color-ink)]">
              Total: {formatPrice(flow.totalCents)}
            </span>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="mt-3 w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
