import Image from "next/image";
import Link from "next/link";
import BookNowButton from "./BookNowButton";
import { BUSINESS_NAME } from "@/lib/siteData";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-card)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center py-1" aria-label={BUSINESS_NAME}>
          <Image
            src="/images/logo.png"
            alt={BUSINESS_NAME}
            width={465}
            height={100}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[var(--color-muted)] sm:flex">
          <Link href="/#services" className="hover:text-[var(--color-ink)]">Services</Link>
          <Link href="/#reviews" className="hover:text-[var(--color-ink)]">Reviews</Link>
          <Link href="/#location" className="hover:text-[var(--color-ink)]">Location</Link>
          <Link href="/blog" className="hover:text-[var(--color-ink)]">Blog</Link>
        </nav>
        <BookNowButton className="rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]">
          Book Now
        </BookNowButton>
      </div>
    </header>
  );
}
