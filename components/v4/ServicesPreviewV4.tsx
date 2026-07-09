import Image from "next/image";
import BookNowButton from "../BookNowButton";
import { getCuratedMenu } from "@/lib/square/catalog";
import { toWireItem } from "@/lib/square/wire";
import FadeUp from "./FadeUp";

function formatPrice(cents: number): string {
  if (cents === 0) return "Request";
  return `$${(cents / 100).toFixed(0)}`;
}

// A premium homepage teases flagship manicure/pedicure work rather than mechanically showing one
// item per catalog group (which would surface Men's Services/4-Hand Appointments alongside them,
// diluting the "luxury Russian manicure" positioning) — "View All Services" opens the full menu.
// Each gets a small representative photo, matching svitnail.com's catalog card layout. Three are
// real AK.LUX.NAILS work; the pedicure photo is a verified Unsplash photo (Unsplash License, free
// commercial use) of polished toes with no bowl/water/soaking visible anywhere in frame — this
// salon does a dry pedicure (no foot soak), so anything showing a soak would misrepresent the
// actual service.
const FEATURED_NAMES = [
  "Regular Manicure Gel-Overlay",
  "Gel Nail Extension",
  "Japanese manicure Deluxe (with massage & spa hand care)",
  "Regular Pedicure Gel-Overlay",
];

const SERVICE_PHOTOS: Record<string, { src: string; alt: string; position?: string }> = {
  // position shifted up so the nail tips (near the top of this source photo) aren't cropped out
  // of the card's short thumbnail frame.
  "Regular Manicure Gel-Overlay": {
    src: "/images/v4/regular-manicure.jpg",
    alt: "Gel-overlay manicure by AK.LUX.NAILS",
    position: "center 20%",
  },
  "Gel Nail Extension": { src: "/images/nail3.jpg", alt: "Gel nail extensions by AK.LUX.NAILS" },
  "Japanese manicure Deluxe (with massage & spa hand care)": {
    src: "/images/nudemani1.jpg",
    alt: "Deluxe manicure with spa hand care by AK.LUX.NAILS",
  },
  "Regular Pedicure Gel-Overlay": { src: "/images/v4/pedicure-dry.jpg", alt: "Polished pedicure toes" },
};

export default async function ServicesPreviewV4() {
  const menu = await getCuratedMenu();
  const allServices = menu.groups.flatMap((group) => group.services.map((service) => ({ group, service })));
  const featured = FEATURED_NAMES
    .map((name) => allServices.find((f) => f.service.name === name))
    .filter((f): f is { group: typeof menu.groups[number]; service: typeof menu.groups[number]["services"][number] } => Boolean(f));

  return (
    <section id="services" className="mx-auto max-w-6xl px-6 py-24">
      <FadeUp className="text-center">
        <h2 className="text-3xl text-[var(--color-ink)] sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          Signature Services
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted)]">
          A curated menu built around one promise: your natural nail stays healthy. Tap any service to book it directly.
        </p>
      </FadeUp>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map(({ group, service }, i) => {
          const cheapest = service.variations.reduce((min, v) => (v.priceCents < min.priceCents ? v : min));
          const wireService = toWireItem(service);
          const wireVariation = wireService.variations.find((v) => v.variationId === cheapest.variationId)!;
          const preselection =
            wireService.variations.length === 1
              ? { service: wireService, variation: wireVariation }
              : { service: wireService, variation: null };
          const photo = SERVICE_PHOTOS[service.name];
          return (
            <FadeUp key={service.itemId} delayMs={i * 80}>
              <BookNowButton
                preselection={preselection}
                className="group flex h-full w-full flex-col items-start overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-card)] text-left ring-1 ring-[var(--color-border)] transition hover:-translate-y-1 hover:shadow-xl"
              >
                {photo && (
                  <span className="relative block h-40 w-full overflow-hidden">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      style={photo.position ? { objectPosition: photo.position } : undefined}
                    />
                  </span>
                )}
                <span className="flex w-full flex-col items-start p-7">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
                    {group.title}
                  </span>
                  <span
                    className="mt-3 text-xl text-[var(--color-ink)]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {service.name}
                  </span>
                  <span className="mt-4 text-lg font-medium text-[var(--color-accent-dark)]">
                    {service.variations.length === 1
                      ? formatPrice(service.variations[0].priceCents)
                      : `from ${formatPrice(cheapest.priceCents)}`}
                  </span>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ink)] transition group-hover:gap-2">
                    Book Now →
                  </span>
                </span>
              </BookNowButton>
            </FadeUp>
          );
        })}
      </div>

      <FadeUp className="mt-12 text-center">
        <BookNowButton className="inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-8 py-4 text-base font-medium text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)]">
          View All Services
        </BookNowButton>
      </FadeUp>
    </section>
  );
}
