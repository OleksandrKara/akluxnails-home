interface BlogHeroProps {
  title: string;
  date: string;
  updated?: string;
  tags?: string[];
  image?: string;
}

/**
 * Full-bleed photo banner above each post, styled after pmu-annakara.com's own article headers
 * (a background photo + centered serif title) but rebuilt from scratch as real markup — a real
 * <h1>, not text baked into an image — so it stays crawlable, themeable, and legible regardless of
 * how bright or busy the underlying photo is.
 *
 * Fixed per-breakpoint heights (not vh) keep this predictable across mobile browser chrome
 * show/hide and avoid any layout shift while the photo loads. The flat, fairly dark overlay (not
 * just a bottom gradient) is deliberate: the title sits vertically centered, not anchored to the
 * bottom, so it needs contrast across the whole photo, including light pastel manicure shots.
 */
export default function BlogHero({ title, date, updated, tags, image }: BlogHeroProps) {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="hero relative flex h-[280px] items-center justify-center overflow-hidden sm:h-[380px] lg:h-[440px]">
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative banner photo from a
              fixed local set, not a next/image candidate: no responsive sizes needed at this one
              fixed crop, and it's already the same optimized file used in the post's own gallery. */}
          <img
            src={image}
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </>
      ) : (
        // The handful of posts with no photos of their own get the site's own background
        // gradient instead of a photo — never an unrelated stock image standing in for real work.
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-from)] via-[var(--color-bg-mid)] to-[var(--color-bg-to)]" />
      )}

      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h1
          className={`text-balance text-3xl leading-tight sm:text-4xl lg:text-5xl ${
            image ? "text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" : "text-[var(--color-ink)]"
          }`}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h1>

        <div
          className={`mt-5 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-[var(--radius-pill)] border px-4 py-1.5 text-xs uppercase tracking-wider backdrop-blur-sm ${
            image
              ? "border-white/30 bg-black/20 text-white/90"
              : "border-[var(--color-border)] bg-[var(--color-card)]/70 text-[var(--color-muted)]"
          }`}
        >
          <span>{formatDate(date)}</span>
          {updated && updated !== date && (
            <>
              <span aria-hidden="true">·</span>
              <span>Updated {formatDate(updated)}</span>
            </>
          )}
        </div>

        {tags && tags.length > 0 && (
          <p className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium ${
                  image
                    ? "bg-white/15 text-white backdrop-blur-sm"
                    : "bg-[var(--color-accent-tint)] text-[var(--color-accent-dark)]"
                }`}
              >
                {tag}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
