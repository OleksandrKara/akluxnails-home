"use client";

import { useRef, useState } from "react";

export interface CarouselPhoto {
  src: string;
  alt: string;
  label?: string;
}

/** Swipeable photo carousel (scroll-snap), same pattern as the reviews carousel: arrows on desktop,
 * dots underneath, no library. */
export default function TrainingCarousel({ photos }: { photos: CarouselPhoto[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function go(i: number) {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(photos.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  }

  return (
    <div className="relative">
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-[var(--radius-lg)] scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {photos.map((p, i) => (
          <div key={p.src} className="relative aspect-[4/3] w-full shrink-0 snap-center bg-[var(--color-accent-tint-2)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.alt} decoding="async" loading={i === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" />
            {p.label ? (
              <span className="absolute top-3 left-3 rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                {p.label}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      {(["prev", "next"] as const).map((d) => (
        <button
          key={d}
          type="button"
          aria-label={d === "next" ? "Next photo" : "Previous photo"}
          onClick={() => go(index + (d === "next" ? 1 : -1))}
          className={`absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-card)] text-[var(--color-ink)] shadow-md ring-1 ring-[var(--color-border)] hover:bg-white sm:flex ${d === "next" ? "right-3" : "left-3"}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d={d === "next" ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
          </svg>
        </button>
      ))}
      <div className="mt-3 flex justify-center gap-2" role="tablist" aria-label="Photos">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Photo ${i + 1}`}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-[var(--color-accent)]" : "w-2 bg-[var(--color-border-3)]"}`}
          />
        ))}
      </div>
    </div>
  );
}
