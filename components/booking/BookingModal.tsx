"use client";

import { useEffect } from "react";
import { useBookingFlow, type Preselection } from "./useBookingFlow";
import ServicesStep from "./steps/ServicesStep";
import DateTimeStep from "./steps/DateTimeStep";
import DetailsStep from "./steps/DetailsStep";
import DoneStep from "./steps/DoneStep";
import type { BookingStep } from "./types";

const STEPS: { step: BookingStep; label: string }[] = [
  { step: "services", label: "Service" },
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
}: {
  onClose: () => void;
  preselection?: Preselection;
}) {
  const flow = useBookingFlow(preselection);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[var(--radius-xl)] bg-[var(--color-card)] p-6 shadow-xl sm:rounded-[var(--radius-xl)]">
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
          {flow.state.step === "datetime" && <DateTimeStep flow={flow} />}
          {flow.state.step === "details" && <DetailsStep flow={flow} />}
          {flow.state.step === "done" && <DoneStep flow={flow} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
