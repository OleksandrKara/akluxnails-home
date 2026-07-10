import { LOCATION } from "@/lib/siteData";
import { V4_PREPAY_HEADLINE, V4_PREPAY_BODY } from "@/lib/siteDataV4";
import FadeUp from "./FadeUp";

// A pre-filled sms: link instead of a lead-capture form — a form posts to /api/v4-request, which
// only writes a note on the Square customer record with nothing actively notifying staff, so a
// request could sit unseen indefinitely. Texting the salon directly is guaranteed to land
// somewhere staff actually check, same reasoning as StickyBookBar/HeaderV4's "Text Us" and
// ReferFriendV4's "Refer a Friend" link.
export default function PrepayV4() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <FadeUp className="flex flex-col items-center gap-6 rounded-[var(--radius-xl)] bg-[var(--color-card)] px-8 py-12 text-center ring-1 ring-[var(--color-border)] sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h3 className="text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
            {V4_PREPAY_HEADLINE}
          </h3>
          <p className="mt-2 max-w-md text-[var(--color-muted)]">{V4_PREPAY_BODY}</p>
        </div>
        <a
          href={LOCATION.prepaySmsHref}
          className="inline-block shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-7 py-3.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)]"
        >
          Ask About Prepaid Packages
        </a>
      </FadeUp>
    </section>
  );
}
