import { BUSINESS_NAME, LOCATION } from "@/lib/siteData";
import { V4_GIFTCARD_HEADLINE, V4_GIFTCARD_BODY } from "@/lib/siteDataV4";
import FadeUp from "./FadeUp";

/** A custom-designed card graphic in the site's own brand colors, rather than a generic stock
 * "gift card mockup" photo — reads more premium and avoids sourcing someone else's card design. */
function GiftCardGraphic() {
  return (
    <div className="aspect-[16/10] w-full max-w-sm rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] p-7 text-white shadow-2xl">
      <div className="flex h-full flex-col justify-between">
        <span className="text-sm font-semibold uppercase tracking-[0.25em]">{BUSINESS_NAME}</span>
        <div>
          <span className="text-xs uppercase tracking-widest text-white/70">Gift Card</span>
          <div className="mt-1 text-2xl" style={{ fontFamily: "var(--font-heading)" }}>
            Any Amount
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GiftCardV4() {
  return (
    <section id="gift-cards" className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <FadeUp className="flex justify-center lg:justify-start">
          <GiftCardGraphic />
        </FadeUp>
        <FadeUp delayMs={100}>
          <h2 className="text-3xl text-[var(--color-ink)] sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            {V4_GIFTCARD_HEADLINE}
          </h2>
          <p className="mt-4 max-w-md text-[var(--color-muted)]">{V4_GIFTCARD_BODY}</p>
          <div className="mt-8">
            {/* Pre-filled sms: link, not a lead-capture form — see PrepayV4.tsx for why. */}
            <a
              href={LOCATION.giftCardSmsHref}
              className="inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-8 py-4 text-base font-medium text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)]"
            >
              Request a Gift Card
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
