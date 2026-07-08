"use client";

import { useEffect } from "react";
import { useBookingFlow } from "./useBookingFlow";
import ServicesStep from "./steps/ServicesStep";
import DateTimeStep from "./steps/DateTimeStep";
import ContactStep from "./steps/ContactStep";
import CardStep from "./steps/CardStep";
import ConfirmStep from "./steps/ConfirmStep";
import DoneStep from "./steps/DoneStep";

export default function BookingModal({ onClose }: { onClose: () => void }) {
  const flow = useBookingFlow();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[var(--radius-xl)] bg-[var(--color-card)] p-6 shadow-xl sm:rounded-[var(--radius-xl)]">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-xl leading-none text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            ×
          </button>
        </div>

        {flow.state.step === "services" && <ServicesStep flow={flow} />}
        {flow.state.step === "datetime" && <DateTimeStep flow={flow} />}
        {flow.state.step === "contact" && <ContactStep flow={flow} />}
        {flow.state.step === "card" && <CardStep flow={flow} />}
        {flow.state.step === "confirm" && <ConfirmStep flow={flow} />}
        {flow.state.step === "done" && <DoneStep flow={flow} onClose={onClose} />}
      </div>
    </div>
  );
}
