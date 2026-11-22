import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import ReviewsSection from "@/components/ReviewsSection";
import TrainingCarousel from "@/components/training/TrainingCarousel";
import { Check, EnrollmentSteps, Eyebrow, FaqAccordion, Objections, PaymentBreakdown } from "@/components/training/TrainingBlocks";
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
  const photos = [
    ...TRAINING.work.after.map((p) => ({ ...p, label: "After" })),
    ...TRAINING.work.before.map((p) => ({ ...p, label: "Before" })),
  ];
  const heading = { fontFamily: "var(--font-heading)" } as const;
  const buttonClass =
    "inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]";

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
        <Eyebrow>Training at AK.LUX.NAILS</Eyebrow>
        <h1 className="mt-1 text-3xl leading-tight text-[var(--color-ink)] sm:text-5xl" style={heading}>
          {TRAINING.title}
        </h1>

        <p className="mt-3 text-base text-[var(--color-ink-soft)]">
          <strong className="font-medium text-[var(--color-ink)]">{TRAINING.price}</strong> · 3 days in person · Certificate of Completion
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,520px)_1fr] lg:gap-12">
          <div className="flex flex-col gap-5">
            <div>
              <TrainingCarousel photos={photos} />
              <p className="mt-2 text-center text-xs text-[var(--color-muted-2)]">Student work on live models.</p>
            </div>
            <PaymentBreakdown />
          </div>
          <div>
            <div className="rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-5 ring-1 ring-[var(--color-border)] sm:p-7" data-track="training">
              <p className="text-4xl font-medium text-[var(--color-ink)]" style={heading}>
                {TRAINING.price}
              </p>
              <p className="mt-1 text-sm leading-snug text-[var(--color-muted)]">{TRAINING.priceNote}</p>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-[var(--color-ink-soft)]">
                {TRAINING.chips.map((c) => (
                  <li key={c} className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-card)] px-3 py-2 ring-1 ring-[var(--color-border)]">
                    <Check />
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
            <h2 className="mt-8 text-xl text-[var(--color-ink)]" style={heading}>
              What is included
            </h2>
            <ul className="mt-3 space-y-2 text-[var(--color-muted)]">
              {TRAINING.included.map((i) => (
                <li key={i} className="flex gap-2.5">
                  <Check />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-[var(--color-muted-2)]">{TRAINING.notIncluded}</p>
          </div>
        </div>

        <section className="mt-20" aria-labelledby="learn-title">
          <Eyebrow>The program</Eyebrow>
          <h2 id="learn-title" className="mt-1 text-2xl text-[var(--color-ink)] sm:text-3xl" style={heading}>
            What you learn in 3 days
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TRAINING.days.map((d) => {
              const [day, ...rest] = d.title.split(": ");
              return (
                <div key={d.title} className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-card)] ring-1 ring-[var(--color-border)]">
                  <div className="bg-[var(--color-accent-tint-2)] px-5 py-4 sm:px-6">
                    <p className="text-3xl text-[var(--color-accent)]" style={heading}>{day}</p>
                    <h3 className="mt-1 text-base font-medium leading-snug text-[var(--color-ink)]">{rest.join(": ")}</h3>
                  </div>
                  <ul className="space-y-2.5 px-5 py-5 text-sm text-[var(--color-muted)] sm:px-6">
                    {d.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <Check />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <EnrollmentSteps />

        <section className="mt-20 rounded-[var(--radius-lg)] bg-[var(--color-card)] p-6 ring-1 ring-[var(--color-border)] sm:p-8" aria-labelledby="license-title">
          <h2 id="license-title" className="text-xl text-[var(--color-ink)]" style={heading}>
            Before you enroll
          </h2>
          <p className="mt-2 text-base leading-relaxed text-[var(--color-ink-soft)]">{TRAINING.licenseGuide}</p>
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-muted-3)]">{TRAINING.licenseNotice}</p>
        </section>

        <Objections />

        <section className="mt-20 grid items-center gap-6 sm:grid-cols-[260px_1fr] sm:gap-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={TRAINING.graduate.src} alt={TRAINING.graduate.alt} loading="lazy" decoding="async" className="aspect-[3/4] w-full rounded-[var(--radius-lg)] object-cover ring-1 ring-[var(--color-border)]" />
          <div>
            <h2 className="text-2xl text-[var(--color-ink)] sm:text-3xl" style={heading}>
              After the course
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--color-muted)]">
              Every graduate gets a Certificate of Completion and 1 month of questions and feedback from us. Use it to plan what to learn next and to build your portfolio.
            </p>
          </div>
        </section>

        <ReviewsSection />

        <FaqAccordion />

        <section className="mt-20 rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-6 text-center ring-1 ring-[var(--color-border)] sm:p-10" data-track="training" aria-labelledby="cta-title">
          <h2 id="cta-title" className="text-2xl text-[var(--color-ink)] sm:text-3xl" style={heading}>
            Ready to start from zero?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-[var(--color-muted)]">
            Send us a text. Anastasia, our course curator, tells you the next date, answers your questions and helps you enroll.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={LOCATION.trainingSmsHref} className={buttonClass}>
              Text us about the course
            </a>
            <a href={LOCATION.phoneHref} className="inline-block rounded-[var(--radius-pill)] px-6 py-3 text-sm font-medium text-[var(--color-accent)] ring-1 ring-[var(--color-accent)] hover:bg-[var(--color-card)]">
              Call {LOCATION.phone}
            </a>
          </div>
        </section>

        <section className="mt-12 rounded-[var(--radius-lg)] bg-[var(--color-card)] p-6 ring-1 ring-[var(--color-border)]" data-track="training">
          <h2 className="text-xl text-[var(--color-ink)]" style={heading}>
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
          The course is offered by Anna Kara&apos;s Brow Studio LLC. We also teach permanent makeup at our{" "}
          <a href="https://pmu-annakara.com/academy/" className="underline underline-offset-2 hover:text-[var(--color-ink)]">
            sister school
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
