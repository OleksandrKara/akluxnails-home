import { CREDIBILITY_STATS } from "@/lib/siteData";
import FadeUp from "./FadeUp";

export default function TrustBarV4() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-card)]">
      <FadeUp className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-16 gap-y-6 px-6 py-10 sm:justify-between">
        {CREDIBILITY_STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div
              className="text-3xl text-[var(--color-ink)] sm:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {s.value}
            </div>
            <div className="mt-1 text-sm tracking-wide text-[var(--color-muted-2)]">{s.label}</div>
          </div>
        ))}
      </FadeUp>
    </section>
  );
}
