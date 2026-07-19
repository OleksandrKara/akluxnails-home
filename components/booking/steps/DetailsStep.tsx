"use client";

import { useEffect, useState } from "react";
import { NO_SHOW_POLICY_SUMMARY, SMS_CONSENT_TEXT } from "@/lib/siteData";
import { FOUR_HANDS_REQUEST_ITEM_NAME } from "@/lib/services-config";
import type { BookingFlow } from "../useBookingFlow";
import CancellationPolicyModal from "../CancellationPolicyModal";

const LOOKUP_DEBOUNCE_MS = 600;

interface ReturningCustomer {
  givenName: string | null;
  hasSmsOptIn: boolean;
  hasCardOnFile: boolean;
}

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

function looksLikeCompletePhone(value: string): boolean {
  return value.replace(/\D/g, "").length >= 10;
}
function looksLikeCompleteEmail(value: string): boolean {
  return /\S+@\S+\.\S+/.test(value);
}

/** One screen: contact details + order summary, ending in a single "Confirm & Book" action —
 * no card required here. The appointment is created from just contact info + cancellation-policy
 * agreement; a card (for the $25 no-show/late-cancellation policy) is asked for afterward, on
 * DoneStep, once the customer has already seen their appointment confirmed. Booking first this way
 * means even a customer who never gets around to adding a card still has a real, staff-visible
 * appointment on the books — better than today's alternative of losing them entirely at a
 * mandatory card field before anything existed.
 *
 * The 4-hand placeholder item is a request, not a real priced/confirmed service — no
 * cancellation-policy agreement is needed for it, just contact info and the same SMS opt-in.
 *
 * As soon as contact info matches an existing Square customer, the form recognizes them and skips
 * re-asking for anything already on file (SMS consent) rather than only finding out at submit
 * time. Their existing card-on-file status is threaded through to DoneStep so it doesn't ask again. */
export default function DetailsStep({ flow }: { flow: BookingFlow }) {
  const { selectedServices, slot, smsOptIn, cancellationAgreed } = flow.state;
  const isFourHandsRequest =
    selectedServices.length === 1 && selectedServices[0].service.name === FOUR_HANDS_REQUEST_ITEM_NAME;

  const [givenName, setGivenName] = useState(flow.state.contact.givenName);
  const [familyName, setFamilyName] = useState(flow.state.contact.familyName);
  const [phoneNumber, setPhoneNumber] = useState(flow.state.contact.phoneNumber);
  const [emailAddress, setEmailAddress] = useState(flow.state.contact.emailAddress);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const [returningCustomer, setReturningCustomer] = useState<ReturningCustomer | null>(null);
  // The exact phone/email the above result actually came from. Compared against the *current*
  // fields on every render below — if they no longer match (the user has since edited either
  // field), the result is treated as unconfirmed rather than trusted. Without this, typing a
  // known customer's number then changing it to someone else's (or a typo) would keep skipping
  // the card step until the new lookup happens to complete, which is exactly backwards — we must
  // not assume a card is on file for contact info we haven't actually confirmed yet.
  const [lookedUpFor, setLookedUpFor] = useState<{ phoneNumber: string; emailAddress: string } | null>(null);
  const returningCustomerConfirmed =
    lookedUpFor?.phoneNumber === phoneNumber && lookedUpFor?.emailAddress === emailAddress ? returningCustomer : null;

  useEffect(() => {
    const phoneReady = looksLikeCompletePhone(phoneNumber);
    const emailReady = looksLikeCompleteEmail(emailAddress);
    if (!phoneReady && !emailReady) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      fetch("/api/booking/customer-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneReady ? phoneNumber : undefined,
          emailAddress: emailReady ? emailAddress : undefined,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          // Guards against a slow response for an older phone/email resolving after the input
          // has since changed again — the lookedUpFor comparison above already protects against
          // stale data being trusted, but there's no reason to apply it at all in that case.
          if (cancelled) return;
          setReturningCustomer(data.found ? data : null);
          setLookedUpFor({ phoneNumber, emailAddress });
        })
        .catch(() => {
          if (cancelled) return;
          setReturningCustomer(null);
          setLookedUpFor({ phoneNumber, emailAddress });
        });
    }, LOOKUP_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phoneNumber, emailAddress]);

  if (selectedServices.length === 0 || !slot) return null;

  const canSubmit = isFourHandsRequest ? true : cancellationAgreed;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
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

      const addOnVariationIds = selectedServices.flatMap((sel) =>
        sel.addOns.map((a) => a.variations[0]?.variationId).filter((id): id is string => Boolean(id)),
      );

      const bookingRes = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          slot,
          addOnVariationIds,
          serviceName: selectedServices[0]?.service.name,
          contact,
        }),
      });
      if (!bookingRes.ok) throw new Error("Couldn't finish booking your appointment. Please try again.");
      const { bookingId, technicianName } = await bookingRes.json();

      flow.bookingCreated(bookingId, technicianName ?? null, customerId, Boolean(returningCustomerConfirmed?.hasCardOnFile));
    } catch (err) {
      console.error("Booking submission failed", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const skippedThings: string[] = [];
  if (returningCustomerConfirmed?.hasCardOnFile) skippedThings.push("your card");
  if (returningCustomerConfirmed?.hasSmsOptIn) skippedThings.push("your texting preferences");
  const welcomeBackMessage = returningCustomerConfirmed
    ? `Welcome back${returningCustomerConfirmed.givenName ? `, ${returningCustomerConfirmed.givenName}` : ""}! 🎉${
        skippedThings.length > 0
          ? ` We already have ${skippedThings.join(" and ")} on file, so there's nothing extra to fill out — thank you for being a returning client.`
          : " Great to see you again."
      }`
    : null;

  return (
    <form onSubmit={onSubmit}>
      <h3 className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        {isFourHandsRequest ? "Request your 4-hand appointment" : "Your details"}
      </h3>
      {isFourHandsRequest && (
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          We&apos;ll confirm this exact time works for two technicians and follow up to finalize.
        </p>
      )}
      <button type="button" onClick={() => flow.goTo("datetime")} className="mt-1 text-xs text-[var(--color-accent)] underline">
        Back to date/time
      </button>

      <div className="mt-4 rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-3 text-sm">
        {selectedServices.map((sel) => (
          <div key={sel.service.itemId}>
            <div className="flex justify-between">
              <span className="text-[var(--color-ink)]">
                {sel.service.name} ({sel.variation.name})
              </span>
              <span className="text-[var(--color-ink)]">{formatPrice(sel.variation.priceCents)}</span>
            </div>
            {sel.addOns.map((a) => (
              <div key={a.itemId} className="mt-1 flex justify-between text-[var(--color-muted)]">
                <span>+ {a.name}</span>
                <span>{formatPrice(a.variations[0]?.priceCents ?? 0)}</span>
              </div>
            ))}
          </div>
        ))}
        <div className="mt-1 text-[var(--color-muted)]">
          {isFourHandsRequest ? "Preferred time: " : ""}
          {formatDateTime(slot.startAt)}
        </div>
        {!isFourHandsRequest && (
          <div className="mt-2 flex justify-between border-t border-[var(--color-accent-border-soft)] pt-2 font-semibold text-[var(--color-ink)]">
            <span>Total</span>
            <span>{formatPrice(flow.totalCents)}</span>
          </div>
        )}
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

      {welcomeBackMessage && (
        <div className="mt-4 rounded-[var(--radius-lg)] border-2 border-[var(--color-accent)] bg-[var(--color-accent-tint-2)] p-3.5 text-sm font-medium text-[var(--color-accent-dark)]">
          {welcomeBackMessage}
        </div>
      )}

      {/* SMS opt-in: unchecked by default, plain-language, no dark patterns — required for CA/TCPA
          compliant marketing consent. Purely optional, never blocks booking. Styled to actually
          invite a yes (badge, benefit-led copy that changes once checked) rather than just
          sitting there as a bare checkbox. Skipped entirely once we already have consent on file. */}
      {!returningCustomerConfirmed?.hasSmsOptIn && (
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
      )}

      {!isFourHandsRequest && (
        <>
          {/* Cancellation policy: required to book, matching the $25 no-show/late-cancellation
              policy the card on file protects against. Kept as a plain checkbox, distinct from
              the SMS opt-in's highlighted card treatment above — this one's a required formality,
              not something we want competing for attention with the SMS opt-in we actually want
              visitors to notice and click. */}
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
        </>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="mt-5 w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-base font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
      >
        {submitting
          ? "Submitting…"
          : isFourHandsRequest
            ? "Submit Request"
            : `Confirm & Book — ${formatPrice(flow.totalCents)}`}
      </button>

      {showPolicy && <CancellationPolicyModal onClose={() => setShowPolicy(false)} />}
    </form>
  );
}
