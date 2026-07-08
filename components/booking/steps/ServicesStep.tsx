"use client";

import { useEffect, useState } from "react";
import type { ServicesResponse, WireServiceItem, WireVariation } from "../types";
import type { BookingFlow } from "../useBookingFlow";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function ServicesStep({ flow }: { flow: BookingFlow }) {
  const [data, setData] = useState<ServicesResponse | null>(null);
  const [error, setError] = useState(false);
  const [pendingService, setPendingService] = useState<WireServiceItem | null>(null);
  const { selectedServices } = flow.state;

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

  function pickVariation(svc: WireServiceItem, v: WireVariation) {
    flow.addService(svc, v);
    setPendingService(null);
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
    setPendingService(pendingService?.itemId === svc.itemId ? null : svc);
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
                return (
                  <div
                    key={svc.itemId}
                    className={`rounded-[var(--radius-lg)] ring-1 ${
                      selected ? "ring-2 ring-[var(--color-accent)]" : "ring-[var(--color-border)]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onServiceClick(svc, Boolean(selected))}
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
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
                        {selected && (
                          <button
                            type="button"
                            onClick={() => {
                              flow.removeService(svc.itemId);
                              setPendingService(null);
                            }}
                            className="w-full rounded-[var(--radius-sm)] px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Remove from booking
                          </button>
                        )}
                      </div>
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
