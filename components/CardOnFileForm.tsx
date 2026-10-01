"use client";

import { useState } from "react";
import Link from "next/link";
import { useSquareCard } from "./booking/useSquarePayments";
import CancellationPolicyModal from "./booking/CancellationPolicyModal";
import { friendlyTokenizeErrorMessage } from "@/lib/square/tokenizeErrors";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { CARD_AUTHORIZATION_TEXT, CARD_AUTHORIZATION_VERSION, LOCATION } from "@/lib/siteData";

/**
 * The akluxnails.com/card form (owner request 2026-10-01). What keeps it safe and fair:
 *  - card number, expiry, CVV and ZIP are typed into Square's own secure field (an iframe), so
 *    they never touch our page's code or server, only a one-time token does;
 *  - the fee, when it applies and how to remove the card are stated before the card field, and the
 *    authorization is a separate, unchecked checkbox the client has to tick themselves;
 *  - after saving, the client sees what they agreed to and which card (brand + last 4), so they
 *    can screenshot it for their records.
 */

const CARD_CONTAINER_ID = "card-on-file-container";

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").replace(/^1(?=\d{10})/, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const inputClass =
  "mt-1.5 w-full rounded-[var(--radius-lg)] bg-[var(--color-card)] px-4 py-3 text-base text-[var(--color-ink)] ring-1 ring-[var(--color-border)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]";

export default function CardOnFileForm() {
  const { card, error: sdkError } = useSquareCard(CARD_CONTAINER_ID);
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ brand: string | null; last4: string | null; at: string } | null>(null);

  const digits = phone.replace(/\D/g, "");
  const ready = Boolean(card) && givenName.trim() && familyName.trim() && digits.length === 10 && authorized;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!card || !ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const tokenResult = await card.tokenize({
        billingContact: {
          givenName: givenName.trim(),
          familyName: familyName.trim(),
          email: email.trim() || undefined,
          phone: digits,
          countryCode: "US",
        },
        intent: "STORE",
        customerInitiated: true,
        sellerKeyedIn: false,
      });
      if (tokenResult.status !== "OK" || !tokenResult.token) {
        throw new Error(friendlyTokenizeErrorMessage(tokenResult.errors));
      }
      // No automatic retry: a save that timed out may still have gone through, and the token is
      // single-use anyway. The client can simply press the button again.
      const res = await fetchWithTimeout("/api/card-on-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          givenName,
          familyName,
          phoneNumber: digits,
          email,
          sourceId: tokenResult.token,
          authorized: true,
          authorizationVersion: CARD_AUTHORIZATION_VERSION,
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "This card couldn't be saved. Please double-check the details or try a different card.");
      }
      setSaved({
        brand: data.brand ?? null,
        last4: data.last4 ?? null,
        at: new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" }),
      });
      try {
        window.gtag?.("event", "card_on_file_saved");
      } catch {
        // analytics is best-effort
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    const brand = saved.brand ? saved.brand.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "Card";
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[var(--radius-xl)] bg-[var(--color-card)] p-6 text-center shadow-[0_10px_40px_rgba(42,33,29,0.10)] ring-1 ring-[var(--color-accent-border-soft)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success)] text-xl text-white" aria-hidden>
            ✓
          </div>
          <h1 className="mt-4 text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
            You&apos;re all set, {givenName.trim()}!
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
            {brand}
            {saved.last4 ? ` ending in ${saved.last4}` : ""} is saved for your appointments. Nothing was charged.
          </p>
          <div className="mt-5 rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-4 text-left text-xs leading-relaxed text-[var(--color-ink)]">
            <p className="font-semibold">What you agreed to ({saved.at}):</p>
            <p className="mt-1 text-[var(--color-muted)]">{CARD_AUTHORIZATION_TEXT}</p>
          </div>
          <p className="mt-4 text-xs text-[var(--color-muted-2)]">Feel free to take a screenshot for your records.</p>
          <Link href="/" className="mt-5 inline-block text-sm font-semibold text-[var(--color-accent)] underline underline-offset-2">
            Back to akluxnails.com
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <form
        onSubmit={submit}
        className="overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-card)] shadow-[0_10px_40px_rgba(42,33,29,0.10)] ring-1 ring-[var(--color-accent-border-soft)]"
      >
        <div className="bg-[var(--color-accent-tint-2)] px-6 pb-6 pt-7 text-center">
          <span className="inline-block rounded-full bg-[var(--color-card)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)] ring-1 ring-[var(--color-accent-border-soft)]">
            Card on file
          </span>
          <h1 className="mt-4 text-3xl leading-tight text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
            Secure your appointment
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
            Nothing is charged today. Your card is only charged a <span className="font-semibold text-[var(--color-ink)]">$25 fee</span>{" "}if
            you miss your appointment or cancel with less than 24 hours&apos; notice.
          </p>
          <button
            type="button"
            onClick={() => setShowPolicy(true)}
            className="mt-2 text-xs font-semibold text-[var(--color-accent-dark)] underline underline-offset-2"
          >
            Read the full Cancellation Policy
          </button>
        </div>

        <div className="space-y-4 px-6 py-6">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-[var(--color-ink)]">
              First name
              <input className={inputClass} value={givenName} onChange={(e) => setGivenName(e.target.value)} autoComplete="given-name" required />
            </label>
            <label className="block text-sm font-medium text-[var(--color-ink)]">
              Last name
              <input className={inputClass} value={familyName} onChange={(e) => setFamilyName(e.target.value)} autoComplete="family-name" required />
            </label>
          </div>
          <label className="block text-sm font-medium text-[var(--color-ink)]">
            Phone number you booked with
            <input
              className={inputClass}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(619) 555-0123"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              required
            />
          </label>
          <label className="block text-sm font-medium text-[var(--color-ink)]">
            Email <span className="font-normal text-[var(--color-muted-2)]">(optional)</span>
            <input className={inputClass} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {/* Honeypot: hidden from people and screen readers, bots tend to fill it in. */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="absolute left-[-9999px] h-px w-px opacity-0"
          />

          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">Card</p>
            <div className="mt-1.5" id={CARD_CONTAINER_ID} />
            <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted-2)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 018 0v4" />
              </svg>
              Secured by Square. We never see or store your full card number.
            </p>
          </div>

          <label className="flex cursor-pointer gap-3 rounded-[var(--radius-lg)] p-3 text-xs leading-relaxed text-[var(--color-ink)] ring-1 ring-[var(--color-border)]">
            <input
              type="checkbox"
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
            />
            <span>{CARD_AUTHORIZATION_TEXT}</span>
          </label>

          {sdkError && <p className="text-sm text-red-600">{sdkError}</p>}
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!ready || submitting}
            className="w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3.5 text-base font-medium text-white transition-opacity hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save my card"}
          </button>
          <p className="text-center text-xs leading-relaxed text-[var(--color-muted-2)]">
            Your bank may briefly show a $0 verification. That&apos;s not a charge. Questions? Text us at {LOCATION.phone}
            {". "}
            <Link href="/privacy-policy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
          </p>
        </div>
      </form>
      {showPolicy && <CancellationPolicyModal onClose={() => setShowPolicy(false)} />}
    </div>
  );
}
