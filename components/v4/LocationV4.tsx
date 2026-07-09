import { LOCATION } from "@/lib/siteData";
import { V4_LOCATION_NOTE, V4_HOURS } from "@/lib/siteDataV4";
import FadeUp from "./FadeUp";

export default function LocationV4() {
  return (
    <section id="location" className="mx-auto max-w-4xl px-6 py-24">
      <FadeUp className="rounded-[var(--radius-xl)] bg-[var(--color-card)] p-10 text-center ring-1 ring-[var(--color-border)] sm:p-14">
        <h2 className="text-3xl text-[var(--color-ink)] sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          Visit Us
        </h2>
        <p className="mt-4 font-medium text-[var(--color-ink)]">{LOCATION.address}</p>
        <p className="mt-2 text-[var(--color-muted)]">{V4_LOCATION_NOTE}</p>
        <p className="mt-1 text-[var(--color-muted)]">{V4_HOURS}</p>
        <div className="mt-8">
          <a
            href={LOCATION.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-7 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)]"
          >
            Get Directions →
          </a>
        </div>
      </FadeUp>
    </section>
  );
}
