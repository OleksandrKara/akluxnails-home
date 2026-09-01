import Link from "next/link";
import { LOCATION, BUSINESS_HOURS } from "@/lib/siteData";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

/** Real, practical questions — not educational content already covered by the blog (that lives
 * in content/blog/*.mdx instead). No FAQPage JSON-LD here on purpose: Google discontinued
 * FAQPage rich results (May 2026), so schema would add markup with zero rich-result payoff — the
 * value here is the visible content itself, for users and for AI-assistant citation-worthiness,
 * not a snippet feature that no longer exists. Shared between the classic and V4 homepage
 * templates so the two variants can't drift out of sync on real business facts. */
const FAQS: FAQItem[] = [
  {
    question: "Do I need an appointment, or do you take walk-ins?",
    answer: `We're open ${BUSINESS_HOURS}, by appointment. Book online or text us — same-day openings do happen, so it's always worth asking.`,
  },
  {
    question: "What's your cancellation policy?",
    answer:
      "We ask for at least 24 hours' notice to reschedule or cancel. A card on file is required to book, but it's only ever charged for a no-show or a cancellation inside that 24-hour window ($25) — never for the service itself.",
  },
  {
    question: "What if I'm not happy with my manicure?",
    answer: (
      <>
        Let us know within 48 hours and we&apos;ll fix it free within 14 days of your appointment —
        no argument, no hassle. See our{" "}
        <Link href="/blog/2-week-guarantee-explained" className="text-[var(--color-accent)] hover:underline">
          full guarantee policy
        </Link>{" "}
        for exactly how it works.
      </>
    ),
  },
  {
    question: "Do you offer acrylic nails?",
    answer: (
      <>
        No — we only use hard gel and gel polish, on every service, no exceptions. See{" "}
        <Link href="/blog/no-acrylics-nail-health" className="text-[var(--color-accent)] hover:underline">
          why we made that call
        </Link>
        .
      </>
    ),
  },
  {
    question: "What makes your Russian manicure different?",
    answer: (
      <>
        A dry, e-file cuticle technique instead of a wet cut — cleaner cuticle line, better gel
        adhesion, longer wear. Full breakdown in our{" "}
        <Link href="/blog/russian-manicure-explained" className="text-[var(--color-accent)] hover:underline">
          Russian manicure guide
        </Link>
        .
      </>
    ),
  },
  {
    question: "Is there parking nearby?",
    answer: LOCATION.note,
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h2 className="text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        Frequently asked questions
      </h2>
      <div className="mt-6 flex flex-col gap-4">
        {FAQS.map((item) => (
          <div
            key={item.question}
            className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)]"
          >
            <p className="font-medium text-[var(--color-ink)]">{item.question}</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
