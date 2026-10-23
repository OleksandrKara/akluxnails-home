import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import BookNowButton from "@/components/BookNowButton";
import { BUSINESS_NAME, GOOGLE_REVIEW_COUNT, GOOGLE_REVIEW_RATING, REVIEWS } from "@/lib/siteData";
import { V4_WHY_CHOOSE_US } from "@/lib/siteDataV4";

const TITLE = "About AK.LUX.NAILS | Family-Run Nail Studio in Downtown San Diego";
const DESCRIPTION =
  "AK.LUX.NAILS is a Russian manicure studio in Downtown San Diego, part of a family business of Anna and Alex Kara. Our story, how we work, and what clients say.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/about", type: "website" },
};

const HOW_WE_WORK = [0, 1, 2, 3, 8].map((i) => V4_WHY_CHOOSE_US[i]);
const QUOTES = REVIEWS.slice(0, 3);

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-4xl text-[var(--color-ink)] sm:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
          About {BUSINESS_NAME}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-muted)]">
          {BUSINESS_NAME} is a Russian manicure studio in Downtown San Diego, part of a family business of Anna and Alex Kara.
        </p>

        <h2 className="mt-12 text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
          A family business
        </h2>
        <p className="mt-3 leading-relaxed text-[var(--color-muted)]">
          It started with permanent makeup. Anna opened her permanent makeup studio in San Diego in 2017. Over more than 10 years the family has added one direction after another, and in those same years our family grew by two children. Alex Kara, Business Growth Director, helps the family businesses grow.
        </p>

        <h2 className="mt-12 text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
          How {BUSINESS_NAME} began
        </h2>
        <p className="mt-3 leading-relaxed text-[var(--color-muted)]">
          We opened {BUSINESS_NAME} in 2024. It was hard to find a good manicurist in San Diego, so we built a team of nail artists.
        </p>

        <h2 className="mt-12 text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
          How we work
        </h2>
        <ul className="mt-4 space-y-4">
          {HOW_WE_WORK.map((p) => (
            <li key={p.title} className="flex gap-4">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden />
              <div>
                <h3 className="font-medium text-[var(--color-ink)]">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{p.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
          What clients say
        </h2>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          {GOOGLE_REVIEW_RATING}★ from {GOOGLE_REVIEW_COUNT} Google reviews
        </p>
        <div className="mt-4 grid gap-4">
          {QUOTES.map((r) => (
            <figure key={r.name} className="rounded-[var(--radius-xl)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)]">
              <blockquote className="text-sm leading-relaxed text-[var(--color-ink)]">&ldquo;{r.text}&rdquo;</blockquote>
              <figcaption className="mt-3 text-xs text-[var(--color-muted-2)]">
                {r.name}, Google review, {r.date}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <BookNowButton className="rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-7 py-3.5 text-sm font-medium text-white">
            Book Now
          </BookNowButton>
          <Link href="/prices" className="text-sm underline underline-offset-4 text-[var(--color-ink)]">
            See prices
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
