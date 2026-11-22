import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { BUSINESS_HOURS, LOCATION } from "@/lib/siteData";
import { TRAINING } from "@/lib/trainingCourse";

const SITE_URL = "https://akluxnails.com";

export const metadata: Metadata = {
  title: TRAINING.metaTitle,
  description: TRAINING.metaDescription,
  alternates: { canonical: `/${TRAINING.slug}` },
};

export default function Page() {
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: TRAINING.title,
    description: TRAINING.metaDescription,
    url: `${SITE_URL}/${TRAINING.slug}`,
    provider: { "@id": `${SITE_URL}/#salon` },
    educationalCredentialAwarded: "Certificate of Completion",
    offers: { "@type": "Offer", price: TRAINING.priceUsd.toFixed(2), priceCurrency: "USD", category: "Paid" },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "onsite",
      location: { "@type": "Place", name: LOCATION.name, address: LOCATION.address },
    },
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: TRAINING.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const h2 = "text-2xl text-[var(--color-ink)]";
  const buttonClass =
    "inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]";

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          {TRAINING.title}
        </h1>
        {TRAINING.intro.map((p) => (
          <p key={p} className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
            {p}
          </p>
        ))}

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TRAINING.facts.map((f) => (
            <div key={f.label} className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-4 ring-1 ring-[var(--color-border)]">
              <dt className="text-xs text-[var(--color-muted-2)]">{f.label}</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--color-ink)]">{f.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6" data-track="training">
          <a href={LOCATION.trainingSmsHref} className={buttonClass}>
            Text us about the course
          </a>
        </div>

        <section className="mt-12">
          <h2 className={h2} style={{ fontFamily: "var(--font-heading)" }}>
            What you learn
          </h2>
          <div className="mt-4 grid gap-6">
            {TRAINING.days.map((d) => (
              <div key={d.title}>
                <h3 className="text-base font-medium text-[var(--color-ink)]">{d.title}</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[var(--color-muted)]">
                  {d.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[var(--radius-lg)] bg-[var(--color-card)] p-6 ring-1 ring-[var(--color-accent)]">
          <h2 className="text-xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
            Before you enroll
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{TRAINING.licenseNotice}</p>
        </section>

        <section className="mt-12">
          <h2 className={h2} style={{ fontFamily: "var(--font-heading)" }}>
            Student work on live models
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {[...TRAINING.work.before, ...TRAINING.work.after].map((g, i) => (
              <div key={g.src} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt={g.alt} loading="lazy" decoding="async" className="aspect-[3/4] w-full rounded-lg object-cover" />
                <span className="absolute top-2 left-2 rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                  {i < TRAINING.work.before.length ? "Before" : "After"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className={h2} style={{ fontFamily: "var(--font-heading)" }}>
            Questions
          </h2>
          <div className="mt-4 divide-y divide-[var(--color-border)]">
            {TRAINING.faq.map((f) => (
              <div key={f.q} className="py-3">
                <h3 className="text-base font-medium text-[var(--color-ink)]">{f.q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[var(--radius-lg)] bg-[var(--color-card)] p-6 ring-1 ring-[var(--color-border)]" data-track="training">
          <h2 className="text-xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
            Where we teach
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
            <a href={LOCATION.trainingSmsHref} className={buttonClass}>
              Text us about the course
            </a>
            <a href={LOCATION.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
              Get directions
            </a>
          </div>
        </section>

        <p className="mt-8 text-xs leading-relaxed text-[var(--color-muted-2)]">
          The course is run through our sister school,{" "}
          <a href="https://pmu-annakara.com/academy/" className="underline underline-offset-2 hover:text-[var(--color-ink)]">
            Anna Kara&apos;s Permanent Makeup Academy
          </a>
          . Looking for a nail service instead?{" "}
          <Link href="/prices" className="underline underline-offset-2 hover:text-[var(--color-ink)]">
            See our prices
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
