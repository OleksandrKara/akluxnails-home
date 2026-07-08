import Image from "next/image";
import BookNowButton from "./BookNowButton";
import { HEADLINE, SUBHEAD, CREDIBILITY_STATS } from "@/lib/siteData";
import type { HomeVariantContent } from "@/lib/variant";

export default function Hero({ variant }: { variant: HomeVariantContent }) {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-10 pb-8 sm:px-6 sm:pt-16">
      <div className="grid items-center gap-8 sm:grid-cols-2">
        <div>
          <h1
            className="text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {variant.heroHeadline ?? HEADLINE}
          </h1>
          <p className="mt-4 text-lg text-[var(--color-muted)]">{variant.heroSubheadline ?? SUBHEAD}</p>

          <div className="mt-6">
            <BookNowButton className="inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-base font-medium text-white hover:bg-[var(--color-accent-hover)]">
              {variant.ctaText ?? "Book Your Appointment"}
            </BookNowButton>
          </div>

          <dl className="mt-8 flex flex-wrap gap-6">
            {CREDIBILITY_STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-xl font-semibold text-[var(--color-ink)]">{s.value}</dd>
                <div className="text-xs text-[var(--color-muted-2)]">{s.label}</div>
              </div>
            ))}
          </dl>
        </div>

        <div className="overflow-hidden rounded-[var(--radius-xl)] shadow-lg">
          <Image
            src="/images/mani1.jpg"
            alt="Russian hard-gel manicure by AK.LUX.NAILS"
            width={600}
            height={720}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
