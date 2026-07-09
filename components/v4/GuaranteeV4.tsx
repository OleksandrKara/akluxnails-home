import { V4_GUARANTEE_HEADLINE, V4_GUARANTEE_BODY } from "@/lib/siteDataV4";
import FadeUp from "./FadeUp";

export default function GuaranteeV4() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <FadeUp className="rounded-[var(--radius-xl)] bg-[var(--color-accent-tint-2)] px-8 py-14 text-center ring-1 ring-[var(--color-accent-border-soft)] sm:px-16">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
          Our Promise
        </span>
        <h2
          className="mt-4 text-3xl text-[var(--color-ink)] sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {V4_GUARANTEE_HEADLINE}
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-[var(--color-muted)]">{V4_GUARANTEE_BODY}</p>
      </FadeUp>
    </section>
  );
}
