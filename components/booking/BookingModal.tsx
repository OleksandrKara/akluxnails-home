"use client";

import { useEffect, useRef } from "react";
import { useBookingFlow, type Preselection } from "./useBookingFlow";
import ServicesStep from "./steps/ServicesStep";
import AddOnsStep from "./steps/AddOnsStep";
import DateTimeStep from "./steps/DateTimeStep";
import DetailsStep from "./steps/DetailsStep";
import DoneStep from "./steps/DoneStep";
import type { BookingStep } from "./types";
import { trackFunnelStep } from "@/lib/trackFunnelStep";

const STEPS: { step: BookingStep; label: string }[] = [
  { step: "services", label: "Service" },
  { step: "addons", label: "Add-ons" },
  { step: "datetime", label: "Time" },
  { step: "details", label: "Details" },
];

function ProgressBar({ step }: { step: BookingStep }) {
  if (step === "done") return null;
  const currentIndex = STEPS.findIndex((s) => s.step === step);

  return (
    <div className="mt-3 flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s.step} className="flex flex-1 items-center gap-2">
          <div
            className={`h-1.5 flex-1 rounded-full ${
              i <= currentIndex ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export default function BookingModal({
  onClose,
  preselection,
  theme,
}: {
  onClose: () => void;
  preselection?: Preselection;
  /** Set when opened from Homepage V4 (see V4ThemeContext/BookNowButton) — applies the same
   * v4-theme CSS variable override used by the rest of that page, so every step (which already
   * reads the shared color and font variables) re-themes without any per-step edits. Every
   * other variant opens this with theme=undefined, so it's completely unaffected. */
  theme?: "v4";
}) {
  const flow = useBookingFlow(preselection);
  const trackedStepsRef = useRef<Set<BookingStep>>(new Set());

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Booking-funnel step tracking (see marketing.funnel_events / lib/funnelFlow.ts). This
  // component is only ever mounted while the modal is open (BookingModalProvider conditionally
  // renders it), so a plain ref-backed Set — not keyed off anything — already scopes dedup to
  // one modal session: back-navigation to an already-tracked step doesn't re-fire. "done" isn't
  // tracked — booking_completed already covers completion more reliably.
  useEffect(() => {
    const step = flow.state.step;
    if (step === "done") return;
    if (trackedStepsRef.current.has(step)) return;
    trackedStepsRef.current.add(step);
    trackFunnelStep(step);
  }, [flow.state.step]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        className={`max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[var(--radius-xl)] bg-[var(--color-card)] p-6 shadow-xl sm:rounded-[var(--radius-xl)] ${theme === "v4" ? "v4-theme" : ""}`}
        style={theme === "v4" ? { fontFamily: "var(--font-body)" } : undefined}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <ProgressBar step={flow.state.step} />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-xl leading-none text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            ×
          </button>
        </div>

        <div className="mt-5">
          {flow.state.step === "services" && <ServicesStep flow={flow} />}
          {flow.state.step === "addons" && <AddOnsStep flow={flow} />}
          {flow.state.step === "datetime" && <DateTimeStep flow={flow} />}
          {flow.state.step === "details" && <DetailsStep flow={flow} />}
          {flow.state.step === "done" && <DoneStep flow={flow} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
