import { getCuratedMenu } from "@/lib/square/catalog";
import { FOUR_HANDS_REQUEST_ITEM_NAME } from "@/lib/services-config";
import { BUSINESS_HOURS, BUSINESS_NAME, LOCATION, NEARBY_AREAS } from "@/lib/siteData";
import { SERVICE_PAGES } from "@/lib/servicePages";

const SITE_URL = "https://akluxnails.com";

// Per request: prices below are live from Square and must never be baked into the build.
export const dynamic = "force-dynamic";

/** /llms.txt (llmstxt.org): a short plain-text summary of the business for AI assistants, added
 * 2026-09-29. Facts only, all from the same sources the site itself renders (siteData, the live
 * Square catalog), so nothing here can say something the site doesn't. */
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

## Pages
- [Prices](${SITE_URL}/prices)
${Object.values(SERVICE_PAGES)
  .map((p) => `- [${p.h1}](${SITE_URL}/${p.slug})`)
  .join("\n")}
- [What is a Russian manicure?](${SITE_URL}/blog/russian-manicure-explained)
- [Why we never use acrylic](${SITE_URL}/blog/no-acrylics-nail-health)
- [The 14-day guarantee](${SITE_URL}/blog/2-week-guarantee-explained)
- [Blog](${SITE_URL}/blog)
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
