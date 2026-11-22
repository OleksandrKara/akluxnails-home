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
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          {TRAINING.title}
        </h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-12">
          <div className="grid grid-cols-2 gap-2.5 lg:sticky lg:top-32 lg:self-start">
            {[...TRAINING.work.after, ...TRAINING.work.before].map((g, i) => (
              <div key={g.src} className={`relative ${i === 0 ? "col-span-2" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt={g.alt} decoding="async" loading={i === 0 ? "eager" : "lazy"} className={`w-full rounded-lg object-cover ${i === 0 ? "aspect-[4/3]" : "aspect-[3/4]"}`} />
                <span className="absolute top-2 left-2 rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                  {i < TRAINING.work.after.length ? "After" : "Before"}
                </span>
              </div>
            ))}
            <p className="col-span-2 text-xs text-[var(--color-muted-2)]">Student work on live models.</p>
          </div>
          <div>
            <div className="rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-5 ring-1 ring-[var(--color-border)] sm:p-7" data-track="training">
              <p className="text-3xl font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
                {TRAINING.price}
              </p>
              <p className="mt-1 text-sm leading-snug text-[var(--color-muted)]">{TRAINING.priceNote}</p>
              <ul className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-[var(--color-ink-soft)]">
                {TRAINING.chips.map((c) => (
                  <li key={c} className="rounded-full bg-[var(--color-card)] px-3 py-1.5 ring-1 ring-[var(--color-border)]">
                    {c}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={LOCATION.trainingSmsHref} className={buttonClass}>
                  Text us about the course
                </a>
                <a href={LOCATION.phoneHref} className="inline-block rounded-[var(--radius-pill)] px-6 py-3 text-sm font-medium text-[var(--color-accent)] ring-1 ring-[var(--color-accent)] hover:bg-[var(--color-card)]">
                  Call {LOCATION.phone}
                </a>
              </div>
            </div>
            {TRAINING.intro.map((p) => (
              <p key={p} className="mt-5 text-base leading-relaxed text-[var(--color-muted)]">
                {p}
              </p>
            ))}
            <h2 className="mt-8 text-xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
              What is included
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[var(--color-muted)]">
              {TRAINING.included.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-[var(--color-muted-2)]">{TRAINING.notIncluded}</p>
          </div>
        </div>

        <section className="mt-14 rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] px-5 py-8 ring-1 ring-[var(--color-border)] sm:px-10 sm:py-10">
          <h2 className={h2} style={{ fontFamily: "var(--font-heading)" }}>
            What you learn
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {TRAINING.days.map((d) => (
              <div key={d.title}>
                <h3 className="text-base font-medium text-[var(--color-ink)]">{d.title}</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-[var(--color-muted)]">
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

        <section className="mt-12 grid items-center gap-6 sm:grid-cols-[240px_1fr]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={TRAINING.graduate.src} alt={TRAINING.graduate.alt} loading="lazy" decoding="async" className="aspect-[3/4] w-full rounded-lg object-cover" />
          <div>
            <h2 className={h2} style={{ fontFamily: "var(--font-heading)" }}>
              After the course
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--color-muted)]">
              Every graduate gets a Certificate of Completion and 1 month of questions and feedback from us. Use it to plan what to learn next and to build your portfolio.
            </p>
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
