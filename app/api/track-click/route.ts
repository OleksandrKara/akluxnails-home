import { cookies } from "next/headers";
import { getVariantById } from "@/lib/variant";
import { getPool, MARKETING_BUSINESS_ID } from "@/lib/db";
import { recordEvent } from "@/lib/tracking";

// Called via navigator.sendBeacon from BookNowButton and the chat button — best-effort, never
// blocks the click-out. Unlike Proxy (which forwards ids via request headers for the initial page
// render), this is a separate, later request: the vid/variant cookies set on that first response
// are just normal cookies by now, so reading them here is reliable.
//
// A `target: "sms"` tap (chat button, 2026-10-14) also carries the page, its topic and the
// visitor's first-touch attribution, which salaryReview's SmsWebsiteLeadService reads to give
// the text that follows its traffic source. The homepage's own marketing.visits row, when there is
// one, wins over the browser-kept first touch.
const PASS_THROUGH = [
  "source", "path", "topic", "utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid", "referrer",
  "landing_path", "ga_client_id",
] as const;

export async function POST(req: Request) {
  try {
    const jar = await cookies();
    const visitorId = jar.get("vid")?.value;
    const variantId = jar.get("variant")?.value;
    if (!visitorId || !variantId) return new Response(null, { status: 204 });

    const variant = await getVariantById(variantId);
    if (!variant) return new Response(null, { status: 204 });

    const body = await req.json().catch(() => ({}));
    const metadata: Record<string, string> = { target: typeof body?.target === "string" ? body.target.slice(0, 40) : "unknown" };
    for (const k of PASS_THROUGH) {
      const v = body?.[k];
      if (typeof v === "string" && v) metadata[k] = v.slice(0, k === "referrer" ? 500 : 200);
    }
    if (metadata.target === "sms") {
      const { rows } = await getPool().query(
        `SELECT utm_source, utm_medium, utm_campaign, gclid, fbclid, referrer, landing_path
           FROM marketing.visits WHERE visitor_id = $1 AND business_id = $2 ORDER BY occurred_at ASC LIMIT 1`,
        [visitorId, MARKETING_BUSINESS_ID],
      );
      const first = rows[0];
      if (first && (first.utm_source || first.gclid || first.fbclid || first.referrer)) {
        for (const k of ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid", "referrer", "landing_path"] as const) {
          if (first[k]) metadata[k] = String(first[k]);
          else delete metadata[k];
        }
      }
    }
    await recordEvent({
      visitorId,
      landingPageId: variant.landingPageId,
      variantId,
      eventType: "click",
      metadata,
    });
  } catch (err) {
    console.error("Failed to record click event", err);
  }
  return new Response(null, { status: 204 });
}
