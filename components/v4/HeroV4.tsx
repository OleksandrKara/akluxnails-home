import Image from "next/image";
import BookNowButton from "../BookNowButton";
import {
  V4_HEADLINE_LINE_1,
  V4_HEADLINE_EMPHASIS,
  V4_HEADLINE_LINE_3,
  V4_BADGE,
  V4_SUBHEAD,
  V4_PROMO_MICRO,
} from "@/lib/siteDataV4";

/** Closely mirrors svitnail.com's actual hero: full-bleed photo with a dark overlay for
 * legibility, a small frosted pill badge, a huge light-weight tracked-in display headline with
 * one italic+underlined emphasis word, dual pill CTAs (solid gold + ghost outline), a small
 * dashed promo line, and a scroll indicator. The photo itself is real AK.LUX.NAILS work — only
 * the treatment (overlay, badge, typography) is inspired by the reference site. */
export default function HeroV4() {
  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden sm:min-h-screen">
      <Image
        src="/images/nailart1.jpg"
        alt="Hand-painted nail art by AK.LUX.NAILS"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1f1620]/90 via-[#1f1620]/50 to-[#1f1620]/20" />
      <div className="absolute inset-0 bg-[#3f2c45]/10" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pt-32 pb-16 sm:px-8 sm:pb-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.14em] text-white uppercase backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
          {V4_BADGE}
        </span>

        <h1
          className="mt-6 text-5xl leading-[1.02] font-light tracking-tight text-white sm:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {V4_HEADLINE_LINE_1}
          <br />
          <em
            className="italic"
            style={{ textDecoration: "underline", textDecorationColor: "var(--color-accent)", textDecorationThickness: "4px", textUnderlineOffset: "6px" }}
          >
            {V4_HEADLINE_EMPHASIS}
          </em>{" "}
          {V4_HEADLINE_LINE_3}
        </h1>

        <p className="mt-6 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">{V4_SUBHEAD}</p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <BookNowButton className="inline-block rounded-full bg-[var(--color-accent)] px-8 py-4 text-xs font-bold tracking-[0.14em] text-[var(--color-ink)] uppercase transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)]">
            Book Your Appointment
          </BookNowButton>
          <a
            href="#services"
            className="inline-block rounded-full border border-white/30 bg-white/10 px-8 py-4 text-xs font-bold tracking-[0.14em] text-white uppercase backdrop-blur-md transition hover:bg-white/20"
          >
            View Services
          </a>
        </div>

        <div className="mt-8 flex items-center gap-3 text-[11px] font-bold tracking-[0.1em] text-white/70 uppercase">
          <span className="h-px w-8 bg-white/40" />
          {V4_PROMO_MICRO}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-10 hidden flex-col items-center gap-1 text-[10px] font-bold tracking-[0.2em] text-white/60 uppercase sm:flex">
        Scroll
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
