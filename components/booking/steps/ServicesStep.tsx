"use client";

import { useEffect, useState } from "react";
import type { ServicesResponse, WireServiceItem } from "../types";
import type { BookingFlow } from "../useBookingFlow";
import { FOUR_HANDS_DISPLAY_PRICE_CENTS, FOUR_HANDS_REQUEST_ITEM_NAME } from "@/lib/services-config";

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

function cheapestVariation(svc: WireServiceItem) {
  return svc.variations.reduce((min, v) => (v.priceCents < min.priceCents ? v : min));
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

/** One selected look everywhere (accent ring + soft accent-tinted fill), used the same way for
 * every service row. */
function cardClasses(selected: boolean): string {
  return `rounded-[var(--radius-lg)] ring-1 transition-colors ${
    selected ? "ring-2 ring-[var(--color-accent)] bg-[var(--color-accent-tint-2)]" : "ring-[var(--color-border)]"
  }`;
}

/** Which nail tech does the work (if a service has more than one price tier) is a filter on the
 * "Choose a time" screen later — this screen only asks "what", never "who". */
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

  /** Add-ons live on their own step next, shown only if at least one selected service belongs to
   * a group that actually has add-on options (e.g. skip it entirely for a Men's-only booking).
   * Which nail tech does the work (if a selected service has more than one price tier) is a
   * filter on the "Choose a time" screen next, not a separate step here. */
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

  /** One service row's markup — shared by the collapsed top-picks view and the full grouped
   * view. Always just name + price + tap to add/remove; which nail tech is a filter on the
   * time-picker screen later. */
  function renderServiceRow(svc: WireServiceItem) {
    const selected = selectedServices.find((sel) => sel.service.itemId === svc.itemId);
    const isFourHands = svc.name === FOUR_HANDS_REQUEST_ITEM_NAME;
    const isTiered = svc.variations.length > 1;
    const cheapest = cheapestVariation(svc);
    const price = isFourHands
      ? FOUR_HANDS_DISPLAY_PRICE_CENTS
      : selected
        ? selected.variation.priceCents
        : cheapest.priceCents;

    return (
      <div key={svc.itemId} className={cardClasses(Boolean(selected))}>
        <div className="flex w-full items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => (selected ? flow.removeService(svc.itemId) : flow.addService(svc, cheapest))}
            className="flex flex-1 items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 font-medium text-[var(--color-ink)]">
              {selected && <SelectedCheck />}
              {svc.name}
            </span>
            <span className="text-sm font-medium text-[var(--color-muted)]">
              {isTiered ? `from ${formatPrice(price)}` : formatPrice(price)}
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

  // Defaults open if a previously-selected service isn't one of the top picks — otherwise it'd
  // be selected-but-invisible in the collapsed view. Pure derived value (no effect needed) so the
  // customer's own toggle always wins once they've made one.
  const needsShowAllByDefault = selectedServices.some((sel) => !TOP_SERVICE_NAMES.includes(sel.service.name));
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
