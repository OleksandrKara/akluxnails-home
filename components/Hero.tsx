import Image from "next/image";
import BookNowButton from "./BookNowButton";
import { HEADLINE, SUBHEAD, CREDIBILITY_STATS } from "@/lib/siteData";
import type { HomeVariantContent } from "@/lib/variant";

const GALLERY_PHOTOS = [
  { src: "/images/nailart1.jpg", alt: "Hand-painted nail art by AK.LUX.NAILS" },
  { src: "/images/customer1.jpg", alt: "A happy AK.LUX.NAILS client showing off her manicure" },
  { src: "/images/milkynails.jpg", alt: "Milky white gel manicure by AK.LUX.NAILS" },
  { src: "/images/nudemani1.jpg", alt: "Nude gel manicure by AK.LUX.NAILS" },
];

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

        {/* A gallery grid, not a single hero shot — this is the range-of-work homepage view for
            returning clients browsing, distinct from mani.akluxnails.com's single-service hero. */}
        <div className="grid grid-cols-2 gap-3">
          {GALLERY_PHOTOS.map((photo, i) => (
            <div
              key={photo.src}
              className={`overflow-hidden rounded-[var(--radius-xl)] shadow-lg ${i === 0 ? "col-span-2" : ""}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={i === 0 ? 600 : 290}
                height={i === 0 ? 340 : 290}
                className="h-full w-full object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
