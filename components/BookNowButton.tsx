"use client";

import { BOOKING_URL } from "@/lib/siteData";

/** Links out to the existing, already-live mani.akluxnails.com booking funnel — no duplicate
 * Square integration on this page (see the plan: booking stays a single, well-tested funnel).
 * Fires a best-effort, non-blocking click event before navigating; never delays the click.
 */
export default function BookNowButton({ className, children }: { className?: string; children: React.ReactNode }) {
  function onClick() {
    try {
      navigator.sendBeacon?.("/api/track-click", JSON.stringify({ target: "book_now" }));
    } catch {
      // best-effort only — never block navigation on this
    }
  }

  return (
    <a href={BOOKING_URL} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
