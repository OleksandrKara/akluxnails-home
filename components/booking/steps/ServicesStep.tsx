"use client";

import { useEffect, useState } from "react";
import type { ServicesResponse, WireServiceItem, WireVariation } from "../types";
import type { BookingFlow } from "../useBookingFlow";

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

export default function ServicesStep({ flow }: { flow: BookingFlow }) {
  const [data, setData] = useState<ServicesResponse | null>(null);
  const [error, setError] = useState(false);
  // undefined = "not yet touched by the visitor" — falls back to the flow's initial
  // pendingServiceId (homepage card click on a multi-tier service) until they open/close a panel
  // themselves. Derived during render rather than via an effect + setState.
  const [pendingServiceId, setPendingServiceId] = useState<string | null | undefined>(undefined);
  const { selectedServices } = flow.state;

  useEffect(() => {
    fetch("/api/booking/services")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const effectivePendingId = pendingServiceId !== undefined ? pendingServiceId : flow.state.pendingServiceId;
  const pendingService = data && effectivePendingId
    ? (data.groups.flatMap((g) => g.services).find((s) => s.itemId === effectivePendingId) ?? null)
    : null;

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

  function pickVariation(svc: WireServiceItem, v: WireVariation) {
    flow.addService(svc, v);
    setPendingServiceId(null);
  }

  /** A single-variation service has nothing to actually choose — tapping it should add/remove it
   * directly instead of expanding a panel that just asks you to confirm the only option again. */
  function onServiceClick(svc: WireServiceItem, isSelected: boolean) {
    if (svc.variations.length === 1) {
      if (isSelected) {
        flow.removeService(svc.itemId);
      } else {
        flow.addService(svc, svc.variations[0]);
      }
      return;
    }

    const lock = lockedTierName(svc.itemId);
    if (isSelected) {
      // Already selected and locked by another tiered service in the cart — nothing to change,
      // only the × can remove it.
      if (lock) return;
      setPendingServiceId(pendingService?.itemId === svc.itemId ? null : svc.itemId);
      return;
    }
    if (lock) {
      const matching = svc.variations.find((v) => v.name === lock);
      if (matching) {
        flow.addService(svc, matching);
        return;
      }
    }
    setPendingServiceId(pendingService?.itemId === svc.itemId ? null : svc.itemId);
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

  return (
    <div>
      <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        Choose your services
      </h3>
      <p className="mt-1 text-xs text-[var(--color-muted)]">Add as many services as you&apos;d like in one visit.</p>

      <div className="mt-4 space-y-6">
        {data.groups.map((group) => (
          <div key={group.title}>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-2)]">{group.title}</h4>
            <div className="mt-2 space-y-2">
              {group.services.map((svc) => {
                const selected = selectedServices.find((sel) => sel.service.itemId === svc.itemId);
                const locked = svc.variations.length > 1 && Boolean(lockedTierName(svc.itemId));
                return (
                  <div
                    key={svc.itemId}
                    className={`rounded-[var(--radius-lg)] ring-1 ${
                      selected ? "ring-2 ring-[var(--color-accent)]" : "ring-[var(--color-border)]"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onServiceClick(svc, Boolean(selected))}
                        className="flex flex-1 items-center justify-between text-left"
                      >
                        <span className="flex items-center gap-2 font-medium text-[var(--color-ink)]">
                          {selected && <span className="text-[var(--color-accent)]">✓</span>}
                          {svc.name}
                          {selected && svc.variations.length > 1 && (
                            <span className="text-xs font-normal text-[var(--color-muted)]">({selected.variation.name})</span>
                          )}
                        </span>
                        <span className="text-sm text-[var(--color-muted)]">
                          {selected
                            ? formatPrice(selected.variation.priceCents)
                            : svc.variations.length === 1
                              ? formatPrice(svc.variations[0].priceCents)
                              : `from ${formatPrice(Math.min(...svc.variations.map((v) => v.priceCents)))}`}
                        </span>
                      </button>
                      {selected && <RemoveIcon onClick={() => flow.removeService(svc.itemId)} />}
                    </div>
                    {svc.variations.length > 1 && pendingService?.itemId === svc.itemId && (
                      <div className="space-y-1 border-t border-[var(--color-border)] px-4 py-3">
                        {svc.variations.map((v) => (
                          <button
                            key={v.variationId}
                            type="button"
                            onClick={() => pickVariation(svc, v)}
                            className="flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-sm hover:bg-[var(--color-accent-tint-2)]"
                          >
                            <span>{v.name}</span>
                            <span className="font-medium text-[var(--color-accent)]">{formatPrice(v.priceCents)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {selected && locked && svc.variations.length > 1 && (
                      <p className="border-t border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-muted)]">
                        Matched to the {selected.variation.name} you picked for your other service — the same provider does
                        your whole visit.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedServices.length > 0 && (
        <div className="sticky bottom-0 mt-6 -mx-6 border-t border-[var(--color-border)] bg-[var(--color-card)] px-6 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-muted)]">
              {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""}
            </span>
            <span className="font-semibold text-[var(--color-ink)]">Total: {formatPrice(flow.totalCents)}</span>
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
