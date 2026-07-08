"use client";

import { CANCELLATION_POLICY_TEXT } from "@/lib/siteData";

export default function CancellationPolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 sm:items-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-[var(--radius-xl)] bg-[var(--color-card)] p-6 sm:rounded-[var(--radius-xl)]"
      >
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
        <h3 className="text-xl font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
          Cancellation &amp; Service Policy
        </h3>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--color-muted)]">
          {CANCELLATION_POLICY_TEXT}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-[var(--radius-pill)] bg-[var(--color-ink)] px-6 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
