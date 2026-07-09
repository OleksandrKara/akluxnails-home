"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import FadeUp from "./FadeUp";

const PHOTOS = [
  { src: "/images/v4/gallery-red.jpg", alt: "Glossy red gel manicure by AK.LUX.NAILS" },
  { src: "/images/v4/gallery-yellow-floral.jpg", alt: "Pale yellow manicure with a floral accent nail by AK.LUX.NAILS" },
  { src: "/images/v4/gallery-french-profile.jpg", alt: "Classic white French manicure by AK.LUX.NAILS" },
  { src: "/images/v4/gallery-nude-glitter.jpg", alt: "Nude manicure with gold glitter by AK.LUX.NAILS" },
  { src: "/images/v4/gallery-milky.jpg", alt: "Milky white gel manicure by AK.LUX.NAILS" },
  { src: "/images/v4/gallery-bird-art.jpg", alt: "Nude manicure with a hand-painted bird accent nail by AK.LUX.NAILS" },
];

export default function GalleryV4() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selectedIndex === null) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedIndex(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedIndex]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <FadeUp className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl text-[var(--color-ink)] sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          Meet Our Work
        </h2>
        <p className="mt-4 text-[var(--color-muted)]">Real sets, real clients, straight from the studio.</p>
      </FadeUp>

      {/* Every photo is the same aspect-square size — with exactly 6 photos this fills a clean
          2-row x 3-col grid on desktop (3-row x 2-col on mobile) with no leftover empty cells,
          unlike the previous asymmetric big/wide spans which left gaps once the photo count and
          order changed. */}
      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {PHOTOS.map((photo, i) => (
          <FadeUp key={photo.src} delayMs={i * 80}>
            <button
              type="button"
              onClick={() => setSelectedIndex(i)}
              aria-label={`View larger: ${photo.alt}`}
              className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[var(--radius-xl)] shadow-lg"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </button>
          </FadeUp>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          // touch-none: without it, mobile Chrome can interpret a swipe inside the overlay as its
          // own edge-swipe back/forward navigation gesture instead of a tap-to-close, leaving the
          // lightbox open (or navigating the page) — this forces all touch handling through our
          // own onClick instead.
          className="fixed inset-0 z-50 flex touch-none items-center justify-center bg-black/90 p-4 sm:p-8"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            aria-label="Close"
            className="absolute right-4 top-4 text-3xl leading-none text-white/80 transition hover:text-white sm:right-8 sm:top-8"
          >
            ×
          </button>
          {/* No stopPropagation here on purpose: this box fills almost the entire viewport on
              mobile (w-full up to max-w-3xl, h-full up to 85vh), leaving only thin slivers of
              backdrop actually tappable to close. Letting a tap on the photo itself also close
              the lightbox — normal mobile lightbox behavior — is what makes closing reliable. */}
          <div className="relative h-full max-h-[85vh] w-full max-w-3xl">
            <Image
              src={PHOTOS[selectedIndex].src}
              alt={PHOTOS[selectedIndex].alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
