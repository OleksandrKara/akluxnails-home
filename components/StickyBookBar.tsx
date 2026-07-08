"use client";

import { useEffect, useState } from "react";
import BookNowButton from "./BookNowButton";

/** A persistent mobile-only booking CTA that appears once the visitor scrolls past the hero's
 * own "Book Your Appointment" button — keeps the highest-intent action reachable with one tap no
 * matter how far down the page someone has scrolled, without competing with the hero CTA. */
export default function StickyBookBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 500);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-card)]/95 p-3 backdrop-blur transition-transform duration-200 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <BookNowButton className="block w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] py-3 text-center text-base font-medium text-white hover:bg-[var(--color-accent-hover)]">
        Book Your Appointment
      </BookNowButton>
    </div>
  );
}
