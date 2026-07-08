"use client";

import { useEffect, useState } from "react";
import type { ServicesResponse, WireAddOnGroup, WireServiceItem } from "../types";
import type { BookingFlow } from "../useBookingFlow";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function AddOnRadioGroup({
  group,
  itemId,
  selectedAddOns,
  onChange,
}: {
  group: WireAddOnGroup;
  itemId: string;
  selectedAddOns: WireServiceItem[];
  onChange: (groupOptionIds: string[], addOn: WireServiceItem | null) => void;
}) {
  const groupOptionIds = group.options.map((o) => o.itemId);
  const picked = selectedAddOns.find((a) => groupOptionIds.includes(a.itemId));
  const name = `addon-${itemId}-${group.label}`;

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-[var(--color-muted-2)]">{group.label}</p>
      <div className="mt-1 flex flex-wrap gap-2">
        <label className="flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1.5 text-xs ring-1 ring-[var(--color-border)] has-[:checked]:bg-[var(--color-accent-tint-2)] has-[:checked]:ring-[var(--color-accent)]">
          <input
            type="radio"
            name={name}
            checked={!picked}
            onChange={() => onChange(groupOptionIds, null)}
            className="accent-[var(--color-accent)]"
          />
          None
        </label>
        {group.options.map((option) => (
          <label
            key={option.itemId}
            className="flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1.5 text-xs ring-1 ring-[var(--color-border)] has-[:checked]:bg-[var(--color-accent-tint-2)] has-[:checked]:ring-[var(--color-accent)]"
          >
            <input
              type="radio"
              name={name}
              checked={picked?.itemId === option.itemId}
              onChange={() => onChange(groupOptionIds, option)}
              className="accent-[var(--color-accent)]"
            />
            {option.name} (+{formatPrice(option.variations[0]?.priceCents ?? 0)})
          </label>
        ))}
      </div>
    </div>
  );
}

/** Add-ons for every selected service, together on one screen — separate from picking the
 * services themselves so that screen stays focused and this one isn't cluttered by services that
 * don't have any add-ons to offer (e.g. Men's Services). */
export default function AddOnsStep({ flow }: { flow: BookingFlow }) {
  const [data, setData] = useState<ServicesResponse | null>(null);
  const { selectedServices } = flow.state;

  useEffect(() => {
    fetch("/api/booking/services")
      .then((r) => r.json())
      .then(setData)
      .catch(() => flow.proceedToDateTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = (data?.groups ?? [])
    .flatMap((group) =>
      group.addOnGroups.length === 0
        ? []
        : group.services
            .map((svc) => selectedServices.find((sel) => sel.service.itemId === svc.itemId))
            .filter((sel): sel is (typeof selectedServices)[number] => Boolean(sel))
            .map((sel) => ({ sel, addOnGroups: group.addOnGroups })),
    );

  // Nothing to show (e.g. only Men's Services selected) — skip straight to date/time.
  useEffect(() => {
    if (data && rows.length === 0) flow.proceedToDateTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, rows.length]);

  if (!data || rows.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">Loading…</p>;
  }

  const totalAddOns = selectedServices.reduce((sum, sel) => sum + sel.addOns.length, 0);

  return (
    <div>
      <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        Add-ons
      </h3>
      <button type="button" onClick={() => flow.goTo("services")} className="mt-1 text-xs text-[var(--color-accent)] underline">
        Back to services
      </button>
      <p className="mt-2 text-xs text-[var(--color-muted)]">Optional finishing touches for your selected services.</p>

      <div className="mt-4 space-y-4">
        {rows.map(({ sel, addOnGroups }) => (
          <div key={sel.service.itemId} className="rounded-[var(--radius-lg)] px-4 py-3 ring-1 ring-[var(--color-border)]">
            <p className="font-medium text-[var(--color-ink)]">
              {sel.service.name}
              {sel.variation.name !== "Regular" && (
                <span className="text-xs font-normal text-[var(--color-muted)]"> ({sel.variation.name})</span>
              )}
            </p>
            {addOnGroups.map((addOnGroup) => (
              <AddOnRadioGroup
                key={addOnGroup.label}
                group={addOnGroup}
                itemId={sel.service.itemId}
                selectedAddOns={sel.addOns}
                onChange={(groupOptionIds, addOn) => flow.setServiceAddOn(sel.service.itemId, groupOptionIds, addOn)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 mt-6 -mx-6 border-t border-[var(--color-border)] bg-[var(--color-card)] px-6 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-muted)]">
            {totalAddOns > 0 ? `${totalAddOns} add-on${totalAddOns > 1 ? "s" : ""} selected` : "No add-ons selected"}
          </span>
          <span className="font-semibold text-[var(--color-ink)]">Total: {formatPrice(flow.totalCents)}</span>
        </div>
        <button
          type="button"
          onClick={flow.proceedToDateTime}
          className="mt-3 w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
        >
          Choose a time
        </button>
      </div>
    </div>
  );
}
