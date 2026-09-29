"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { REVIEWS, GOOGLE_REVIEW_COUNT, GOOGLE_REVIEW_RATING, LOCATION, type Review } from "@/lib/siteData";
import GoogleLogo from "./GoogleLogo";

const READ_MORE_THRESHOLD = 200;

/** One real Google review, styled after the Google-review cards on the PMU site
 * (pmu-annakara-home's ReviewCard): initial avatar, name, month, Google mark, stars, text with a
 * real read-more toggle, "Posted on Google". */
function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.text.length > READ_MORE_THRESHOLD;
  const text = isLong && !expanded ? review.text.slice(0, READ_MORE_THRESHOLD).trimEnd() + "…" : review.text;

  return (
    <article className="flex h-full flex-col rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 shadow-[0_1px_3px_rgba(42,33,29,0.06)] ring-1 ring-[var(--color-border)]">
      <header className="flex items-center gap-3">
        {review.profileImage ? (
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[var(--color-accent-tint-2)]">
            <Image src={review.profileImage} alt={`${review.name} profile picture`} fill sizes="40px" className="object-cover" />
          </span>
        ) : (
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-white"
            aria-hidden
          >
            {review.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{review.name}</p>
          <p className="text-xs text-[var(--color-muted-2)]">{review.date}</p>
        </div>
        <GoogleLogo size={20} />
      </header>
      <div className="mt-3 text-[15px] tracking-[0.12em] text-[#F4B400]" aria-label="5 out of 5 stars">
        ★★★★★
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">
        {text}{" "}
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="font-semibold text-[var(--color-accent)] hover:underline"
          >
            {expanded ? "Hide" : "Read more"}
          </button>
        )}
      </p>
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-2)]">
        Posted on Google
      </p>
    </article>
  );
}

function Arrow({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir === 1 ? "Next reviews" : "Previous reviews"}
      onClick={onClick}
      className={`absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-card)] text-[var(--color-ink)] shadow-md ring-1 ring-[var(--color-border)] transition hover:ring-[var(--color-accent)] sm:flex ${
        dir === 1 ? "-right-4" : "-left-4"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d={dir === 1 ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
      </svg>
    </button>
  );
}

/** Real Google reviews as a swipeable carousel (scroll-snap, arrows on desktop), same pattern as
 * the PMU site's reviews block. The rating/count are our own figures, so the honest proof is the
 * link out to the live Google profile rather than any self-applied "verified" badge. */
export default function ReviewsSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    track.scrollBy({ left: ((card?.offsetWidth ?? 300) + 16) * direction, behavior: "smooth" });
  }

  return (
    <section id="reviews" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="flex flex-col items-center text-center">
        <GoogleLogo size={32} />
        <h2 className="mt-3 text-3xl text-[var(--color-ink)] sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          What Our Clients Say
        </h2>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xl font-bold text-[var(--color-ink)]">{GOOGLE_REVIEW_RATING}</span>
          <span className="tracking-[0.12em] text-[#F4B400]" aria-hidden>
            ★★★★★
          </span>
        </div>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted-2)]">
          Based on {GOOGLE_REVIEW_COUNT} Google reviews
        </p>
      </div>

      <div className="relative mt-8">
        <div
          ref={trackRef}
          className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0"
          style={{ scrollbarWidth: "none" }}
        >
          {REVIEWS.map((r) => (
            <div key={r.name} className="w-[82%] shrink-0 snap-start sm:w-[320px]">
              <ReviewCard review={r} />
            </div>
          ))}
        </div>
        <Arrow dir={-1} onClick={() => scrollByCard(-1)} />
        <Arrow dir={1} onClick={() => scrollByCard(1)} />
      </div>

      <div className="mt-6 text-center">
        <a
          href={LOCATION.googleProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-5 py-2.5 text-sm font-semibold text-[var(--color-accent)] ring-1 ring-[var(--color-accent-border-soft)] transition hover:bg-[var(--color-accent-tint-2)]"
        >
          Read all {GOOGLE_REVIEW_COUNT} reviews on Google →
        </a>
      </div>
    </section>
  );
}
