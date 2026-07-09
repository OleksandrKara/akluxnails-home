import { V4_STORY_HEADLINE, V4_STORY_BODY, V4_INSTAGRAM_HANDLE } from "@/lib/siteDataV4";
import FadeUp from "./FadeUp";

export default function PostStoryV4() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <FadeUp className="flex flex-col items-center gap-6 rounded-[var(--radius-xl)] bg-[var(--color-card)] px-8 py-12 text-center ring-1 ring-[var(--color-border)] sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h3 className="text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
            {V4_STORY_HEADLINE}
          </h3>
          <p className="mt-2 max-w-md text-[var(--color-muted)]">
            {V4_STORY_BODY} Tag {V4_INSTAGRAM_HANDLE}.
          </p>
        </div>
        <a
          href={`https://www.instagram.com/${V4_INSTAGRAM_HANDLE.replace("@", "")}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block shrink-0 rounded-[var(--radius-pill)] px-7 py-3.5 text-sm font-medium text-[var(--color-ink)] ring-1 ring-[var(--color-border-3)] transition hover:bg-[var(--color-accent-tint-2)]"
        >
          Follow {V4_INSTAGRAM_HANDLE}
        </a>
      </FadeUp>
    </section>
  );
}
