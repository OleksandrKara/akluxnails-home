import { TRUST_POINTS } from "@/lib/siteData";

export default function TrustGrid() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
        {TRUST_POINTS.map((t) => (
          <div key={t.no} className="flex gap-4">
            <span
              className="shrink-0 text-2xl text-[var(--color-accent-tint)]"
              style={{ fontFamily: "var(--font-heading)", WebkitTextStroke: "1px var(--color-accent)" }}
              aria-hidden
            >
              {t.no}
            </span>
            <div>
              <h3 className="font-medium text-[var(--color-ink)]">{t.title}</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
