"use client";

import { useState } from "react";

/** Shared lead-capture modal for Homepage V4's Gift Card / Prepay / Referral CTAs — collects
 * contact info (and one optional detail field) and records it as a Square customer note via
 * /api/v4-request; staff follow up to actually process payment, same as the no-show-fee flow
 * already works manually today. No card, no booking — this is a request, not a transaction.
 */
export default function RequestModal({
  triggerLabel,
  triggerClassName,
  title,
  description,
  requestType,
  detailLabel,
  detailPlaceholder,
}: {
  triggerLabel: string;
  triggerClassName?: string;
  title: string;
  description: string;
  requestType: string;
  detailLabel?: string;
  detailPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [givenName, setGivenName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [detail, setDetail] = useState("");

  function reset() {
    setDone(false);
    setError("");
    setGivenName("");
    setPhoneNumber("");
    setEmailAddress("");
    setDetail("");
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/v4-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestType, givenName, phoneNumber, emailAddress, detail }),
      });
      if (!res.ok) throw new Error("Something went wrong — please text us instead.");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[var(--radius-xl)] bg-[var(--color-card)] p-6 shadow-xl sm:rounded-[var(--radius-xl)]">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
                {title}
              </h3>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="shrink-0 text-xl leading-none text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                ×
              </button>
            </div>

            {done ? (
              <div className="mt-6 text-center">
                <p className="text-[var(--color-ink)]">Thank you! We&rsquo;ve got your request — we&rsquo;ll be in touch shortly.</p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-5 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <p className="text-sm text-[var(--color-muted)]">{description}</p>
                <input
                  required
                  value={givenName}
                  onChange={(e) => setGivenName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-ink)]"
                />
                <input
                  required
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-ink)]"
                />
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-ink)]"
                />
                {detailLabel && (
                  <input
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder={detailPlaceholder ?? detailLabel}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-ink)]"
                  />
                )}
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Send Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
