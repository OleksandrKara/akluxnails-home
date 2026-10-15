import Link from "next/link";
import { FAQS } from "@/lib/faq";

/** Questions and answers live in lib/faq.ts (also read by /llms.txt). No FAQPage JSON-LD here on
 * purpose: Google discontinued FAQPage rich results (May 2026), so schema would add markup with
 * zero rich-result payoff — the value here is the visible content itself, for users and for
 * AI-assistant citation-worthiness. Shared between the classic and V4 homepage templates so the
 * two variants can't drift out of sync on real business facts. */
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
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {typeof item.answer === "string" ? (
                item.answer
              ) : (
                <>
                  {item.answer.before}
                  <Link href={item.answer.link.href} className="text-[var(--color-accent)] hover:underline">
                    {item.answer.link.label}
                  </Link>
                  {item.answer.after}
                </>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
