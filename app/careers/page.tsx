import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { LOCATION } from "@/lib/siteData";
import { CAREERS } from "@/lib/careers";

const SITE_URL = "https://akluxnails.com";

export const metadata: Metadata = {
  title: CAREERS.metaTitle,
  description: CAREERS.metaDescription,
  alternates: { canonical: `/${CAREERS.slug}` },
};

export default function Page() {
  const jobJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "Russian Manicure Artist (W-2)",
    description: `${CAREERS.intro.join(" ")} ${CAREERS.lookFor.join(" ")}`,
    datePosted: "2026-11-22",
    hiringOrganization: { "@type": "Organization", name: LOCATION.name, sameAs: SITE_URL },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: LOCATION.streetAddress,
        addressLocality: LOCATION.addressLocality,
        addressRegion: LOCATION.addressRegion,
        postalCode: LOCATION.postalCode,
        addressCountry: LOCATION.addressCountry,
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: { "@type": "QuantitativeValue", minValue: CAREERS.startWageNumber, unitText: "HOUR" },
    },
    directApply: false,
  };
  const h2 = "text-2xl text-[var(--color-ink)]";
  const buttonClass =
    "inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]";

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          {CAREERS.title}
        </h1>
        <p className="mt-3 text-lg font-medium text-[var(--color-accent)]">Russian manicure artist, W-2, starting at {CAREERS.startWage} per hour</p>
        {CAREERS.intro.map((p) => (
          <p key={p} className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
            {p}
          </p>
        ))}
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`mailto:${CAREERS.email}?subject=Russian%20manicure%20artist%20application`} className={buttonClass}>
            Apply by email
          </a>
          <a href={LOCATION.phoneHref} className="inline-block rounded-[var(--radius-pill)] px-6 py-3 text-sm font-medium text-[var(--color-accent)] ring-1 ring-[var(--color-accent)] hover:bg-[var(--color-card)]">
            Call {LOCATION.phone}
          </a>
        </div>

        <section className="mt-12">
          <h2 className={h2} style={{ fontFamily: "var(--font-heading)" }}>
            What we offer
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CAREERS.offer.map((o) => (
              <div key={o.title} className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-4 ring-1 ring-[var(--color-border)]">
                <h3 className="text-base font-medium text-[var(--color-ink)]">{o.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{o.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className={h2} style={{ fontFamily: "var(--font-heading)" }}>
            Who we are looking for
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--color-muted)]">
            {CAREERS.lookFor.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>

        <section className="mt-12 rounded-[var(--radius-lg)] bg-[var(--color-card)] p-6 ring-1 ring-[var(--color-border)]">
          <h2 className="text-xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
            How to apply
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-[var(--color-muted)]">
            {CAREERS.apply.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Email <a href={`mailto:${CAREERS.email}`} className="text-[var(--color-accent)] hover:underline">{CAREERS.email}</a> or call{" "}
            <a href={LOCATION.phoneHref} className="text-[var(--color-accent)] hover:underline">{LOCATION.phone}</a>. We are at {LOCATION.address}.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={`mailto:${CAREERS.email}?subject=Russian%20manicure%20artist%20application`} className={buttonClass}>
              Apply by email
            </a>
            <a href={LOCATION.mapsUrl} target="_blank" rel="noopener noreferrer" className="self-center text-sm font-medium text-[var(--color-accent)] hover:underline">
              Get directions
            </a>
          </div>
        </section>

        <p className="mt-8 text-xs leading-relaxed text-[var(--color-muted-2)]">{CAREERS.equal}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
