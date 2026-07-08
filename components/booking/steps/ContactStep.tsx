"use client";

import { useState } from "react";
import type { BookingFlow } from "../useBookingFlow";

export default function ContactStep({ flow }: { flow: BookingFlow }) {
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/booking/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ givenName, familyName, phoneNumber, emailAddress }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      flow.submitContact({ givenName, familyName, phoneNumber, emailAddress }, data.customerId);
    } catch {
      setError("Something went wrong saving your details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        Your details
      </h3>
      <button type="button" onClick={() => flow.goTo("datetime")} className="mt-1 text-xs text-[var(--color-accent)] underline">
        Back to date/time
      </button>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          required
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

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
