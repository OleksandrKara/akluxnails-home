/**
 * Standalone service pages (one per real, bookable service) — added 2026-09-29 for search.
 * Search Console showed Google already ranking the homepage for "russian pedicure san diego"
 * (~8.7) and nothing at all for "gel nail extensions san diego", since no page on the site was
 * about either service specifically.
 *
 * Deliberately NOT a copy of the blog explainers (content/blog/pedicure-options-explained.mdx,
 * gel-nail-extensions-explained.mdx): those answer "what is it", these answer "what does it cost,
 * how long does it take, what's included, book it" and link out to the explainer for the rest.
 * Two near-identical pages would compete with each other and read as thin duplicate content.
 *
 * Every price and duration on these pages is read live from Square (see ServicePage.tsx), never
 * written here, so the page can't drift out of date when a price changes. Every sentence below
 * must stay a plain fact about the real service (already stated elsewhere on the site or in the
 * Square catalog): no invented claims, stats, or comparisons with other salons.
 */

export interface ServicePageConfig {
  slug: string;
  /** Exact Square catalog item names: the main service first, then related ones shown alongside. */
  itemNames: string[];
  /** The curated menu group (lib/services-config.ts) whose add-on options apply here. */
  menuGroupTitle: string;
  /** Page title; the root layout's template appends " | AK.LUX.NAILS". */
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string[];
  included: string[];
  goodToKnow: string[];
  heroImage: string;
  heroAlt: string;
  gallery: { src: string; alt: string }[];
  explainer: { href: string; label: string };
}

export const SERVICE_PAGES: Record<string, ServicePageConfig> = {
  "russian-pedicure": {
    slug: "russian-pedicure",
    itemNames: ["Regular Pedicure Gel-Overlay (Dry)", "Pedicure (No Polish)"],
    menuGroupTitle: "Pedicures",
    metaTitle: "Russian Pedicure in Downtown San Diego",
    metaDescription:
      "Dry Russian pedicure with a gel-polish overlay at AK.LUX.NAILS, 1357 Seventh Ave, Downtown San Diego. Current prices, appointment length, and online booking.",
    h1: "Russian Pedicure in Downtown San Diego",
    intro: [
      "Our pedicure uses the same dry-cuticle technique as our Russian manicure: careful cuticle and sidewall work, shaping, and callus care, finished with a gel-polish overlay that keeps its color for weeks.",
      "\"Dry\" describes how the cuticle work is done, not a missing step. You still get a soak and the full treatment.",
    ],
    included: [
      "Soak and nail shaping",
      "Dry cuticle and sidewall work",
      "Callus care",
      "Gel-polish overlay in your color (or no polish at all, if you book Pedicure (No Polish))",
    ],
    goodToKnow: [
      "Gel only. We never use acrylic, on any service.",
      "Every pedicure is covered by our 14-day guarantee: if something isn't right, we fix it free.",
      "Men's pedicures are also available as a no-polish service.",
    ],
    heroImage: "/images/blog/pedicure-soft-pink-sandals-lifestyle.jpg",
    heroAlt: "Soft pink gel pedicure by AK.LUX.NAILS, shown in sandals",
    gallery: [
      { src: "/images/blog/pedicure-soft-pink.jpg", alt: "Soft pink gel-overlay pedicure" },
      { src: "/images/blog/pedicure-burgundy.jpg", alt: "Deep burgundy pedicure" },
      { src: "/images/blog/pedicure-coral-result-poster.jpg", alt: "Coral gel pedicure result" },
      { src: "/images/blog/pedicure-purple-glitter-result-poster.jpg", alt: "Purple glitter gel pedicure" },
      { src: "/images/blog/pedicure-coral-toes-result-poster.jpg", alt: "Coral gel pedicure, close-up" },
      { src: "/images/blog/pedicure-blue-process-poster.jpg", alt: "Blue gel pedicure during the appointment" },
    ],
    explainer: { href: "/blog/pedicure-options-explained", label: "Gel-overlay vs. no-polish pedicure: which to book" },
  },
  "gel-nail-extensions": {
    slug: "gel-nail-extensions",
    itemNames: ["Gel Nail Extension"],
    menuGroupTitle: "Manicures",
    metaTitle: "Gel Nail Extensions in Downtown San Diego, No Acrylic",
    metaDescription:
      "Gel nail extensions with no acrylic at AK.LUX.NAILS, 1357 Seventh Ave, Downtown San Diego. Current price, appointment length, upkeep, and online booking.",
    h1: "Gel Nail Extensions in Downtown San Diego",
    intro: [
      "A gel nail extension adds real length with a gel tip or sculpted gel form over your natural nail. No acrylic is used at any point.",
      "We shape to your natural nail bed. A moderate coffin, square, or almond shape holds up much better day to day than an extreme length.",
    ],
    included: [
      "Nail prep and cuticle work",
      "Length built with a gel tip or sculpted gel form",
      "Shaping to the shape you ask for",
      "Gel-polish finish",
    ],
    goodToKnow: [
      "Plan a fill appointment every 2 to 3 weeks, as your natural nail grows out.",
      "Coming in with an old set? Add a removal when you book, so we have time to take it off properly.",
      "Every set is covered by our 14-day guarantee: if something isn't right, we fix it free.",
    ],
    heroImage: "/images/blog/gel-extension-coffin-nude.jpg",
    heroAlt: "Nude coffin-shaped gel extension by AK.LUX.NAILS",
    gallery: [
      { src: "/images/blog/gel-extension-burgundy-coffin.jpg", alt: "Burgundy coffin-shaped gel extensions" },
      { src: "/images/blog/gel-extension-nude-rhinestone.jpg", alt: "Nude coffin gel extensions with a rhinestone accent" },
      { src: "/images/blog/gel-extension-nude-glitter-almond.jpg", alt: "Nude glitter-tip almond gel extensions" },
      { src: "/images/blog/gel-extension-pink-ombre-coffin.jpg", alt: "Soft pink ombre coffin gel extensions" },
      { src: "/images/blog/gel-extension-french-tip-square.jpg", alt: "French-tip square gel extensions" },
      { src: "/images/blog/gel-extension-blue-glitter-ombre.jpg", alt: "Blue glitter ombre gel extensions" },
    ],
    explainer: { href: "/blog/gel-nail-extensions-explained", label: "Gel nail extensions explained: shapes, length, and upkeep" },
  },
};
