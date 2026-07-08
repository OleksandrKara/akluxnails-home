"use client";

import { useBookingModal } from "./booking/BookingModalProvider";

/** Opens this page's own native booking flow (services/add-ons, date/time, contact, card-on-file
 * for no-show protection) — unlike mani.akluxnails.com's ads funnel, this page's mostly-returning
 * audience books here directly rather than being sent to a separate site.
 */
export default function BookNowButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = useBookingModal();

  function onClick() {
    try {
      navigator.sendBeacon?.("/api/track-click", JSON.stringify({ target: "book_now" }));
    } catch {
      // best-effort only — never block opening the modal on this
    }
    open();
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
