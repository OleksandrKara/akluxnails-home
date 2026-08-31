"use client";

import { useEffect, useState } from "react";
import { useBookingModal } from "./booking/BookingModalProvider";
import { useIsV4Theme } from "./v4/V4ThemeContext";
import { formatCountdown } from "@/lib/promoDisplay";

const COPY: Record<string, { eyebrow: string; headline: string; body: string; cta: string }> = {
  REBOOK10: {
    eyebrow: "Reserved for you",
    headline: "$10 off, saved just for you",
    body: "Your visits mean so much to us — and to your nail artist. Book before midnight tonight and we'll take $10 off any service $99+. Already applied, no code needed.",
    cta: "Claim my $10",
  },
  WINBACK5: {
    eyebrow: "We've missed you",
    headline: "$5 off, welcome back",
    body: "It's been a little while, but you're still one of ours. Book before midnight tonight and get $5 off any service $99+. Already applied — just pick your time.",
    cta: "Claim my $5",
  },
};

/**
 * First-load popup for the same-day-rebooking / lapsed-customer-winback promo links (see
 * openspec/changes/same-day-rebooking-discount and lapsed-customer-winback-automation). The
 * persistent top bar (RebookingPromoBanner) is easy to miss on a phone, especially scrolled past
 * in a hurry — this makes the time-limited offer the first thing a visitor sees, with a direct
 * path into the booking flow. Closing it still leaves the top banner running as a reminder, so the
 * offer doesn't just vanish.
 *
 * Deliberately styled as a personal, boutique-feeling note (serif headline, restrained gold/ink
 * palette pulled from the site's own tokens, outlined rather than block-filled countdown) instead
 * of a discount-coupon flyer — the copy leans on "we noticed you" rather than a generic "VIP"
 * badge, since this link only ever reaches someone who either just visited (same-day-rebooking) or
 * is a lapsed regular (winback), both of which are already true, specific reasons to feel valued.
 *
 * Shown at most once per browser tab session per (code, expiry) pair (sessionStorage), and never
 * for a link that's already expired by the time this mounts — RebookingPromoBanner already covers
 * that "sorry, this one's gone" state on its own, a fresh visitor shouldn't be pitched an offer
 * that's already dead.
 */
export default function RebookingPromoModal({
  expEpochSeconds,
  code,
}: {
  expEpochSeconds: number;
  code: string;
}) {
  const { open } = useBookingModal();
  const isV4 = useIsV4Theme();
  const [visible, setVisible] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const expiresAtMs = expEpochSeconds * 1000;
  const copy = COPY[code] ?? COPY.REBOOK10;

  // Brief delay before showing — a page that pops something up the instant it paints feels like
  // an ad interstitial; letting the hero render first and the popup arrive a beat later reads as
  // a deliberate, considered moment instead.
  useEffect(() => {
    if (Date.now() >= expiresAtMs) return;
    const storageKey = `promoModalShown:${code}:${expEpochSeconds}`;
    if (sessionStorage.getItem(storageKey)) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem(storageKey, "1");
      setVisible(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [code, expEpochSeconds, expiresAtMs]);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;
  // Ticked past expiry while sitting open (or right on the delay boundary) — quietly drop it
  // rather than showing a countdown reading 00:00 with a "claim" CTA for a dead offer.
  if (now >= expiresAtMs) return null;

  function handleBook() {
    try {
      navigator.sendBeacon?.("/api/track-click", JSON.stringify({ target: "promo_modal_book" }));
    } catch {
      // best-effort only — never block opening the modal on this
    }
    setVisible(false);
    open(undefined, isV4 ? "v4" : undefined);
  }

  return (
    <div
      className="promo-modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-modal-headline"
      onClick={() => setVisible(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="promo-modal-card relative w-full max-w-sm overflow-hidden rounded-t-[var(--radius-xl)] bg-[var(--color-card)] shadow-2xl sm:rounded-[var(--radius-xl)]"
      >
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
        >
          ×
        </button>

        <div className="px-7 pt-9 pb-1 text-center">
          <p
            className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--color-accent-dark)" }}
          >
            <span aria-hidden>✦</span>
            {copy.eyebrow}
            <span aria-hidden className="text-sm not-italic normal-case">
              🎉
            </span>
          </p>
          <p
            id="promo-modal-headline"
            className="mt-3 text-[1.65rem] leading-[1.25] text-[var(--color-ink)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {copy.headline}
          </p>
        </div>

        <div className="px-7 pt-3 pb-7">
          <p className="text-center text-sm leading-relaxed text-[var(--color-muted)]">{copy.body}</p>

          <div
            className="mt-5 flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm"
            style={{ borderColor: "var(--color-accent-border-soft)" }}
          >
            <span aria-hidden>⏳</span>
            <span className="text-[var(--color-muted)]">Expires in</span>
            <span className="font-mono text-base font-semibold tabular-nums text-[var(--color-ink)]">
              {formatCountdown(expiresAtMs - now)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleBook}
            className="promo-modal-cta mt-5 w-full rounded-full py-3.5 text-base font-semibold text-white shadow-lg transition-transform active:scale-[0.97]"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            {copy.cta} →
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="mt-3 w-full text-center text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:underline"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
