import { LOCATION } from "@/lib/siteData";

export default function LocationSection() {
  return (
    <section id="location" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h2
        className="text-2xl text-[var(--color-ink)]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Visit us
      </h2>
      <div className="mt-4 rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)]">
        <p className="font-medium text-[var(--color-ink)]">{LOCATION.name}</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{LOCATION.address}</p>
        <p className="mt-1 text-sm text-[var(--color-muted-2)]">{LOCATION.note}</p>
        <a
          href={LOCATION.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          Get directions →
        </a>
      </div>
    </section>
  );
}
