import { V4_WHY_CHOOSE_US } from "@/lib/siteDataV4";
import FadeUp from "./FadeUp";

export default function WhyChooseUsV4() {
  return (
    <section id="why-choose-us" className="mx-auto max-w-6xl px-6 py-24">
      <FadeUp className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl text-[var(--color-ink)] sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          Why Clients Choose AK.LUX.NAILS
        </h2>
      </FadeUp>

      <div className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {V4_WHY_CHOOSE_US.map((point, i) => (
          <FadeUp key={point.title} delayMs={(i % 3) * 80}>
            <div className="flex gap-4">
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]"
                aria-hidden
              />
              <div>
                <h3 className="font-medium text-[var(--color-ink)]">{point.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">{point.desc}</p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
