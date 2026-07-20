"use client";

import { useState } from "react";
import type { BookingFlow } from "../useBookingFlow";
import { googleCalendarUrl, icsDataUrl } from "../calendarLinks";
import { FOUR_HANDS_DISPLAY_PRICE_CENTS, FOUR_HANDS_REQUEST_ITEM_NAME } from "@/lib/services-config";
import { useSquareCard } from "../useSquarePayments";
import { friendlyTokenizeErrorMessage } from "@/lib/square/tokenizeErrors";
import ShieldCheckIcon from "@/components/icons/ShieldCheckIcon";
import { CARD_STEP_GUARANTEE_BODY, CARD_STEP_GUARANTEE_HEADLINE } from "@/lib/siteData";

const CARD_CONTAINER_ID = "sq-card-container";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function GoogleCalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

function CalendarDownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 2.5v3.5M16 2.5v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 12v5m0 0l-2.2-2.2M12 17l2.2-2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The card-on-file ask, deferred here from DetailsStep so booking itself never requires one —
 * even a customer who never completes this still has a real, staff-visible appointment. Framed as
 * the expected next step (not "optional"/skippable via any dedicated affordance): no skip link,
 * strong "we're holding your spot" copy. It's still not a hard gate — the Done button and calendar
 * links below always work regardless, and closing the modal without adding a card leaves the
 * appointment fully intact. */
function SecureAppointmentCard({
  customerId,
  givenName,
  familyName,
  phoneNumber,
  emailAddress,
  onSecured,
}: {
  customerId: string;
  givenName: string;
  familyName: string;
  phoneNumber: string;
  emailAddress: string;
  onSecured: () => void;
}) {
  const { card, error: sdkError } = useSquareCard(CARD_CONTAINER_ID);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secured, setSecured] = useState(false);

  async function handleAddCard() {
    if (!card) return;
    setSubmitting(true);
    setError(null);
    try {
      const tokenResult = await card.tokenize({
        billingContact: { givenName, familyName, email: emailAddress || undefined, phone: phoneNumber, countryCode: "US" },
        intent: "STORE",
        customerInitiated: true,
        sellerKeyedIn: false,
      });
      if (tokenResult.status !== "OK" || !tokenResult.token) {
        throw new Error(friendlyTokenizeErrorMessage(tokenResult.errors));
      }

      const cardRes = await fetch("/api/booking/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: tokenResult.token, customerId, cardholderName: `${givenName} ${familyName}`.trim() }),
      });
      if (!cardRes.ok) {
        const { error: apiError } = await cardRes.json().catch(() => ({ error: null }));
        throw new Error(apiError ?? "This card couldn't be saved. Please double-check the details or try a different card.");
      }
      setSecured(true);
      onSecured();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (secured) {
    return (
      <div className="mt-5 flex items-center gap-3 rounded-[var(--radius-lg)] border-2 border-[var(--color-success)] bg-[var(--color-success-bg)] p-4 text-left">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-xl text-white">
          ✓
        </span>
        <span>
          <span className="block text-base font-bold leading-tight text-[var(--color-ink)]">You&apos;re fully secured!</span>
          <span className="mt-0.5 block text-sm text-[var(--color-muted)]">Thanks for adding a card — see you soon.</span>
        </span>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-[var(--radius-lg)] border-2 border-[var(--color-accent)] bg-[var(--color-accent-tint-2)] p-4 text-left">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
          <ShieldCheckIcon size={24} />
        </span>
        <span>
          <span className="block text-base font-bold leading-tight text-[var(--color-accent-dark)]">
            Secure Your Appointment
          </span>
          <span className="mt-0.5 block text-sm text-[var(--color-ink)]">
            Add a card per our cancellation policy — we&apos;re holding your spot!
          </span>
        </span>
      </div>

      <div className="mt-3">
        <div id={CARD_CONTAINER_ID} />
      </div>
      {sdkError && <p className="mt-2 text-sm text-red-600">{sdkError}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleAddCard}
        disabled={!card || submitting}
        className="mt-3 w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Confirm My Card"}
      </button>

      {/* Secondary reassurance right where the card ask is — the quality guarantee reinforces the
          security ask instead of competing with it for attention. */}
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        <strong className="text-[var(--color-accent-dark)]">{CARD_STEP_GUARANTEE_HEADLINE}:</strong> {CARD_STEP_GUARANTEE_BODY}
      </p>
    </div>
  );
}

export default function DoneStep({ flow, onClose }: { flow: BookingFlow; onClose: () => void }) {
  const { selectedServices, slot, technicianName, customerId, hasCardOnFile, contact } = flow.state;
  if (selectedServices.length === 0 || !slot) return null;

  const isFourHandsRequest =
    selectedServices.length === 1 && selectedServices[0].service.name === FOUR_HANDS_REQUEST_ITEM_NAME;
  const showSecureCard = !isFourHandsRequest && Boolean(customerId) && !hasCardOnFile;

  const title = isFourHandsRequest
    ? "4-Hand Appointment Request at AK.LUX.NAILS"
    : `${selectedServices.map((sel) => sel.service.name).join(" + ")} at AK.LUX.NAILS`;
  const description = [
    ...selectedServices.map((sel) => sel.service.name),
    ...selectedServices.flatMap((sel) => sel.addOns.map((a) => `+ ${a.name}`)),
    technicianName ? `With ${technicianName}` : null,
    isFourHandsRequest ? `Estimated price: ${formatPrice(FOUR_HANDS_DISPLAY_PRICE_CENTS)}` : `Total: ${formatPrice(flow.totalCents)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const totalDurationMinutes = slot.segments.reduce((sum, seg) => sum + seg.durationMinutes, 0);
  const calendarEvent = { title, startAt: slot.startAt, durationMinutes: totalDurationMinutes || 60, description };

  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success-bg)] text-2xl text-[var(--color-success)]">
        ✓
      </div>
      <h3 className="mt-3 text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        {isFourHandsRequest ? "Request received!" : "You're booked!"}
      </h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {isFourHandsRequest
          ? "We'll contact you to confirm the exact time works for two technicians."
          : "We'll text or email you a confirmation shortly."}
      </p>

      {/* Right up top, no scrolling needed — this is the action people actually come back for. */}
      {!isFourHandsRequest && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <a
            href={googleCalendarUrl(calendarEvent)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] shadow-sm ring-1 ring-[var(--color-border)] transition hover:shadow-md"
          >
            <GoogleCalendarIcon />
            Google Calendar
          </a>
          <a
            href={icsDataUrl(calendarEvent)}
            download="appointment.ics"
            className="flex items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] shadow-sm ring-1 ring-[var(--color-border)] transition hover:shadow-md"
          >
            <CalendarDownloadIcon />
            Download .ics
          </a>
        </div>
      )}

      <dl className="mt-5 space-y-2 rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-4 text-left text-sm">
        {selectedServices.map((sel) => (
          <div key={sel.service.itemId}>
            <div className="flex justify-between">
              <dt className="text-[var(--color-muted)]">Service</dt>
              <dd className="text-[var(--color-ink)]">{sel.service.name}</dd>
            </div>
            {sel.addOns.map((a) => (
              <div key={a.itemId} className="flex justify-between">
                <dt className="text-[var(--color-muted)]">Add-on</dt>
                <dd className="text-[var(--color-ink)]">{a.name}</dd>
              </div>
            ))}
          </div>
        ))}
        {technicianName && (
          <div className="flex justify-between">
            <dt className="text-[var(--color-muted)]">With</dt>
            <dd className="text-[var(--color-ink)]">{technicianName}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-[var(--color-muted)]">{isFourHandsRequest ? "Preferred time" : "When"}</dt>
          <dd className="text-[var(--color-ink)]">{formatDateTime(slot.startAt)}</dd>
        </div>
        <div className="flex justify-between border-t border-[var(--color-accent-border-soft)] pt-2 font-semibold">
          <dt className="text-[var(--color-ink)]">{isFourHandsRequest ? "Estimated price" : "Total"}</dt>
          <dd className="text-[var(--color-ink)]">
            {formatPrice(isFourHandsRequest ? FOUR_HANDS_DISPLAY_PRICE_CENTS : flow.totalCents)}
          </dd>
        </div>
      </dl>

      {showSecureCard && customerId && (
        <SecureAppointmentCard
          customerId={customerId}
          givenName={contact.givenName}
          familyName={contact.familyName}
          phoneNumber={contact.phoneNumber}
          emailAddress={contact.emailAddress}
          onSecured={flow.cardSecured}
        />
      )}

      <button
        type="button"
        onClick={onClose}
        className="mt-4 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]"
      >
        Done
      </button>
    </div>
  );
}
