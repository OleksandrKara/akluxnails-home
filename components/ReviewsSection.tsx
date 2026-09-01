"use client";

import { useState } from "react";
import { REVIEWS, MORE_REVIEWS, GOOGLE_REVIEW_COUNT, GOOGLE_REVIEW_RATING, LOCATION, type Review } from "@/lib/siteData";
import GoogleLogo from "./GoogleLogo";

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)]">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-tint)] text-sm font-medium text-[var(--color-accent-dark)]">
          {review.initial}
        </span>
        {/* No per-review date shown: these are featured testimonials, not a live feed, so a
            relative-time label ("2 weeks ago") would silently go stale and never actually
            reflect when it was left — see real, current reviews via the Google link above
            instead. */}
        <div className="text-sm font-medium text-[var(--color-ink)]">{review.name}</div>
      </div>
      <div className="mt-2 text-[var(--color-gold)]" aria-hidden>{review.stars}</div>
      <p className="mt-2 text-sm text-[var(--color-muted)]">{review.text}</p>
    </div>
  );
}

export default function ReviewsSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="reviews" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h2 className="text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        What clients say
      </h2>

      <div className="mt-4 flex items-center gap-4 rounded-[var(--radius-lg)] bg-[var(--color-card)] p-4 ring-1 ring-[var(--color-border)]">
        <GoogleLogo size={34} />
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
              {GOOGLE_REVIEW_RATING}
            </span>
            <span className="tracking-wide text-[var(--color-gold)]" aria-hidden>★★★★★</span>
          </div>
          <div className="mt-0.5 text-xs text-[var(--color-muted-2)]">Based on {GOOGLE_REVIEW_COUNT} Google reviews</div>
        </div>
        {/* Links out to the real, live Google reviews rather than a self-applied "Verified"
            badge — the count/rating above are our own figures, not something this site can
            certify, so the honest version of that claim is "see for yourself on Google." */}
        <a
          href={LOCATION.googleProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-success-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-success)] hover:underline"
        >
          Read reviews on Google →
        </a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {REVIEWS.map((r) => (
          <ReviewCard key={r.name} review={r} />
        ))}
        {expanded && MORE_REVIEWS.map((r) => <ReviewCard key={r.name} review={r} />)}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-4 w-full rounded-[var(--radius-lg)] px-4 py-3 text-sm font-semibold text-[var(--color-accent)] ring-1 ring-[var(--color-accent-border-soft)] hover:bg-[var(--color-accent-tint-2)]"
      >
        {expanded ? "Show fewer reviews" : "Show more reviews"}
      </button>
    </section>
  );
}
