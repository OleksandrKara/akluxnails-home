import Image from "next/image";
import FadeUp from "./FadeUp";

/**
 * Hygiene / sterilization trust block (added 2026-09-29, owner request).
 *
 * Every claim here was checked against two sources and must stay true to both:
 *  - the salon's own SOP "Nail Tech: Cleaning & Sterilization After Service" (salaryReview SOP #16):
 *    after every service, metal tools go through disinfectant soak, brush scrub, full drying,
 *    sealed sterilization pouch, dry-heat sterilizer; the table, lamp and equipment are wiped with
 *    disinfectant; files/buffers/cotton are replaced with new ones;
 *  - California's rules for nail salons (Title 16 CCR, Article 12): tools must be *disinfected*
 *    (§979) and single-use items thrown away after one client (§981). Sterilization is only
 *    mandated for electrolysis tools (§982), so sterilizing nail tools genuinely goes beyond the
 *    state requirement.
 * No numbers (temperatures, times) on purpose, and nothing the SOP doesn't cover (gloves, masks,
 * pedicure basins). If the SOP changes, re-check this copy.
 *
 * The photo is real, from the studio (dry pedicure: masked and gloved artist, tray of metal tools
 * next to the opened pouch, disposable cover), owner-provided 2026-09-29 and cropped below the
 * client's face (no consent on file for showing it). Not stock: a stock photo in a block whose whole point is "this is really how we work" would
 * undercut it.
 */
const POINTS = [
  {
    title: "Sterilized, not just disinfected",
    desc: "After every client, metal tools are cleaned, disinfected, and sterilized in a dry-heat sterilizer.",
    icon: (
      <path d="M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 19.3 5 15.4 5 11V6l7-3zm-3.2 9.2l2.2 2.2 4.4-4.4" />
    ),
  },
  {
    title: "Sealed pouch for every client",
    desc: "Your tools come out of their own sealed sterilization pouch.",
    icon: <path d="M5 8h14v11a1 1 0 01-1 1H6a1 1 0 01-1-1V8zm0 0l2-4h10l2 4M9 12h6" />,
  },
  {
    title: "New file and buffer, every time",
    desc: "Files, buffers and cotton are single-use. New for you, thrown away after.",
    icon: <path d="M7 20L17 4M10 20l10-16M4 20l10-16" />,
  },
  {
    title: "Station reset after every service",
    desc: "Table, lamp and equipment are wiped with disinfectant before the next client sits down.",
    icon: <path d="M4 20h16M6 20V10h12v10M9 6l1.5-2h3L15 6M12 13v4" />,
  },
];

export default function HygieneV4() {
  return (
    <section id="hygiene" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="grid items-center gap-8 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-accent-tint-2)] ring-1 ring-[var(--color-accent-border-soft)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-0">
        <FadeUp className="relative h-64 w-full sm:h-72 md:h-full md:min-h-[440px]">
          <Image
            src="/images/hygiene-dry-pedicure.jpg"
            alt="Dry pedicure at AK.LUX.NAILS: artist in a mask and gloves, tray of metal tools, disposable cover under the client's feet"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover object-[40%_45%]"
          />
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-[var(--color-ink)] shadow-sm backdrop-blur">
            Real photo from our studio
          </span>
        </FadeUp>

        <div className="px-6 pb-8 md:px-10 md:py-10">
          <FadeUp>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-dark)]">
              Hygiene
            </span>
            <h2
              className="mt-3 text-3xl leading-tight text-[var(--color-ink)] sm:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Clean, sterile, every single time
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
              California requires nail salons to disinfect their tools. We go one step further and
              sterilize them, after every client.
            </p>
          </FadeUp>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {POINTS.map((p, i) => (
              <FadeUp key={p.title} delayMs={(i % 2) * 80}>
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-accent-dark)] ring-1 ring-[var(--color-accent-border-soft)]">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      {p.icon}
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-ink)]">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{p.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
