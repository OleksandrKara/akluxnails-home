"use client";

import type { BookingFlow } from "../useBookingFlow";

// Same visual language as the checkmark badges elsewhere in the booking flow (ServicesStep,
// DoneStep, SecureAppointmentCard).
function SelectedCheck() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-bold text-white">
      ✓
    </span>
  );
}

function TechOption({ name, selected, onSelect }: { name: string; selected: boolean; onSelect: () => void }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between rounded-[var(--radius-lg)] px-4 py-3.5 ring-1 transition-colors ${
        selected ? "ring-2 ring-[var(--color-accent)] bg-[var(--color-accent-tint-2)]" : "ring-[var(--color-border)]"
      }`}
    >
      <span className="flex items-center gap-2 font-medium text-[var(--color-ink)]">
        {selected && <SelectedCheck />}
        {name}
      </span>
      <input type="radio" name="tech" checked={selected} onChange={onSelect} className="sr-only" />
    </label>
  );
}

/** Which nail tech does the work — its own step so it reads as a real choice about a person, not
 * a price detail buried in the services list (that's exactly what didn't land about the last two
 * redesigns of this feature). Only reached when at least one selected service has more than one
 * price tier (see ServicesStep's onContinue) — every tiered service in this business's real Square
 * setup maps to exactly one named technician per tier (confirmed directly against live
 * availability data, not assumed), so "which tier" and "which person" are the same underlying
 * choice; this screen just asks it the way a customer actually thinks about it. */
export default function TechStep({ flow }: { flow: BookingFlow }) {
  const { selectedServices, selectedTechId } = flow.state;

  // Distinct named technicians across every currently-selected tiered service — in practice the
  // same two people regardless of which tiered service(s) are picked, but computed generically
  // rather than hardcoded, so a future catalog change (new tier, different assignment) is
  // reflected automatically.
  const techs = new Map<string, string>();
  for (const sel of selectedServices) {
    if (sel.service.variations.length <= 1) continue;
    for (const v of sel.service.variations) {
      if (v.technicianId && v.technicianName) techs.set(v.technicianId, v.technicianName);
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        Choose your nail tech
      </h3>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        Pick someone by name, or we&apos;ll match you with whoever&apos;s soonest available.
      </p>
      <button type="button" onClick={() => flow.goTo("services")} className="mt-1 text-xs text-[var(--color-accent)] underline">
        Back to services
      </button>

      <div className="mt-4 space-y-2">
        <TechOption name="Any available tech" selected={selectedTechId === null} onSelect={() => flow.setTech(null)} />
        {[...techs.entries()].map(([id, name]) => (
          <TechOption key={id} name={name} selected={selectedTechId === id} onSelect={() => flow.setTech(id)} />
        ))}
      </div>

      <button
        type="button"
        onClick={flow.proceedToAddOns}
        className="mt-5 w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
      >
        Continue
      </button>
    </div>
  );
}
