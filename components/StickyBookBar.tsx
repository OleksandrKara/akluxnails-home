"use client";

import { useEffect, useState } from "react";
import BookNowButton from "./BookNowButton";
import GoogleLogo from "./GoogleLogo";
import { GOOGLE_REVIEW_COUNT, GOOGLE_REVIEW_RATING, LOCATION } from "@/lib/siteData";
import { useIsV4Theme } from "./v4/V4ThemeContext";

/** A persistent mobile-only booking CTA that appears once the visitor scrolls past the hero's
 * own "Book Your Appointment" button — keeps the highest-intent action reachable with one tap no
 * matter how far down the page someone has scrolled, without competing with the hero CTA.
 *
 * 2026-10-15 (owner): one way to message us, not two. The bar's own Text icon is gone; the
 * floating chat button (components/ChatBubble.tsx) docks into the space on the right of this bar
 * while it's showing (it looks for `data-sticky-book-bar="visible"`). On the left, the real Google
 * rating, for trust right next to the button (the floating ReviewBadge hides while this is up). */
export default function StickyBookBar() {
  const [visible, setVisible] = useState(false);
  const isV4 = useIsV4Theme();

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 500);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      data-sticky-book-bar={visible ? "visible" : "hidden"}
      className={`fixed inset-x-0 bottom-0 z-30 flex items-center gap-2.5 border-t border-[var(--color-border)] bg-[var(--color-card)]/95 py-3 pl-3 pr-[80px] backdrop-blur transition-transform duration-200 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
    >
      <a
        href={LOCATION.googleProfileUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Rated ${GOOGLE_REVIEW_RATING} from ${GOOGLE_REVIEW_COUNT} Google reviews`}
        className="flex shrink-0 flex-col items-center leading-none"
      >
        <span className="flex items-center gap-1">
          <GoogleLogo size={16} />
          <span className="text-[15px] font-bold text-[var(--color-ink)]">{GOOGLE_REVIEW_RATING}</span>
          <span className="text-[13px] text-[var(--color-gold)]">★</span>
        </span>
        <span className="mt-1 text-[10px] text-[var(--color-muted-2,#6b6b63)]">{GOOGLE_REVIEW_COUNT} reviews</span>
      </a>
      <BookNowButton
        className={
          isV4
            ? "block flex-1 rounded-full bg-[var(--color-accent)] py-3 text-center text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--color-ink)] hover:bg-[var(--color-accent-hover)]"
            : "block flex-1 rounded-[var(--radius-pill)] bg-[var(--color-accent)] py-3 text-center text-base font-medium text-white hover:bg-[var(--color-accent-hover)]"
        }
      >
        <span className="whitespace-nowrap max-[379px]:hidden">Book Appointment</span>
        <span className="whitespace-nowrap min-[380px]:hidden">Book Now</span>
      </BookNowButton>
    </div>
  );
}
