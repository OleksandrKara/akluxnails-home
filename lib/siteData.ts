// Real business copy, reused from salonLandings' data/designCopy.ts (the mani funnel's source of
// truth for reviews/location/trust points) — this file adapts it for a general homepage rather
// than a single-service booking funnel.

export const BUSINESS_NAME = "AK.LUX.NAILS";
export const HEADLINE = "Nail Care, Done Right — Downtown San Diego";
export const SUBHEAD =
  "Russian manicures, gel, and nail art in a clean, modern studio. Nail-health first, no acrylics, ever.";

export const GOOGLE_REVIEW_COUNT = 113;
export const GOOGLE_REVIEW_RATING = "4.7";

export const CREDIBILITY_STATS = [
  { value: "4.7★", label: `${GOOGLE_REVIEW_COUNT} Google reviews` },
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

// Reused (and lightly trimmed of ads-specific framing) from salonLandings' MORE_REVIEWS — shown
// on "show more reviews" expansion, both for social proof depth and SEO content.
export const MORE_REVIEWS: Review[] = [
  {
    initial: "M",
    name: "Marisol T.",
    date: "2 months ago",
    stars: "★★★★★",
    text: "The attention to detail is unreal. My nails have never looked this clean and healthy.",
  },
  {
    initial: "S",
    name: "Sophia L.",
    date: "2 months ago",
    stars: "★★★★★",
    text: "Booked from Instagram and it looked exactly like the photos. Lasted almost 4 weeks with zero lifting. Highly recommend.",
  },
  {
    initial: "V",
    name: "Valeria P.",
    date: "3 months ago",
    stars: "★★★★★",
    text: "Beautiful studio, spotless tools, and the most precise cuticle work I've seen. My new go-to in Downtown SD.",
  },
];

export const LOCATION = {
  name: BUSINESS_NAME,
  address: "1357 Seventh Ave, Ste C, San Diego, CA 92101",
  note: "Street parking available on 7th Ave · Open 7 days a week by appointment",
  phone: "619-323-1185",
  phoneHref: "tel:+16193231185",
  // Google's "universal" directions URL (api=1) — opens turn-by-turn navigation in the Maps app
  // on mobile or maps.google.com on desktop, unlike a plain `?q=` search-pin link.
  mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=1357+Seventh+Ave+Ste+C+San+Diego+CA+92101",
  // "?&body=" works across both iOS and Android SMS apps, unlike either alone.
  smsHref: "sms:+16193231185?&body=Hi!%20I%20have%20a%20question%20for%20AK.LUX.NAILS.%20",
  groupBookingSmsHref:
    "sms:+16193231185?&body=Hi!%20I%27d%20like%20to%20book%20for%20a%20group%20at%20AK.LUX.NAILS.%20We%20are%20___%20people%2C%20looking%20for%20___.",
  giftCardSmsHref:
    "sms:+16193231185?&body=Hi!%20I%27d%20like%20to%20request%20a%20gift%20card%20for%20%24___%20at%20AK.LUX.NAILS.",
  prepaySmsHref:
    "sms:+16193231185?&body=Hi!%20I%27d%20like%20to%20prepay%20for%203%2B%20visits%20and%20save%2010%25%20at%20AK.LUX.NAILS.%20I%27m%20interested%20in%20___.",
};

export const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL ?? "https://mani.akluxnails.com";

// Reused from salonLandings' CANCELLATION_POLICY_TEXT (frontend/src/data/designCopy.ts) — same
// $25 no-show/late-cancellation policy, shown at the card-on-file step so it's clear why a card is
// being collected before the appointment.
export const NO_SHOW_POLICY_SUMMARY =
  "A card on file protects your reserved time. It's only charged if you miss your appointment " +
  "or cancel with less than 24 hours' notice ($25 fee) — never for the service itself.";

// Verbatim from salonLandings' designCopy.ts — the same policy text and SMS consent language
// already in use (and legally reviewed) for the mani funnel's booking flow.
export const CANCELLATION_POLICY_TEXT = `We ask that you please reschedule or cancel at least 24 hours before your appointment, or you may be charged a cancellation fee of $25.00.

CANCELLATION & NO-SHOW
• Missed appointments or cancellations made with less than 24 hours' notice will incur a $25 fee.
• This policy helps us respect the time of our nail technicians and accommodate other clients waiting for an opening.

We understand that emergencies happen, and we will always do our best to accommodate when possible. Thank you for respecting our time and the time of our masters.

SERVICE SATISFACTION & NO REFUND
At AK.LUX.NAILS, we take great pride in the quality of our work and stand behind every service we provide. Please note:
• All services are non-refundable once completed.
• By booking, you agree that results are subjective and may vary based on personal preference.
• We strongly encourage clients to communicate their preferences during the appointment to ensure the desired result.

If you are not fully satisfied:
• You must notify us within 48 hours of your appointment.
• We offer a complimentary fix within 14 days.

Refunds will not be issued for dissatisfaction after the service has been completed.

IMPORTANT
Failure to contact us within the specified time frame or refusal of a correction appointment will void any service guarantee.

By booking an appointment, you agree to our cancellation and no-refund policy.

Warmly,
AK.LUX.NAILS`;

export const SMS_CONSENT_TEXT =
  "By checking this box, I agree to receive recurring automated marketing & appointment text messages (offers, promotions & reminders) from AK.LUX.NAILS at the number I provided. Consent is not a condition of purchase. Message frequency varies. Msg & data rates may apply. Reply STOP to cancel, HELP for help.";
