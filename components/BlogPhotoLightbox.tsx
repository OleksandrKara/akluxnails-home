"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

/**
 * Wraps a post's rendered MDX body and makes every photo in it open the same click-to-enlarge
 * lightbox as the homepage gallery (components/v4/GalleryV4.tsx) — via click delegation on this
 * wrapper, not a per-tag component override. MDX's `components` prop only intercepts elements
 * generated from markdown syntax (e.g. a real `![]()` or a `|table|`); every photo in this blog is
 * written as literal JSX (`<img src=... />`) directly in the .mdx source, which compiles straight
 * to the host element and never goes through that override — confirmed by testing it directly.
 * Delegation here works regardless of how a future image gets authored, no per-file changes.
 */
export default function BlogPhotoLightbox({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    if (!selected) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const target = e.target;
    if (target instanceof HTMLImageElement) {
      setSelected({ src: target.src, alt: target.alt });
    }
  }

  return (
    <>
      <div onClick={handleClick} className="[&_img]:cursor-zoom-in">
        {children}
      </div>

      {selected && (
        // touch-none + no stopPropagation on the photo below: same reasoning as the homepage
        // gallery — a swipe on mobile Chrome can otherwise be read as an edge-navigation gesture
        // instead of a tap-to-close, and letting a tap on the photo itself close it is normal
        // lightbox UX.
        <div
          className="fixed inset-0 z-50 flex touch-none items-center justify-center bg-black/90 p-4 sm:p-8"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Close"
            className="absolute right-4 top-4 text-3xl leading-none text-white/80 transition hover:text-white sm:right-8 sm:top-8"
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected.src}
            alt={selected.alt}
            className="max-h-[85vh] max-w-[95vw] rounded-[var(--radius-lg)] object-contain sm:max-w-3xl"
          />
        </div>
      )}
    </>
  );
}
