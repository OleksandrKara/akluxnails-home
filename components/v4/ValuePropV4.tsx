import Image from "next/image";
import { V4_VALUE_PROPS } from "@/lib/siteDataV4";
import FadeUp from "./FadeUp";

export default function ValuePropV4() {
  return (
    <section className="bg-[var(--color-ink)] py-24 text-[var(--color-bg-from)]">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        <FadeUp>
          <h2 className="text-3xl sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Why Our Clients Think We&rsquo;re Worth It
          </h2>
          <p className="mt-4 max-w-md text-[var(--color-muted-3)]">
            Because what happens to your natural nail over the next month depends on the hour you
            spent in the chair today.
          </p>

          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            {V4_VALUE_PROPS.map((v) => (
              <div key={v.title}>
                <dt className="font-medium text-white">{v.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-[var(--color-muted-3)]">{v.desc}</dd>
              </div>
            ))}
          </dl>
        </FadeUp>

        <FadeUp delayMs={120} className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--radius-xl)] shadow-2xl">
          <Image
            src="/images/v4/hand-detail.jpg"
            alt="Classic white French manicure by AK.LUX.NAILS"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        </FadeUp>
      </div>
    </section>
  );
}
