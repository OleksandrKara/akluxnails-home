import Image from "next/image";
import BookNowButton from "../BookNowButton";
import { BUSINESS_NAME } from "@/lib/siteData";

// Same chrome as the real homepage's Header, but anchors point to this page's own sections
// (#services/#reviews/#location) rather than Header.tsx's hardcoded "/#..." links, which would
// otherwise jump a V4 visitor back to the real homepage instead of scrolling within V4.
export default function HeaderV4() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-card)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="flex items-center py-1" aria-label={BUSINESS_NAME}>
          <Image src="/images/logo.png" alt={BUSINESS_NAME} width={465} height={100} className="h-10 w-auto sm:h-12" priority />
        </span>
        <nav className="hidden items-center gap-8 text-sm text-[var(--color-muted)] sm:flex">
          <a href="#services" className="hover:text-[var(--color-ink)]">Services</a>
          <a href="#why-choose-us" className="hover:text-[var(--color-ink)]">Why Us</a>
          <a href="#reviews" className="hover:text-[var(--color-ink)]">Reviews</a>
          <a href="#gift-cards" className="hover:text-[var(--color-ink)]">Gift Cards</a>
          <a href="#location" className="hover:text-[var(--color-ink)]">Location</a>
        </nav>
        <BookNowButton className="rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]">
          Book Now
        </BookNowButton>
      </div>
    </header>
  );
}
