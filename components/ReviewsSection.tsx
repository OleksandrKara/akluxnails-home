import { REVIEWS } from "@/lib/siteData";

export default function ReviewsSection() {
  return (
    <section id="reviews" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h2
        className="text-2xl text-[var(--color-ink)]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        What clients say
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {REVIEWS.map((r) => (
          <div key={r.name} className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-tint)] text-sm font-medium text-[var(--color-accent-dark)]">
                {r.initial}
              </span>
              <div>
                <div className="text-sm font-medium text-[var(--color-ink)]">{r.name}</div>
                <div className="text-xs text-[var(--color-muted-2)]">{r.date}</div>
              </div>
            </div>
            <div className="mt-2 text-[var(--color-gold)]" aria-hidden>{r.stars}</div>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
