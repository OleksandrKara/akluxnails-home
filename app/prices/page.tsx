import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import BookNowButton from "@/components/BookNowButton";
import { getCuratedMenu, type CuratedMenu } from "@/lib/square/catalog";
import { FOUR_HANDS_DISPLAY_PRICE_CENTS, FOUR_HANDS_REQUEST_ITEM_NAME } from "@/lib/services-config";
import { LOCATION } from "@/lib/siteData";

const SITE_URL = "https://akluxnails.com";

export const metadata: Metadata = {
  title: "Prices: Russian Manicure & Pedicure in Downtown San Diego",
  description:
    "Current prices and appointment times for every service at AK.LUX.NAILS in Downtown San Diego: Russian manicure, pedicure, gel extensions, Japanese manicure, men's services, and add-ons.",
  alternates: { canonical: "/prices" },
};

// Which dedicated page (if any) to link each service name to.
const SERVICE_LINKS: Record<string, string> = {
  "Russian Gel-Overlay Manicure": "/blog/russian-manicure-explained",
  "Gel Nail Extension": "/gel-nail-extensions",
  "Regular Pedicure Gel-Overlay (Dry)": "/russian-pedicure",
  "Pedicure (No Polish)": "/russian-pedicure",
  "Japanese manicure": "/blog/japanese-manicure-explained",
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

/** The whole menu with live Square prices, one page (added 2026-09-29). Price questions are one of
 * the most common things people ask search engines and AI assistants about a salon; this answers
 * them with the real numbers rather than leaving them to guess. Same live catalog as the booking
 * flow, rendered per request, so it can never show an old price. */
export default async function PricesPage() {
  await connection();
  let menu: CuratedMenu = { groups: [] };
  try {
    menu = await getCuratedMenu();
  } catch (err) {
    console.error("Prices page: failed to load live catalog", err);
  }

  const offerCatalogJsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "AK.LUX.NAILS service menu",
    url: `${SITE_URL}/prices`,
    itemListElement: menu.groups.flatMap((g) =>
      g.services
        .filter((s) => s.name !== FOUR_HANDS_REQUEST_ITEM_NAME)
        .flatMap((s) =>
          s.variations.map((v) => ({
            "@type": "Offer",
            price: (v.priceCents / 100).toFixed(2),
            priceCurrency: "USD",
            itemOffered: {
              "@type": "Service",
              name: s.variations.length > 1 ? `${s.name} (${v.name})` : s.name,
              provider: { "@id": `${SITE_URL}/#salon` },
            },
          })),
        ),
    ),
  };

  return (
    <div className="flex min-h-screen flex-col">
      {menu.groups.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogJsonLd) }} />
      )}
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          Prices
        </h1>
        <p className="mt-3 text-base text-[var(--color-muted)]">
          Current prices at AK.LUX.NAILS, {LOCATION.address}. Gel only, no acrylic on any service.
          Manicures, pedicures, and extensions come with our 14-day guarantee.
        </p>

        {menu.groups.length === 0 && (
          <p className="mt-8 text-[var(--color-muted)]">
            We can&apos;t show prices on this page right now. You can see all of them when you book online.
          </p>
        )}

        {menu.groups.map((g) => (
          <section key={g.title} className="mt-10">
            <h2 className="text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
              {g.title}
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <tbody>
                  {g.services.flatMap((s) => {
                    const href = SERVICE_LINKS[s.name];
                    const name = href ? (
                      <Link href={href} className="hover:text-[var(--color-accent)] hover:underline">
                        {s.name}
                      </Link>
                    ) : (
                      s.name
                    );
                    if (s.name === FOUR_HANDS_REQUEST_ITEM_NAME) {
                      return [
                        <tr key={s.itemId} className="border-b border-[var(--color-border)]">
                          <td className="py-2 pr-4 text-[var(--color-ink)]">{name}</td>
                          <td className="py-2 pr-4 text-[var(--color-ink)]">from {formatPrice(FOUR_HANDS_DISPLAY_PRICE_CENTS)}</td>
                          <td className="py-2 text-[var(--color-muted)]">by request</td>
                        </tr>,
                      ];
                    }
                    return s.variations.map((v) => (
                      <tr key={v.variationId} className="border-b border-[var(--color-border)]">
                        <td className="py-2 pr-4 text-[var(--color-ink)]">
                          {name}
                          {s.variations.length > 1 && (
                            <span className="block text-xs text-[var(--color-muted)]">{v.name}</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-[var(--color-ink)]">{formatPrice(v.priceCents)}</td>
                        <td className="py-2 text-[var(--color-muted)]">{formatDuration(v.durationMinutes)}</td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
            {g.addOnGroups.length > 0 && (
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                Add-ons:{" "}
                {g.addOnGroups
                  .flatMap((a) => a.options)
                  .map((o) => `${o.name} ${formatPrice(o.variations[0]?.priceCents ?? 0)}`)
                  .join(" · ")}
              </p>
            )}
          </section>
        ))}

        <p className="mt-8 text-xs text-[var(--color-muted)]">
          Where a service shows more than one price, the price depends on the nail artist&apos;s level.
          You choose when you pick a time.
        </p>

        <div className="mt-8">
          <BookNowButton className="inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]">
            Book Online
          </BookNowButton>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
