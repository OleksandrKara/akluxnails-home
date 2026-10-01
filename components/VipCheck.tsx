"use client";

import { useEffect, useState } from "react";
import { useBookingModal } from "./booking/BookingModalProvider";
import type { VerifiedPromo } from "./booking/types";
import { LOCATION } from "@/lib/siteData";
import { formatCountdown, vipLatestStartMs } from "@/lib/promoDisplay";

/**
 * The /vip page body (owner request 2026-10-01). Artists hand every client a card after the visit:
 * "VIP perk: $10 off your next visit when you book it today". The client scans the QR, types the
 * phone number they booked with, and salaryReview checks for a visit today (see
 * app/api/vip/check). One card for everyone: the result is personalized instead (first name,
 * returning vs. first visit, today's artist preselected in the booking flow).
 *
 * The short "checking" sequence is real work (the lookup takes a moment anyway); it's held to a
 * minimum length only so the steps can be read, never faked into a longer wait.
 */

type Result =
  | {
      eligible: true;
      promo: VerifiedPromo;
      givenName: string | null;
      technicianName: string | null;
      teamMemberId: string | null;
      newClient: boolean;
    }
  | { eligible: false; reason: "no_visit_today" | "invalid_phone" | "rate_limited" | "error" };

const STEPS = ["Finding your profile", "Checking today's visit", "Unlocking your perk"];
const MIN_CHECK_MS = 1800;

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").replace(/^1(?=\d{10})/, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function lastDayLabel(promo: VerifiedPromo): string {
  return new Date(vipLatestStartMs(promo.expEpochSeconds) - 1).toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function track(event: string, params: Record<string, string | boolean> = {}) {
  try {
    window.gtag?.("event", event, params);
  } catch {
    // analytics is best-effort
  }
}

export default function VipCheck() {
  const { openWithPromo, open } = useBookingModal();
  const [phone, setPhone] = useState("");
  const [checking, setChecking] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const digits = phone.replace(/\D/g, "");
  const phoneComplete = digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));

  useEffect(() => {
    if (!checking) return;
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), MIN_CHECK_MS / STEPS.length);
    return () => clearInterval(timer);
  }, [checking]);

  useEffect(() => {
    if (!result?.eligible) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [result]);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneComplete || checking) return;
    setChecking(true);
    setStep(0);
    setResult(null);
    const started = Date.now();
    let next: Result;
    try {
      const res = await fetch("/api/vip/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: digits }),
      });
      next = await res.json();
    } catch {
      next = { eligible: false, reason: "error" };
    }
    const wait = MIN_CHECK_MS - (Date.now() - started);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    setChecking(false);
    setNow(Date.now());
    setResult(next);
    track("vip_check", next.eligible ? { eligible: true, new_client: next.newClient } : { eligible: false, reason: next.reason });
  }

  function book() {
    if (!result?.eligible) return;
    track("vip_book_click");
    openWithPromo(result.promo, result.teamMemberId);
  }

  function reset() {
    setResult(null);
    setPhone("");
  }

  const expired = result?.eligible ? now >= result.promo.expEpochSeconds * 1000 : false;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-card)] shadow-[0_10px_40px_rgba(42,33,29,0.10)] ring-1 ring-[var(--color-accent-border-soft)]">
        <div className="bg-[var(--color-accent-tint-2)] px-6 pb-6 pt-7 text-center">
          <span className="inline-block rounded-full bg-[var(--color-card)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)] ring-1 ring-[var(--color-accent-border-soft)]">
            VIP perk
          </span>
          <h1 className="mt-4 text-3xl leading-tight text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
            $10 off your next visit
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
            Book your next visit today, for any day in the next 4 weeks, and get $10 off any service $99+.
          </p>
        </div>

        <div className="px-6 py-6">
          {checking ? (
            <div aria-live="polite">
              <ul className="space-y-3">
                {STEPS.map((label, i) => (
                  <li key={label} className={`flex items-center gap-3 text-sm transition-opacity ${i <= step ? "opacity-100" : "opacity-35"}`}>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                        i < step
                          ? "bg-[var(--color-accent)] text-white"
                          : "ring-2 ring-[var(--color-accent-border-soft)]"
                      }`}
                    >
                      {i < step ? (
                        "✓"
                      ) : i === step ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
                      ) : null}
                    </span>
                    <span className="text-[var(--color-ink)]">{label}…</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : result?.eligible ? (
            <div aria-live="polite" className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-xl text-white" aria-hidden>
                ✓
              </div>
              <h2 className="mt-4 text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
                {result.newClient
                  ? `Thank you for your first visit${result.givenName ? `, ${result.givenName}` : ""}!`
                  : `Welcome back${result.givenName ? `, ${result.givenName}` : ""}!`}
              </h2>
              {expired ? (
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  This perk ended at midnight. We&apos;d still love to see you again.
                </p>
              ) : (
                <>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                    Your VIP perk is unlocked: <span className="font-semibold text-[var(--color-ink)]">$10 off</span> your next visit
                    ($99+), for any day through {lastDayLabel(result.promo)}. Already applied, no code needed.
                    {result.technicianName && (
                      <>
                        {" "}
                        We&apos;ll preselect <span className="font-semibold text-[var(--color-ink)]">{result.technicianName}</span>,
                        your artist today, if she does the services you choose.
                      </>
                    )}
                  </p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-2)]">Book before midnight</p>
                  <p className="mt-1 font-mono text-2xl tabular-nums text-[var(--color-accent-dark)]">
                    {formatCountdown(result.promo.expEpochSeconds * 1000 - now)}
                  </p>
                </>
              )}
              <button
                type="button"
                onClick={expired ? () => open(undefined, "v4") : book}
                className="mt-5 w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3.5 text-base font-medium text-white hover:bg-[var(--color-accent-hover)]"
              >
                {expired ? "Book a visit" : "Book my next visit"}
              </button>
            </div>
          ) : (
            <>
              {result && (
                <div aria-live="polite" className="mb-5 rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-4 text-sm leading-relaxed text-[var(--color-ink)]">
                  {result.reason === "no_visit_today" ? (
                    <>
                      <p className="font-semibold">We couldn&apos;t find a visit today for this number.</p>
                      <p className="mt-1 text-[var(--color-muted)]">
                        The VIP perk is for booking your next visit on the same day as your appointment. Try the number you booked
                        with, or text us at {LOCATION.phone}{" "}and we&apos;ll help.
                      </p>
                    </>
                  ) : result.reason === "invalid_phone" ? (
                    <p>Please enter a 10-digit US phone number.</p>
                  ) : result.reason === "rate_limited" ? (
                    <p>Too many tries. Please wait a few minutes, or text us at {LOCATION.phone}.</p>
                  ) : (
                    <p>
                      Something went wrong on our side. Please try again, or text us at {LOCATION.phone}{" "}and we&apos;ll apply it
                      for you.
                    </p>
                  )}
                </div>
              )}
              <form onSubmit={check}>
                <label htmlFor="vip-phone" className="block text-sm font-medium text-[var(--color-ink)]">
                  Phone number from your appointment
                </label>
                <input
                  id="vip-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="(619) 555-0123"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="mt-2 w-full rounded-[var(--radius-lg)] bg-[var(--color-card)] px-4 py-3 text-lg tracking-wide text-[var(--color-ink)] ring-1 ring-[var(--color-border)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <button
                  type="submit"
                  disabled={!phoneComplete}
                  className="mt-4 w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3.5 text-base font-medium text-white transition-opacity hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                >
                  Unlock my perk
                </button>
              </form>
              {result && (
                <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
                  <a href={LOCATION.smsHref} className="font-semibold text-[var(--color-accent)] underline underline-offset-2">
                    Text us
                  </a>
                  <button type="button" onClick={reset} className="text-[var(--color-muted)] underline underline-offset-2">
                    Clear
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <p className="mx-auto mt-5 max-w-sm text-center text-xs leading-relaxed text-[var(--color-muted-2)]">
        The $10 comes off at checkout for services $99 and up, booked today for a visit within 4 weeks.
      </p>
    </div>
  );
}
