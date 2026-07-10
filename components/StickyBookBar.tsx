"use client";

import { useEffect, useState } from "react";
import BookNowButton from "./BookNowButton";
import MessageIcon from "./icons/MessageIcon";
import { LOCATION } from "@/lib/siteData";
import { useIsV4Theme } from "./v4/V4ThemeContext";

/** A persistent mobile-only booking CTA that appears once the visitor scrolls past the hero's
 * own "Book Your Appointment" button — keeps the highest-intent action reachable with one tap no
 * matter how far down the page someone has scrolled, without competing with the hero CTA. */
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
      className={`fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-card)]/95 p-3 backdrop-blur transition-transform duration-200 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <BookNowButton className="block flex-1 rounded-[var(--radius-pill)] bg-[var(--color-accent)] py-3 text-center text-base font-medium text-white hover:bg-[var(--color-accent-hover)]">
        Book Your Appointment
      </BookNowButton>
      <a
        href={LOCATION.smsHref}
        aria-label="Text us"
        title="Text us"
        className={
          isV4
            ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            : "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[var(--color-accent)] ring-1 ring-[var(--color-accent-border-soft)] hover:bg-[var(--color-accent-tint-2)]"
        }
      >
        <MessageIcon />
      </a>
    </div>
  );
}
