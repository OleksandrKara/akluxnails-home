import { getCuratedMenu } from "@/lib/square/catalog";
import { FOUR_HANDS_REQUEST_ITEM_NAME } from "@/lib/services-config";
import {
  BUSINESS_HOURS,
  BUSINESS_NAME,
  FACEBOOK_URL,
  GOOGLE_REVIEW_COUNT,
  GOOGLE_REVIEW_RATING,
  INSTAGRAM_URL,
  LOCATION,
  NEARBY_AREAS,
  PRESS_MENTIONS,
  REVIEWS,
  TRUST_POINTS,
  YELP_URL,
} from "@/lib/siteData";
import { SERVICE_PAGES } from "@/lib/servicePages";
import { FAQS, faqAnswerText } from "@/lib/faq";
import { getAllPosts } from "@/lib/blog";

const SITE_URL = "https://akluxnails.com";

// Per request: prices below are live from Square and must never be baked into the build.
export const dynamic = "force-dynamic";

/** /llms.txt (llmstxt.org): a plain-text summary of the business for AI assistants, added
 * 2026-09-29. Facts only, all from the same sources the site itself renders (siteData, the live
 * Square catalog, the service pages, the FAQ, the blog), so nothing here can say something the
 * site doesn't. Extended 2026-10-15 (AI-readiness audit, Notion #26): it was 1.5 KB next to the
 * PMU site's 40 KB; now also the Google rating, real reviews (verbatim), what each service
 * includes, the FAQ (which covers the cancellation policy), every blog post and the official profiles. */
export async function GET() {
  let priceLines: string[] = [];
  try {
    const menu = await getCuratedMenu();
    priceLines = menu.groups.flatMap((g) =>
      g.services
        .filter((s) => s.name !== FOUR_HANDS_REQUEST_ITEM_NAME)
        .map((s) => {
          const min = Math.min(...s.variations.map((v) => v.priceCents)) / 100;
          return `- ${s.name}: ${s.variations.length > 1 ? "from " : ""}$${min.toFixed(0)}`;
        }),
    );
  } catch (err) {
    console.error("llms.txt: failed to load live catalog", err);
  }

  const body = `# ${BUSINESS_NAME}

> Nail salon in Downtown San Diego specializing in the Russian (dry-cuticle) manicure and pedicure. Gel only: no acrylic on any service. Manicures, pedicures, and extensions come with a 14-day guarantee.

- Address: ${LOCATION.address}
- Phone: ${LOCATION.phone}
- Hours: ${BUSINESS_HOURS}, by appointment
- Book online: ${SITE_URL}
- Areas clients come from: ${NEARBY_AREAS.join(", ")}

## Prices
${priceLines.length > 0 ? priceLines.join("\n") : "- See " + SITE_URL + "/prices"}

Full, current price list: ${SITE_URL}/prices

## Reviews
Rated ${GOOGLE_REVIEW_RATING} on Google from ${GOOGLE_REVIEW_COUNT} reviews: ${LOCATION.googleProfileUrl}

${REVIEWS.map((r) => `> "${r.text}" (${r.name}, Google review, ${r.date})`).join("\n\n")}

## Why clients choose us
${TRUST_POINTS.map((t) => `- ${t.title}: ${t.desc}`).join("\n")}

## Services in detail
${Object.values(SERVICE_PAGES)
  .map(
    (p) => `### ${p.h1}
${p.intro.join(" ")}

What's included:
${p.included.map((i) => `- ${i}`).join("\n")}

Good to know:
${p.goodToKnow.map((i) => `- ${i}`).join("\n")}

More: ${SITE_URL}/${p.slug}`,
  )
  .join("\n\n")}

## FAQ
${FAQS.map((f) => `### ${f.question}\n${faqAnswerText(f.answer, SITE_URL)}`).join("\n\n")}

## Pages
- [Prices](${SITE_URL}/prices)
${Object.values(SERVICE_PAGES)
  .map((p) => `- [${p.h1}](${SITE_URL}/${p.slug})`)
  .join("\n")}
- [What is a Russian manicure?](${SITE_URL}/blog/russian-manicure-explained)
- [Why we never use acrylic](${SITE_URL}/blog/no-acrylics-nail-health)
- [The 14-day guarantee](${SITE_URL}/blog/2-week-guarantee-explained)
- [Blog](${SITE_URL}/blog)

## Blog
${getAllPosts()
  .map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug})${p.description ? `: ${p.description}` : ""}`)
  .join("\n")}

## Press
${PRESS_MENTIONS.map((m) => `- ${m.outlet}: [${m.title}](${m.url})`).join("\n")}

## Official profiles
- Google: ${LOCATION.googleProfileUrl}
- Yelp: ${YELP_URL}
- Instagram: ${INSTAGRAM_URL}
- Facebook: ${FACEBOOK_URL}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
