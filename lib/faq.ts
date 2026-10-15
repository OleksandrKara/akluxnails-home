import { BUSINESS_HOURS, LOCAL_AREA_NOTE, LOCATION } from "./siteData";

/** One answer: plain text, or text around one link (rendered as a link on the site, as "label
 * (url)" in llms.txt). Single source for components/FAQSection.tsx and app/llms.txt, so the two
 * can never say different things. */
export type FaqAnswer = string | { before: string; link: { href: string; label: string }; after: string };

export interface FaqItem {
  question: string;
  answer: FaqAnswer;
}

/** Real, practical questions — not educational content already covered by the blog (that lives
 * in content/blog/*.mdx instead). */
export const FAQS: FaqItem[] = [
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
    answer: {
      before: "Let us know within 48 hours and we'll fix it free within 14 days of your appointment — no argument, no hassle. See our ",
      link: { href: "/blog/2-week-guarantee-explained", label: "full guarantee policy" },
      after: " for exactly how it works.",
    },
  },
  {
    question: "Do you offer acrylic nails?",
    answer: {
      before: "No — we only use hard gel and gel polish, on every service, no exceptions. See ",
      link: { href: "/blog/no-acrylics-nail-health", label: "why we made that call" },
      after: ".",
    },
  },
  {
    question: "What makes your Russian manicure different?",
    answer: {
      before:
        "A dry, e-file cuticle technique instead of a wet cut — cleaner cuticle line, better gel adhesion, longer wear. Full breakdown in our ",
      link: { href: "/blog/russian-manicure-explained", label: "Russian manicure guide" },
      after: ".",
    },
  },
  {
    question: "Is there parking nearby?",
    answer: `${LOCATION.note} ${LOCAL_AREA_NOTE}`,
  },
];

export function faqAnswerText(a: FaqAnswer, siteUrl: string): string {
  return typeof a === "string" ? a : `${a.before}${a.link.label} (${siteUrl}${a.link.href})${a.after}`;
}
