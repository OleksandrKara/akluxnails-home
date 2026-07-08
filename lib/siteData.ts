// Real business copy, reused from salonLandings' data/designCopy.ts (the mani funnel's source of
// truth for reviews/location/trust points) — this file adapts it for a general homepage rather
// than a single-service booking funnel.

export const BUSINESS_NAME = "AK.LUX.NAILS";
export const HEADLINE = "Nail Care, Done Right — Downtown San Diego";
export const SUBHEAD =
  "Russian manicures, gel, and nail art in a clean, modern studio. Nail-health first, no acrylics, ever.";

export const CREDIBILITY_STATS = [
  { value: "4.7★", label: "113 Google reviews" },
  { value: "4 wks", label: "chip-free wear" },
  { value: "100%", label: "acrylic-free" },
];

export const TRUST_POINTS = [
  { no: "01", title: "No acrylics, ever", desc: "Hard gel & gel polish only — kinder to your natural nails." },
  { no: "02", title: "Russian cuticle work", desc: "Precise dry-cuticle technique for a clean, flawless finish." },
  { no: "03", title: "2-week guarantee", desc: "Not happy? We fix it free within 14 days." },
  { no: "04", title: "Clean & hygienic", desc: "Sanitized tools and careful standards every single visit." },
];

export interface Review {
  initial: string;
  name: string;
  date: string;
  stars: string;
  text: string;
}

export const REVIEWS: Review[] = [
  {
    initial: "J",
    name: "Jessica M.",
    date: "2 weeks ago",
    stars: "★★★★★",
    text: "Best Russian manicure I've had in San Diego. Cuticles were flawless and it's still perfect after 3 weeks — no chips at all.",
  },
  {
    initial: "A",
    name: "Alina R.",
    date: "1 month ago",
    stars: "★★★★★",
    text: "So clean and precise. No acrylic, just healthy natural nails with a gorgeous glossy finish. Downtown location is easy too.",
  },
  {
    initial: "D",
    name: "Daniela K.",
    date: "1 month ago",
    stars: "★★★★★",
    text: "Finally a place that does a true Russian manicure. Super hygienic, relaxing, and they even offered me tea.",
  },
];

export const LOCATION = {
  name: BUSINESS_NAME,
  address: "1357 Seventh Ave, Ste C, San Diego, CA 92101",
  note: "Street parking available on 7th Ave · Open 7 days a week by appointment",
  // TODO(owner): fill in the real phone number and precise hours — placeholder for now.
  phone: "",
  mapsUrl: "https://maps.google.com/?q=1357+Seventh+Ave+Ste+C+San+Diego+CA+92101",
};

export const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL ?? "https://mani.akluxnails.com";

// Reused from salonLandings' CANCELLATION_POLICY_TEXT (frontend/src/data/designCopy.ts) — same
// $25 no-show/late-cancellation policy, shown at the card-on-file step so it's clear why a card is
// being collected before the appointment.
export const NO_SHOW_POLICY_SUMMARY =
  "A card on file protects your reserved time. It's only charged if you miss your appointment " +
  "or cancel with less than 24 hours' notice ($25 fee) — never for the service itself.";
