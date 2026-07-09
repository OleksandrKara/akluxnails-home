import Image from "next/image";
import FadeUp from "./FadeUp";

const PHOTOS = [
  { src: "/images/nailart1.jpg", alt: "Hand-painted nail art by AK.LUX.NAILS", span: "sm:col-span-2 sm:row-span-2" },
  { src: "/images/customer1.jpg", alt: "A happy AK.LUX.NAILS client showing off her manicure", span: "" },
  { src: "/images/milkynails.jpg", alt: "Milky white gel manicure by AK.LUX.NAILS", span: "" },
  { src: "/images/nudemani1.jpg", alt: "Nude gel manicure by AK.LUX.NAILS", span: "sm:col-span-2" },
];

export default function GalleryV4() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <FadeUp className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl text-[var(--color-ink)] sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          Meet Our Work
        </h2>
        <p className="mt-4 text-[var(--color-muted)]">Real sets, real clients, straight from the studio.</p>
      </FadeUp>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {PHOTOS.map((photo, i) => (
          <FadeUp key={photo.src} delayMs={i * 80} className={`relative aspect-square overflow-hidden rounded-[var(--radius-xl)] shadow-lg ${photo.span}`}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              className="object-cover transition duration-500 hover:scale-105"
            />
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
