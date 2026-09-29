import Link from "next/link";
import { connection } from "next/server";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import BookNowButton from "@/components/BookNowButton";
import { getCuratedMenu, getItemByName, type CatalogServiceItem } from "@/lib/square/catalog";
import { toWireItem } from "@/lib/square/wire";
import { BUSINESS_HOURS, LOCATION } from "@/lib/siteData";
import type { ServicePageConfig } from "@/lib/servicePages";

const SITE_URL = "https://akluxnails.com";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

/** One real service page (see lib/servicePages.ts for why these exist and the content rules).
 * Prices, durations, and add-ons come from the same live Square catalog the booking flow uses, so
 * what's printed here, what's in this page's structured data, and what the visitor is charged are
 * always the same numbers. If Square can't be reached, the price table is simply left out rather
 * than showing a stale or guessed figure. */
export default async function ServicePage({ config }: { config: ServicePageConfig }) {
  // Render per request (the catalog itself is cached in memory for 5 min, see catalog.ts), never
  // at build time: a price baked into the build would go stale the moment it changes in Square.
  await connection();
  let items: CatalogServiceItem[] = [];
  let addOns: { label: string; options: CatalogServiceItem[] }[] = [];
  try {
    items = (await Promise.all(config.itemNames.map((n) => getItemByName(n)))).filter(
      (i): i is CatalogServiceItem => Boolean(i),
    );
    const menu = await getCuratedMenu();
    addOns = menu.groups.find((g) => g.title === config.menuGroupTitle)?.addOnGroups ?? [];
  } catch (err) {
    console.error(`Service page ${config.slug}: failed to load live catalog`, err);
  }

  const main = items[0];
  const cheapest = main
    ? main.variations.reduce((a, b) => (b.priceCents < a.priceCents ? b : a))
    : undefined;
  const preselection =
    main && cheapest
      ? {
          service: toWireItem(main),
          variation: toWireItem(main).variations.find((v) => v.variationId === cheapest.variationId)!,
        }
      : undefined;

  const serviceJsonLd = main
    ? {
        "@context": "https://schema.org",
        "@type": "Service",
        name: main.name,
        url: `${SITE_URL}/${config.slug}`,
        description: config.metaDescription,
        provider: { "@id": `${SITE_URL}/#salon` },
        areaServed: { "@type": "City", name: "San Diego" },
        offers: items.flatMap((item) =>
          item.variations.map((v) => ({
            "@type": "Offer",
            name: item.variations.length > 1 ? `${item.name} (${v.name})` : item.name,
            price: (v.priceCents / 100).toFixed(2),
            priceCurrency: "USD",
          })),
        ),
      }
    : null;

  const buttonClass =
    "inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]";

  return (
    <div className="flex min-h-screen flex-col">
      {serviceJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      )}
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-[1fr_240px] sm:items-start">
          <div>
            <h1 className="text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
              {config.h1}
            </h1>
            {config.intro.map((p) => (
              <p key={p} className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
                {p}
              </p>
            ))}
            <div className="mt-6">
              <BookNowButton className={buttonClass} preselection={preselection}>
                Book Online
              </BookNowButton>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config.heroImage} alt={config.heroAlt} className="w-full rounded-[var(--radius-lg)] object-cover" />
        </div>

        {items.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
              Prices
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-muted-2)]">
                    <th className="py-2 pr-4 font-medium">Service</th>
                    <th className="py-2 pr-4 font-medium">Price</th>
                    <th className="py-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {items.flatMap((item) =>
                    item.variations.map((v) => (
                      <tr key={v.variationId} className="border-b border-[var(--color-border)]">
                        <td className="py-2 pr-4 text-[var(--color-ink)]">
                          {item.name}
                          {item.variations.length > 1 && (
                            <span className="block text-xs text-[var(--color-muted)]">{v.name}</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-[var(--color-ink)]">{formatPrice(v.priceCents)}</td>
                        <td className="py-2 text-[var(--color-muted)]">{formatDuration(v.durationMinutes)}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
            {main && main.variations.length > 1 && (
              <p className="mt-3 text-xs text-[var(--color-muted)]">
                The price depends on the nail artist&apos;s level. You choose when you pick a time.
              </p>
            )}
            {addOns.length > 0 && (
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                Add-ons:{" "}
                {addOns
                  .flatMap((g) => g.options)
                  .map((o) => `${o.name} ${formatPrice(o.variations[0]?.priceCents ?? 0)}`)
                  .join(" · ")}
              </p>
            )}
          </section>
        )}

        <section className="mt-12 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
              What&apos;s included
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--color-muted)]">
              {config.included.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
              Good to know
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--color-muted)]">
              {config.goodToKnow.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
            Our work
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {config.gallery.map((g) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={g.src} src={g.src} alt={g.alt} loading="lazy" decoding="async" className="aspect-square w-full rounded-lg object-cover" />
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[var(--radius-lg)] bg-[var(--color-card)] p-6 ring-1 ring-[var(--color-border)]">
          <h2 className="text-xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
            Where we are
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {LOCATION.address}
            <br />
            {BUSINESS_HOURS}
            <br />
            <a href={LOCATION.phoneHref} className="text-[var(--color-accent)] hover:underline">
              {LOCATION.phone}
            </a>
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <BookNowButton className={buttonClass} preselection={preselection}>
              Book Online
            </BookNowButton>
            <Link href="/prices" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
              All prices
            </Link>
          </div>
        </section>

        <p className="mt-8 text-sm">
          Want the details first?{" "}
          <Link href={config.explainer.href} className="font-medium text-[var(--color-accent)] hover:underline">
            {config.explainer.label}
          </Link>
        </p>
        {config.wearProof && (
          <section className="mt-12 rounded-[var(--radius-lg)] bg-[var(--color-card)] p-6 ring-1 ring-[var(--color-accent)]">
            <h2 className="text-xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
              {config.wearProof.title}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {config.wearProof.photos.map((p) => (
                <div key={p.src} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.alt} loading="lazy" decoding="async" className="aspect-[4/5] w-full rounded-lg object-cover" />
                  <span className="absolute top-2 right-2 rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
            {config.wearProof.text.map((p) => (
              <p key={p} className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {p}
              </p>
            ))}
            <Link href="/blog/safe-gel-removal-explained" className="mt-3 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline">
              How we remove gel safely
            </Link>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
