"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BookNowButton from "../BookNowButton";
import MessageIcon from "../icons/MessageIcon";
import { BUSINESS_NAME, LOCATION } from "@/lib/siteData";

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#why-choose-us", label: "Why Us" },
  { href: "#reviews", label: "Reviews" },
  { href: "#gift-cards", label: "Gift Cards" },
  { href: "#location", label: "Location" },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          transition: "opacity 150ms ease, transform 150ms ease",
          transformOrigin: "center",
        }}
        opacity={open ? 0 : 1}
      />
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          transition: "opacity 150ms ease",
          position: "absolute",
        }}
        opacity={open ? 1 : 0}
      />
    </svg>
  );
}

/** Floating frosted-glass pill nav over the hero photo (matches svitnail.com's treatment) — stays
 * the same rounded, translucent pill at every scroll position, just gaining a subtle shadow once
 * scrolled for a bit of depth against the page behind it. Same plain passive-scroll-listener
 * technique StickyBookBar already uses elsewhere on this page, not a new pattern.
 *
 * The nav sits in a flex-1 middle column between the logo and the Book Now/hamburger group, and
 * centers its own links within that column — so it's always equidistant from the logo and from
 * the button group, regardless of how wide either of those is, rather than just being whatever's
 * left over after a plain justify-between (which does not guarantee that).
 *
 * On mobile the inline nav (desktop-only, md:flex) is replaced by a hamburger button next to a
 * Book Now button — previously there was no way at all to reach these links on a phone. The
 * hamburger opens a dropdown panel with the same links; Book Now already sits right next to the
 * hamburger at all times, so repeating it inside the panel too would be redundant — instead the
 * panel ends with a lower-key "Text Us" option (same SMS link as StickyBookBar) for anyone with a
 * custom request or a group booking who'd rather just message the salon directly. */
export default function HeaderV4() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Closing on route-less anchor navigation: a link click still fires this before the browser
  // jumps to the section, so the panel is already gone by the time the user sees it scroll.
  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* Backdrop — click anywhere outside the panel to close, no scroll-lock needed since this
          is a small dropdown, not a full-screen takeover. Rendered before (so it stacks behind)
          the topbar/panel below, which both get relative+z-10 to stay clickable above it. */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden"
          onClick={closeMenu}
          aria-hidden
        />
      )}

      {/* Outer wrapper carries the inset-from-viewport-edge margin; the inner pill carries
          mx-auto to additionally center within that inset area on screens wider than max-w-6xl.
          Keeping both concerns on one element doesn't work — margin utilities on the same element
          just override each other, they don't combine — so a fixed inset and "also center once
          there's extra room" need two separate boxes. */}
      <div className="relative z-10 mx-4 mt-4 sm:mx-6 sm:mt-6">
        <div
          className={`mx-auto flex max-w-6xl items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 text-white backdrop-blur-md transition-shadow duration-300 sm:gap-4 sm:px-5 ${
            scrolled ? "shadow-lg" : ""
          }`}
        >
          <span className="flex shrink-0 items-center py-1" aria-label={BUSINESS_NAME}>
            <Image
              src="/images/logo.png"
              alt={BUSINESS_NAME}
              width={465}
              height={100}
              className="h-7 w-auto brightness-0 invert sm:h-8"
              priority
            />
          </span>

          <nav
            className="hidden flex-1 items-center justify-center gap-6 text-xs font-bold tracking-[0.12em] text-white/85 uppercase md:flex"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>

          {/* Visible at every breakpoint now — a mobile visitor gets Book Now + the hamburger
              side by side, not just the hamburger; the panel below still repeats Book Now for
              anyone who opens the menu to browse first. */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <BookNowButton className="shrink-0 rounded-full bg-[var(--color-accent)] px-3 py-2 text-xs font-bold tracking-[0.1em] text-[var(--color-ink)] uppercase transition hover:bg-[var(--color-accent-hover)] sm:px-5 sm:py-2.5 sm:tracking-[0.12em]">
              Book Now
            </BookNowButton>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 md:hidden"
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`relative z-10 mx-4 overflow-hidden transition-[max-height,opacity] duration-300 md:hidden ${
          menuOpen ? "mt-2 max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav
          className="flex flex-col gap-1 rounded-3xl border border-white/15 bg-[#1f1620]/95 p-4 text-white shadow-xl backdrop-blur-md"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="rounded-xl px-3 py-2.5 text-sm font-bold tracking-[0.08em] text-white/85 uppercase transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-3 border-t border-white/10 pt-3">
            <a
              href={LOCATION.smsHref}
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-xs font-bold tracking-[0.08em] text-white/80 uppercase transition hover:bg-white/10 hover:text-white"
            >
              <MessageIcon />
              Text Us
            </a>
            <p className="mt-1.5 px-1 text-center text-[11px] leading-snug text-white/45">
              Special request or group booking? We reply fast.
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}
