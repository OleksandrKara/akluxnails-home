"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import GoogleLogo from "./GoogleLogo";
import { GOOGLE_REVIEW_COUNT, GOOGLE_REVIEW_RATING, LOCATION } from "@/lib/siteData";

/** Small floating Google rating badge, bottom left (owner 2026-10-15, like pmu-annakara.com's):
 * the real rating and review count from lib/siteData, linking to the Google profile. Hidden on
 * first paint and fades in once the visitor scrolls (a badge over the hero reads as a pop-up),
 * hidden again near the footer (it would sit on its links), and on phones while the homepage's
 * sticky booking bar is up, which shows the same rating itself. Not on /card and /vip. */
export default function ReviewBadge() {
  const pathname = usePathname() ?? "/";
  const [visible, setVisible] = useState(false);
  const hidden = ["/card", "/vip"].some((p) => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    function onScroll() {
      const pastTop = window.scrollY > 80;
      const nearFooter = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight) < 400;
      const barUp =
        !!document.querySelector('[data-sticky-book-bar="visible"]') && window.matchMedia("(max-width: 639px)").matches;
      setVisible(pastTop && !nearFooter && !barUp);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  if (hidden) return null;
  return (
    <a
      href={LOCATION.googleProfileUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Rated ${GOOGLE_REVIEW_RATING} from ${GOOGLE_REVIEW_COUNT} Google reviews`}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      style={{ bottom: "calc(16px + env(safe-area-inset-bottom, 0px))", fontFamily: "var(--font-body)" }}
      className={`v4-theme fixed left-4 z-40 flex items-center gap-2.5 rounded-full bg-white py-2 pl-2.5 pr-4 shadow-[0_8px_24px_rgba(31,22,32,0.18)] ring-1 ring-black/5 transition-all duration-500 ease-out motion-reduce:!translate-y-0 print:hidden ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[#faf8f6]">
        <GoogleLogo size={20} />
      </span>
      <span className="leading-tight">
        <span className="flex items-center gap-1">
          <span className="text-[16px] font-bold text-[var(--color-ink)]">{GOOGLE_REVIEW_RATING}</span>
          <span className="text-[14px] text-[var(--color-gold)]">★</span>
        </span>
        <span className="block text-[11px] text-[var(--color-muted-2)]">{GOOGLE_REVIEW_COUNT} Google reviews</span>
      </span>
    </a>
  );
}
