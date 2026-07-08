"use client";

import { useState } from "react";
import { NO_SHOW_POLICY_SUMMARY } from "@/lib/siteData";
import { useSquareCard } from "../useSquarePayments";
import type { BookingFlow } from "../useBookingFlow";

const CARD_CONTAINER_ID = "sq-card-container";

export default function CardStep({ flow }: { flow: BookingFlow }) {
  const { card, error: sdkError } = useSquareCard(CARD_CONTAINER_ID);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { contact, customerId } = flow.state;

  async function onSubmit() {
    if (!card || !customerId) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await card.tokenize({
        billingContact: {
          givenName: contact.givenName,
          familyName: contact.familyName,
          email: contact.emailAddress || undefined,
          phone: contact.phoneNumber,
          countryCode: "US",
        },
        intent: "STORE",
        customerInitiated: true,
        sellerKeyedIn: false,
      });
      if (result.status !== "OK" || !result.token) {
        throw new Error(result.errors?.[0]?.message ?? "Card verification failed");
      }

      const res = await fetch("/api/booking/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: result.token,
          customerId,
          cardholderName: `${contact.givenName} ${contact.familyName}`.trim(),
        }),
      });
      if (!res.ok) throw new Error("request failed");

      flow.cardStored();
    } catch (err) {
      console.error("Card storage failed", err);
      setError(err instanceof Error ? err.message : "Something went wrong saving your card. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        Card on file
      </h3>
      <button type="button" onClick={() => flow.goTo("contact")} className="mt-1 text-xs text-[var(--color-accent)] underline">
        Back
      </button>

      <p className="mt-3 rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-3 text-sm text-[var(--color-ink-soft)]">
        {NO_SHOW_POLICY_SUMMARY}
      </p>

      <div className="mt-4">
        <div id={CARD_CONTAINER_ID} />
      </div>

      {(sdkError || error) && <p className="mt-3 text-sm text-red-600">{sdkError ?? error}</p>}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!card || submitting}
        className="mt-6 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
      >
        {submitting ? "Saving card…" : "Save card & continue"}
      </button>
    </div>
  );
}
