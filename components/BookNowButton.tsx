"use client";

import { useBookingModal } from "./booking/BookingModalProvider";
import type { Preselection } from "./booking/useBookingFlow";

/** Opens this page's own native booking flow (services/add-ons, date/time, contact, card-on-file
 * for no-show protection) — unlike mani.akluxnails.com's ads funnel, this page's mostly-returning
 * audience books here directly rather than being sent to a separate site. Pass `preselection` to
 * jump straight to the date/time step for a specific service (e.g. clicking a service card).
 */
export default function BookNowButton({
  className,
  children,
  preselection,
}: {
  className?: string;
  children: React.ReactNode;
  preselection?: Preselection;
}) {
  const { open } = useBookingModal();

  function onClick() {
    try {
      navigator.sendBeacon?.("/api/track-click", JSON.stringify({ target: "book_now" }));
    } catch {
      // best-effort only — never block opening the modal on this
    }
    open(preselection);
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
