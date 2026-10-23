import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import BookNowButton from "@/components/BookNowButton";
import { getCuratedMenu, type CatalogServiceItem } from "@/lib/square/catalog";
import { FOUR_HANDS_REQUEST_ITEM_NAME } from "@/lib/services-config";
import {
  BUSINESS_HOURS,
  BUSINESS_NAME,
  GOOGLE_REVIEW_COUNT,
  GOOGLE_REVIEW_RATING,
  LOCAL_AREA_NOTE,
  LOCATION,
  NEARBY_AREAS,
  REVIEWS,
} from "@/lib/siteData";
import { V4_WHY_CHOOSE_US } from "@/lib/siteDataV4";

const SITE_URL = "https://akluxnails.com";
const TITLE = "Nail Salon in Downtown San Diego | Gel Manicure, Pedicure, Extensions";
const DESCRIPTION =
  "AK.LUX.NAILS, 1357 Seventh Ave, Downtown San Diego: Russian gel manicure, dry pedicure and gel extensions. Gel only, no acrylic. Open daily 8 AM to 9 PM. Prices and online booking.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/nail-salon-downtown-san-diego" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/nail-salon-downtown-san-diego", type: "website" },
};

const SERVICE_LINKS: Record<string, string> = {
  "Russian Gel-Overlay Manicure": "/gel-manicure",
  "Manicure (No Polish)": "/gel-manicure",
  "Gel Nail Extension": "/gel-nail-extensions",
  "Regular Pedicure Gel-Overlay (Dry)": "/russian-pedicure",
  "Pedicure (No Polish)": "/russian-pedicure",
};

const WHY = [0, 1, 2, 4, 9].map((i) => V4_WHY_CHOOSE_US[i]);
const QUOTES = REVIEWS.filter((r) => r.text.length > 60).slice(0, 3);

const FAQ = [
  {
    q: "Where is AK.LUX.NAILS?",
    a: `${LOCATION.address}. ${LOCAL_AREA_NOTE} Street parking is available on 7th Ave.`,
  },
  {
    q: "What are your hours?",
    a: `We are open every day, ${BUSINESS_HOURS.replace("Monday – Sunday · ", "")}, by appointment.`,
  },
  {
    q: "Do you use acrylic?",
    a: "No. We work with gel only and never use acrylic, on any service.",
  },
  {
    q: "Is your pedicure done in water?",
    a: "No. It is a dry pedicure: there is no water soak or foot bath. The skin and cuticles are prepared dry.",
  },
  {
    q: "What if something isn't right after my visit?",
    a: "Every service is covered by our 14-day guarantee: if something isn't right, we fix it free.",
  },
  {
    q: "How do I book?",
    a: "Book online in a few taps, choosing your service and a time that works for you. Prices for every service are shown below and on the Prices page.",
  },
];

function fromPrice(item: CatalogServiceItem): string {
  const min = Math.min(...item.variations.map((v) => v.priceCents));
  return `from $${(min / 100).toFixed(0)}`;
}

export default async function NailSalonDowntownPage() {
  await connection();
  let services: CatalogServiceItem[] = [];
  try {
    const menu = await getCuratedMenu();
    services = menu.groups
      .filter((g) => g.title === "Manicures" || g.title === "Pedicures")
      .flatMap((g) => g.services)
      .filter((s) => s.name !== FOUR_HANDS_REQUEST_ITEM_NAME && s.variations.length > 0);
  } catch (err) {
    console.error("Nail salon downtown page: failed to load live catalog", err);
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    url: `${SITE_URL}/nail-salon-downtown-san-diego`,
    about: { "@id": `${SITE_URL}/#salon` },
  };

  const heading = { fontFamily: "var(--font-heading)" } as const;

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-4xl text-[var(--color-ink)] sm:text-5xl" style={heading}>
          Nail Salon in Downtown San Diego
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--color-muted)]">
          {BUSINESS_NAME} is a Russian manicure studio at {LOCATION.address}. We do gel manicures, dry pedicures and gel
          nail extensions, and we never use acrylic. {GOOGLE_REVIEW_RATING}★ from {GOOGLE_REVIEW_COUNT} Google reviews.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <BookNowButton className="rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-7 py-3.5 text-sm font-medium text-white">
            Book Online
          </BookNowButton>
          <Link href="/prices" className="text-sm underline underline-offset-4 text-[var(--color-ink)]">
            See all prices
          </Link>
        </div>

        {services.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl text-[var(--color-ink)]" style={heading}>
              Our manicures and pedicures
            </h2>
            <ul className="mt-4 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {services.map((s) => {
                const href = SERVICE_LINKS[s.name] ?? "/prices";
                return (
                  <li key={s.itemId} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                    <Link href={href} className="text-[var(--color-ink)] underline-offset-4 hover:underline">
                      {s.name}
                    </Link>
                    <span className="whitespace-nowrap text-[var(--color-muted)]">{fromPrice(s)}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-[var(--color-muted-2)]">
              Prices are current and come straight from our booking system. Men&rsquo;s services are listed on the{" "}
              <Link href="/prices" className="underline underline-offset-2">Prices page</Link>.
            </p>
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-2xl text-[var(--color-ink)]" style={heading}>
            How we work
          </h2>
          <ul className="mt-4 space-y-4">
            {WHY.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden />
                <div>
                  <h3 className="font-medium text-[var(--color-ink)]">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{p.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl text-[var(--color-ink)]" style={heading}>
            Find us in Downtown San Diego
          </h2>
          <p className="mt-3 leading-relaxed text-[var(--color-muted)]">
            {LOCATION.address}. {LOCAL_AREA_NOTE} {LOCATION.note}.
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Hours: {BUSINESS_HOURS}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Clients come to us from {NEARBY_AREAS.join(", ")}.
          </p>
          <p className="mt-3 text-sm">
            <a href={LOCATION.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 text-[var(--color-ink)]">
              Get directions
            </a>
            {" · "}
            <a href={LOCATION.phoneHref} className="underline underline-offset-4 text-[var(--color-ink)]">
              Call {LOCATION.phone}
            </a>
          </p>
        </section>

        {QUOTES.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl text-[var(--color-ink)]" style={heading}>
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
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-2xl text-[var(--color-ink)]" style={heading}>
            Questions
          </h2>
          <div className="mt-4 space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="font-medium text-[var(--color-ink)]">{f.q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <BookNowButton className="rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-7 py-3.5 text-sm font-medium text-white">
            Book Online
          </BookNowButton>
          <Link href="/gel-manicure" className="text-sm underline underline-offset-4 text-[var(--color-ink)]">
            Gel manicure
          </Link>
          <Link href="/russian-pedicure" className="text-sm underline underline-offset-4 text-[var(--color-ink)]">
            Russian pedicure
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
