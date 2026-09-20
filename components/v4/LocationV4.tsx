import { LOCATION, LOCAL_AREA_NOTE, NEARBY_AREAS } from "@/lib/siteData";
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
        <p className="mt-1 text-[var(--color-muted)]">{LOCAL_AREA_NOTE}</p>
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

      {/* Same honest "areas we serve" list as the classic template's LocationSection — kept as
          one shared list (NEARBY_AREAS) so the two homepage templates can't drift on this fact. */}
      <FadeUp className="mt-6 rounded-[var(--radius-xl)] bg-[var(--color-card)] p-10 text-center ring-1 ring-[var(--color-border)] sm:p-14">
        <p className="font-medium text-[var(--color-ink)]">Areas we serve</p>
        <p className="mt-2 text-[var(--color-muted)]">
          Most of our clients come from a 15-20 minute drive, mainly:
        </p>
        <ul className="mx-auto mt-4 grid max-w-md grid-cols-1 gap-x-6 gap-y-1.5 text-left text-sm text-[var(--color-muted)] sm:grid-cols-2">
          {NEARBY_AREAS.map((area) => (
            <li key={area} className="flex gap-2">
              <span className="text-[var(--color-accent)]" aria-hidden="true">
                •
              </span>
              {area}
            </li>
          ))}
        </ul>
      </FadeUp>
    </section>
  );
}
