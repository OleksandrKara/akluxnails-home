import Image from "next/image";
import BookNowButton from "../BookNowButton";
import { V4_HEADLINE, V4_SUBHEAD, V4_PROMO } from "@/lib/siteDataV4";

export default function HeroV4() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent-tint)] px-4 py-1.5 text-sm font-semibold tracking-wide text-[var(--color-accent-dark)]">
            {V4_PROMO}
          </span>

          <h1
            className="mt-6 text-4xl leading-[1.08] tracking-tight text-[var(--color-ink)] sm:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {V4_HEADLINE}
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--color-muted)]">{V4_SUBHEAD}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <BookNowButton className="inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-8 py-4 text-base font-medium text-white shadow-lg shadow-[var(--color-accent-tint)] transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)] hover:shadow-xl">
              Book Your Appointment
            </BookNowButton>
            <a
              href="#services"
              className="inline-block rounded-[var(--radius-pill)] px-8 py-4 text-base font-medium text-[var(--color-ink)] ring-1 ring-[var(--color-border-3)] transition hover:bg-[var(--color-card)]"
            >
              View Services
            </a>
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-xl)] shadow-2xl lg:aspect-square">
          <Image
            src="/images/nailart1.jpg"
            alt="Hand-painted nail art by AK.LUX.NAILS"
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
