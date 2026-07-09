import Image from "next/image";
import BookNowButton from "../BookNowButton";
import { BUSINESS_NAME } from "@/lib/siteData";

// Floating frosted-glass pill nav, overlaying the hero photo rather than sitting in its own solid
// bar above it — matches svitnail.com's actual nav treatment (absolute-positioned capsule with
// backdrop blur). Anchors point to this page's own sections (#services etc), not "/#..." like the
// real homepage's Header, since a V4 visitor should stay on V4 when clicking these.
export default function HeaderV4() {
  return (
    <header className="absolute inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-white/15 bg-black/20 px-3 py-2 text-white backdrop-blur-md sm:px-5">
        <span className="flex items-center py-1" aria-label={BUSINESS_NAME}>
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
          className="hidden items-center gap-6 text-xs font-bold tracking-[0.12em] text-white/85 uppercase md:flex"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <a href="#services" className="hover:text-white">Services</a>
          <a href="#why-choose-us" className="hover:text-white">Why Us</a>
          <a href="#reviews" className="hover:text-white">Reviews</a>
          <a href="#gift-cards" className="hover:text-white">Gift Cards</a>
          <a href="#location" className="hover:text-white">Location</a>
        </nav>
        <BookNowButton className="shrink-0 rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-bold tracking-[0.12em] text-[var(--color-ink)] uppercase transition hover:bg-[var(--color-accent-hover)] sm:px-5 sm:py-2.5">
          Book Now
        </BookNowButton>
      </div>
    </header>
  );
}
