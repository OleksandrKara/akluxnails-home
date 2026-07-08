"use client";

import { useState } from "react";
import { NO_SHOW_POLICY_SUMMARY, SMS_CONSENT_TEXT } from "@/lib/siteData";
import { useSquareCard } from "../useSquarePayments";
import type { BookingFlow } from "../useBookingFlow";
import CancellationPolicyModal from "../CancellationPolicyModal";

const CARD_CONTAINER_ID = "sq-card-container";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** One screen: contact details + order summary + card-on-file, ending in a single "Confirm &
 * Book" action — fewer taps than a separate contact/card/confirm sequence, which matters for
 * conversion. The whole booking (customer, card, appointment) is created in one submit. */
export default function DetailsStep({ flow }: { flow: BookingFlow }) {
  const { card, error: sdkError } = useSquareCard(CARD_CONTAINER_ID);
  const [givenName, setGivenName] = useState(flow.state.contact.givenName);
  const [familyName, setFamilyName] = useState(flow.state.contact.familyName);
  const [phoneNumber, setPhoneNumber] = useState(flow.state.contact.phoneNumber);
  const [emailAddress, setEmailAddress] = useState(flow.state.contact.emailAddress);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPolicy, setShowPolicy] = useState(false);

  const { selectedServices, addOns, slot, smsOptIn, cancellationAgreed } = flow.state;
  if (selectedServices.length === 0 || !slot) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!card || !cancellationAgreed) return;
    setSubmitting(true);
    setError(null);
    try {
      const contact = { givenName, familyName, phoneNumber, emailAddress };
      flow.setContact(contact);

      const customerRes = await fetch("/api/booking/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contact, smsOptIn }),
      });
      if (!customerRes.ok) throw new Error("Couldn't save your details. Please try again.");
      const { customerId } = await customerRes.json();

      const tokenResult = await card.tokenize({
        billingContact: { givenName, familyName, email: emailAddress || undefined, phone: phoneNumber, countryCode: "US" },
        intent: "STORE",
        customerInitiated: true,
        sellerKeyedIn: false,
      });
      if (tokenResult.status !== "OK" || !tokenResult.token) {
        throw new Error(tokenResult.errors?.[0]?.message ?? "Card verification failed. Please check your card details.");
      }

      const cardRes = await fetch("/api/booking/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: tokenResult.token, customerId, cardholderName: `${givenName} ${familyName}`.trim() }),
      });
      if (!cardRes.ok) {
        const { error } = await cardRes.json().catch(() => ({ error: null }));
        throw new Error(error ?? "This card couldn't be saved. Please double-check the details or try a different card.");
      }

      const bookingRes = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          slot,
          addOnVariationIds: addOns.map((a) => a.variations[0]?.variationId).filter(Boolean),
        }),
      });
      if (!bookingRes.ok) throw new Error("Couldn't finish booking your appointment. Please try again.");
      const { bookingId, technicianName } = await bookingRes.json();

      flow.bookingCreated(bookingId, technicianName ?? null);
    } catch (err) {
      console.error("Booking submission failed", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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

      <div className="mt-4 rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-3 text-sm">
        {selectedServices.map((sel) => (
          <div key={sel.service.itemId} className="flex justify-between">
            <span className="text-[var(--color-ink)]">
              {sel.service.name} ({sel.variation.name})
            </span>
            <span className="text-[var(--color-ink)]">{formatPrice(sel.variation.priceCents)}</span>
          </div>
        ))}
        {addOns.map((a) => (
          <div key={a.itemId} className="mt-1 flex justify-between text-[var(--color-muted)]">
            <span>+ {a.name}</span>
            <span>{formatPrice(a.variations[0]?.priceCents ?? 0)}</span>
          </div>
        ))}
        <div className="mt-1 text-[var(--color-muted)]">{formatDateTime(slot.startAt)}</div>
        <div className="mt-2 flex justify-between border-t border-[var(--color-accent-border-soft)] pt-2 font-semibold text-[var(--color-ink)]">
          <span>Total</span>
          <span>{formatPrice(flow.totalCents)}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
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

      {/* SMS opt-in: unchecked by default, plain-language, no dark patterns — required for CA/TCPA
          compliant marketing consent. Purely optional, never blocks booking. Styled to actually
          invite a yes (badge, benefit-led copy that changes once checked) rather than just
          sitting there as a bare checkbox. */}
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
          onChange={(e) => flow.setSmsOptIn(e.target.checked)}
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
              : "Never miss your slot + first access to text-only offers"}
          </span>
          <span className="mt-2 block text-[11px] leading-relaxed text-[var(--color-muted-2)]">{SMS_CONSENT_TEXT}</span>
        </span>
      </label>

      {/* Cancellation policy: required to book, matching the $25 no-show/late-cancellation policy
          the card on file protects against. */}
      <label
        className={`mt-3 flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border p-3 transition ${
          cancellationAgreed ? "border-[var(--color-accent)] bg-[var(--color-accent-tint-2)]" : "border-[var(--color-border)]"
        }`}
      >
        <input
          required
          type="checkbox"
          checked={cancellationAgreed}
          onChange={(e) => flow.setCancellationAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span className="text-sm text-[var(--color-muted)]">
          I agree to the{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowPolicy(true);
            }}
            className="font-medium text-[var(--color-accent)] underline"
          >
            Cancellation Policy
          </button>{" "}
          — reschedule or cancel at least 24 hours ahead, or a <strong>$25 fee</strong> may apply.
        </span>
      </label>

      <p className="mt-4 text-xs text-[var(--color-muted)]">{NO_SHOW_POLICY_SUMMARY}</p>
      <div className="mt-2">
        <div id={CARD_CONTAINER_ID} />
      </div>

      {(sdkError || error) && <p className="mt-3 text-sm text-red-600">{sdkError ?? error}</p>}

      <button
        type="submit"
        disabled={!card || !cancellationAgreed || submitting}
        className="mt-5 w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-base font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
      >
        {submitting ? "Booking your appointment…" : `Confirm & Book — ${formatPrice(flow.totalCents)}`}
      </button>

      {showPolicy && <CancellationPolicyModal onClose={() => setShowPolicy(false)} />}
    </form>
  );
}
