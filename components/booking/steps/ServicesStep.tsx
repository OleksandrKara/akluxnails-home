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
  const { service, variation, addOns } = flow.state;

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
    flow.selectService(svc, v);
    setPendingService(null);
  }

  if (service && variation) {
    return (
      <div>
        <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
          {service.name}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {variation.name} · {formatPrice(variation.priceCents)}
        </p>
        <button
          type="button"
          onClick={flow.clearService}
          className="mt-1 text-xs text-[var(--color-accent)] underline"
        >
          Change service
        </button>

        {data.addOns.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-2)]">Add-ons (optional)</h4>
            <div className="mt-2 space-y-2">
              {data.addOns.map((addOn) => {
                const checked = addOns.some((a) => a.itemId === addOn.itemId);
                return (
                  <label
                    key={addOn.itemId}
                    className="flex items-center justify-between rounded-[var(--radius-lg)] px-4 py-3 ring-1 ring-[var(--color-border)]"
                  >
                    <span className="flex items-center gap-2">
                      <input type="checkbox" checked={checked} onChange={() => flow.toggleAddOn(addOn)} />
                      <span className="text-[var(--color-ink)]">{addOn.name}</span>
                    </span>
                    <span className="text-sm text-[var(--color-muted)]">
                      +{formatPrice(addOn.variations[0]?.priceCents ?? 0)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-[var(--color-muted)]">
            Total: <span className="font-semibold text-[var(--color-ink)]">{formatPrice(flow.totalCents)}</span>
          </span>
          <button
            type="button"
            onClick={flow.proceedToDateTime}
            className="rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
          >
            Choose a time
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        Choose a service
      </h3>
      <div className="mt-4 space-y-6">
        {data.groups.map((group) => (
          <div key={group.title}>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-2)]">{group.title}</h4>
            <div className="mt-2 space-y-2">
              {group.services.map((svc) => (
                <div key={svc.itemId} className="rounded-[var(--radius-lg)] ring-1 ring-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setPendingService(pendingService?.itemId === svc.itemId ? null : svc)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="font-medium text-[var(--color-ink)]">{svc.name}</span>
                    <span className="text-sm text-[var(--color-muted)]">
                      {svc.variations.length === 1
                        ? formatPrice(svc.variations[0].priceCents)
                        : `from ${formatPrice(Math.min(...svc.variations.map((v) => v.priceCents)))}`}
                    </span>
                  </button>
                  {pendingService?.itemId === svc.itemId && (
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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
