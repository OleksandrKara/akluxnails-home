import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Check, Eyebrow, FaqAccordion } from "@/components/training/TrainingBlocks";
import { LOCATION } from "@/lib/siteData";
import { CAREERS } from "@/lib/careers";

const SITE_URL = "https://akluxnails.com";

export const metadata: Metadata = {
  title: CAREERS.metaTitle,
  description: CAREERS.metaDescription,
  alternates: { canonical: `/${CAREERS.slug}` },
  openGraph: { title: CAREERS.metaTitle, description: CAREERS.metaDescription, url: `/${CAREERS.slug}`, images: [{ url: "/images/careers/studio-front.jpg" }] },
};

const heading = { fontFamily: "var(--font-heading)" } as const;
const h2 = "mt-1 text-2xl text-[var(--color-ink)] sm:text-3xl";
const card = "rounded-[var(--radius-lg)] bg-[var(--color-card)] ring-1 ring-[var(--color-border)]";
const buttonClass =
  "inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]";
const applyHref = `mailto:${CAREERS.email}?subject=Russian%20manicure%20artist%20application`;

export default function Page() {
  const address = {
    "@type": "PostalAddress",
    streetAddress: LOCATION.streetAddress,
    addressLocality: LOCATION.addressLocality,
    addressRegion: LOCATION.addressRegion,
    postalCode: LOCATION.postalCode,
    addressCountry: LOCATION.addressCountry,
  };
  const jobJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "Russian Manicure Artist (W-2)",
    description: `<p>${CAREERS.intro.join("</p><p>")}</p><p>Requirements:</p><ul>${CAREERS.lookFor.map((l) => `<li>${l}</li>`).join("")}</ul><p>What the salon provides:</p><ul>${CAREERS.provided.map((l) => `<li>${l}</li>`).join("")}</ul>`,
    datePosted: "2026-11-22",
    industry: "Beauty and personal care",
    occupationalCategory: "39-5092 Manicurists and Pedicurists",
    hiringOrganization: { "@type": "Organization", name: LOCATION.name, sameAs: SITE_URL, logo: `${SITE_URL}/icon.png` },
    jobLocation: { "@type": "Place", address },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: { "@type": "QuantitativeValue", minValue: CAREERS.startWageNumber, unitText: "HOUR" },
    },
    jobBenefits: "Overtime under California law, individual KPI bonuses, 100% of tips, paid team trainings, uniform, materials and tools provided, clients and marketing provided, company parties, path to teaching.",
    qualifications: "Valid California manicurist license. Russian manicure skills (dry e-file and combined technique).",
    skills: "Russian manicure, e-file, combined manicure, gel, cuticle work, sanitation",
    directApply: false,
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CAREERS.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const crumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AK.LUX.NAILS", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Careers", item: `${SITE_URL}/${CAREERS.slug}` },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbJsonLd) }} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
        <section className="grid items-center gap-8 lg:grid-cols-[1fr_minmax(0,380px)] lg:gap-12">
          <div>
            <Eyebrow>We are hiring</Eyebrow>
            <h1 className="mt-1 text-3xl leading-tight text-[var(--color-ink)] sm:text-5xl" style={heading}>
              {CAREERS.title}
            </h1>
            <p className="mt-3 text-lg font-medium text-[var(--color-accent)]">W-2 employee, starting at {CAREERS.startWage} per hour</p>
            {CAREERS.intro.map((p) => (
              <p key={p} className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
                {p}
              </p>
            ))}
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={applyHref} className={buttonClass}>
                Apply by email
              </a>
              <a href={LOCATION.phoneHref} className="inline-block rounded-[var(--radius-pill)] px-6 py-3 text-sm font-medium text-[var(--color-accent)] ring-1 ring-[var(--color-accent)] hover:bg-[var(--color-card)]">
                Call {LOCATION.phone}
              </a>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/careers/studio-front.jpg"
            alt="The AK.LUX.NAILS studio in Downtown San Diego: a bright room with the AK.LUX.NAILS sign and copper pendant lamps"
            width={1100}
            height={1467}
            decoding="async"
            className="aspect-[4/5] w-full rounded-[var(--radius-lg)] object-cover ring-1 ring-[var(--color-border)]"
          />
        </section>

        <figure className="mt-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/careers/studio-hall.jpg"
            alt="The AK.LUX.NAILS studio hall in Downtown San Diego: manicure stations with lamps and round lit mirrors, light wood floor, plants and a waiting area"
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
            className="aspect-[16/9] w-full rounded-[var(--radius-lg)] object-cover ring-1 ring-[var(--color-border)]"
          />
          <figcaption className="mt-2 text-center text-xs text-[var(--color-muted-2)]">Our studio in Downtown San Diego: your station is bright, clean and fully equipped.</figcaption>
        </figure>

        <section className="mt-12" aria-labelledby="glance-title">
          <h2 id="glance-title" className="sr-only">
            The job at a glance
          </h2>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CAREERS.glance.map((g) => (
              <div key={g.label} className={`${card} p-4 sm:p-5`}>
                <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-2)]">{g.label}</dt>
                <dd className="mt-1 text-base font-medium leading-snug text-[var(--color-ink)] sm:text-lg">{g.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-20" aria-labelledby="pay-title">
          <Eyebrow>How you are paid</Eyebrow>
          <h2 id="pay-title" className={h2} style={heading}>
            Pay for a Russian manicure artist
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {CAREERS.pay.map((o) => (
              <div key={o.title} className={`${card} p-5 sm:p-6`}>
                <h3 className="text-xl text-[var(--color-ink)]" style={heading}>
                  {o.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{o.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Pay periods are the 1st to the 15th and the 16th to the end of the month. You are paid twice a month.
          </p>
        </section>

        <section className="mt-20" aria-labelledby="growth-title">
          <Eyebrow>Growth</Eyebrow>
          <h2 id="growth-title" className={h2} style={heading}>
            Room to grow, from technician to teacher
          </h2>
          <ol className="relative mt-8 space-y-5 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-[var(--color-border)] sm:before:left-[23px]">
            {CAREERS.growth.map((g, i) => (
              <li key={g.title} className="relative flex gap-4 sm:gap-6">
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-base font-semibold text-white ring-4 ring-[var(--color-accent-tint-2)] sm:h-12 sm:w-12 sm:text-lg" style={heading} aria-hidden>
                  {i + 1}
                </span>
                <div className={`${card} min-w-0 flex-1 p-5`}>
                  <h3 className="text-lg text-[var(--color-ink)]" style={heading}>
                    {g.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{g.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm text-[var(--color-muted)]">
            Our studio also{" "}
            <Link href="/russian-manicure-course" className="text-[var(--color-accent)] underline underline-offset-2">
              teaches a Russian manicure course
            </Link>{" "}
            for beginners, so teaching is a real part of the studio, not only a promise.
          </p>
        </section>

        <section className="mt-20 grid items-start gap-8 lg:grid-cols-[1fr_minmax(0,380px)] lg:gap-12" aria-labelledby="provided-title">
          <div>
            <Eyebrow>What the salon gives you</Eyebrow>
            <h2 id="provided-title" className={h2} style={heading}>
              You bring the skill. We bring the rest.
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {CAREERS.provided.map((p) => (
                <li key={p} className={`${card} flex gap-2.5 p-4 text-sm text-[var(--color-ink-soft)]`}>
                  <Check />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/careers/studio-lounge.jpg"
            alt="The AK.LUX.NAILS waiting area with two white armchairs, plants and tall windows"
            width={1100}
            height={1467}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full rounded-[var(--radius-lg)] object-cover ring-1 ring-[var(--color-border)]"
          />
        </section>

        <section className="mt-20" aria-labelledby="culture-title">
          <Eyebrow>Working here</Eyebrow>
          <h2 id="culture-title" className={h2} style={heading}>
            A team, a good location and real support
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAREERS.culture.map((o) => (
              <div key={o.title} className={`${card} p-5`}>
                <h3 className="text-lg leading-snug text-[var(--color-ink)]" style={heading}>
                  {o.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{o.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20" aria-labelledby="look-title">
          <Eyebrow>Who we are looking for</Eyebrow>
          <h2 id="look-title" className={h2} style={heading}>
            What we ask from you
          </h2>
          <ul className={`${card} mt-6 space-y-3 p-5 text-[var(--color-muted)] sm:p-6`}>
            {CAREERS.lookFor.map((l) => (
              <li key={l} className="flex gap-2.5">
                <Check />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </section>

        <FaqAccordion items={CAREERS.faq} eyebrow="Questions" title="Questions about working at AK.LUX.NAILS" />

        <section className="mt-20 rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-6 ring-1 ring-[var(--color-border)] sm:p-10" aria-labelledby="apply-title">
          <h2 id="apply-title" className="text-2xl text-[var(--color-ink)] sm:text-3xl" style={heading}>
            How to apply
          </h2>
          <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-[var(--color-muted)]">
            {CAREERS.apply.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Email{" "}
            <a href={`mailto:${CAREERS.email}`} className="text-[var(--color-accent)] hover:underline">
              {CAREERS.email}
            </a>{" "}
            or call{" "}
            <a href={LOCATION.phoneHref} className="text-[var(--color-accent)] hover:underline">
              {LOCATION.phone}
            </a>
            . We are at {LOCATION.address}.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a href={applyHref} className={buttonClass}>
              Apply by email
            </a>
            <a href={LOCATION.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
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
