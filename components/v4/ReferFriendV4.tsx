import { LOCATION } from "@/lib/siteData";
import { V4_REFERRAL_HEADLINE, V4_REFERRAL_BODY } from "@/lib/siteDataV4";
import FadeUp from "./FadeUp";

export default function ReferFriendV4() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <FadeUp className="flex flex-col items-center gap-6 rounded-[var(--radius-xl)] bg-[var(--color-card)] px-8 py-12 text-center ring-1 ring-[var(--color-border)] sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h3 className="text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
            {V4_REFERRAL_HEADLINE}
          </h3>
          <p className="mt-2 max-w-md text-[var(--color-muted)]">{V4_REFERRAL_BODY}</p>
        </div>
        <a
          href={LOCATION.smsHref}
          className="inline-block shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-7 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)]"
        >
          Refer a Friend
        </a>
      </FadeUp>
    </section>
  );
}
