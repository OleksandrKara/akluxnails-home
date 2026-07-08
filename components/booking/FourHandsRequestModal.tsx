"use client";

import { useState } from "react";
import { SMS_CONSENT_TEXT, LOCATION } from "@/lib/siteData";

export default function FourHandsRequestModal({ onClose }: { onClose: () => void }) {
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/booking/four-hands-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ givenName, familyName, phoneNumber, emailAddress, smsOptIn }),
      });
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: null }));
        throw new Error(msg ?? "Something went wrong. Please call us instead.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please call us instead.");
    } finally {
      setSubmitting(false);
    }
  }

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

        {submitted ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success-bg)] text-2xl text-[var(--color-success)]">
              ✓
            </div>
            <h3 className="mt-3 text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
              Request received!
            </h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              We&apos;ll contact you within 24 hours to schedule your 4-hand appointment. Have a question in the
              meantime? Call us at{" "}
              <a href={LOCATION.phoneHref} className="font-medium text-[var(--color-accent)]">
                {LOCATION.phone}
              </a>
              .
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
              Request a 4-Hand Appointment
            </h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Two techs, one appointment — for when you&apos;re short on time. These need a bit of coordination, so
              tell us how to reach you and we&apos;ll follow up to schedule the exact date and time.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                required
                autoFocus
                placeholder="First name"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2"
              />
              <input
                placeholder="Last name"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2"
              />
              <input
                required
                type="tel"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2"
              />
            </div>

            <label
              className={`mt-4 flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border-2 p-3.5 transition ${
                smsOptIn
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-tint-2)]"
                  : "border-[var(--color-accent-border-soft)] bg-[var(--color-accent-tint-2)]/40"
              }`}
            >
              <input
                type="checkbox"
                checked={smsOptIn}
                onChange={(e) => setSmsOptIn(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--color-ink)]">Text me reminders &amp; exclusive offers</span>
                  <span
                    className={`shrink-0 whitespace-nowrap rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      smsOptIn ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-accent-tint)] text-[var(--color-accent-dark)]"
                    }`}
                  >
                    {smsOptIn ? "✓ On" : "Recommended"}
                  </span>
                </span>
                <span className="mt-1 block text-xs font-medium text-[var(--color-accent-dark)]">
                  {smsOptIn
                    ? "You're in — VIP offers and booking reminders headed your way."
                    : "First access to text-only offers"}
                </span>
                <span className="mt-2 block text-[11px] leading-relaxed text-[var(--color-muted-2)]">{SMS_CONSENT_TEXT}</span>
              </span>
            </label>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-base font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
