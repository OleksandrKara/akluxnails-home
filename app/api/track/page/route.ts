import { cookies } from "next/headers";
import { getVariantById } from "@/lib/variant";
import { deriveClientContext } from "@/lib/requestContext";
import { recordPageView, type UtmParams } from "@/lib/tracking";

// Called by SitePageViewTracker on every client-side page view. The vid/variant cookies come from
// proxy.ts, so a request here always belongs to the same visitor as the booking requests later on.
// The visit row (the touch marketing.contacts reads its traffic source from) is written for the
// first page of a browser session and for a fresh ad click or tagged link; every other page only
// adds a page_view event. Best-effort, always 204.
const str = (v: unknown, max: number) => (typeof v === "string" && v ? v.slice(0, max) : undefined);

export async function POST(req: Request) {
  try {
    const jar = await cookies();
    const visitorId = jar.get("vid")?.value;
    const variantId = jar.get("variant")?.value;
    if (!visitorId || !variantId) return new Response(null, { status: 204 });
    const variant = await getVariantById(variantId);
    if (!variant) return new Response(null, { status: 204 });

    const body = await req.json().catch(() => ({}));
    const path = str(body?.path, 300);
    if (!path || !path.startsWith("/")) return new Response(null, { status: 204 });
    const p: Record<string, string> = {};
    if (body?.params && typeof body.params === "object") {
      for (const [k, v] of Object.entries(body.params)) {
        const s = str(v, 500);
        if (s) p[k] = s;
      }
    }
    const utm: UtmParams = {
      utmSource: p.utm_source, utmMedium: p.utm_medium, utmCampaign: p.utm_campaign,
      utmTerm: p.utm_term, utmContent: p.utm_content,
      fbclid: p.fbclid, gclid: p.gclid, gbraid: p.gbraid, wbraid: p.wbraid, msclkid: p.msclkid,
    };
    // Links with no UTM tags that still say where they came from: Reserve with Google adds
    // rwg_token, our own SMS promos add ?promo=CODE. Saved as UTM so they are their own sources.
    if (!utm.utmSource && !utm.gclid && !utm.gbraid && !utm.wbraid && !utm.fbclid && !utm.msclkid) {
      if (p.rwg_token) {
        utm.utmSource = "google";
        utm.utmMedium = "reserve_with_google";
      } else if (p.promo) {
        utm.utmSource = "sms";
        utm.utmMedium = "promo";
        utm.utmCampaign = p.promo;
      }
    }
    const query = new URLSearchParams(
      Object.entries(p).filter(([k]) => k !== "rwg_token"),
    ).toString();
    const wantVisit = body?.visit === true;
    const ctx = await deriveClientContext();
    await recordPageView({
      visitorId,
      landingPageId: variant.landingPageId,
      variantId: variant.variantId,
      path,
      query,
      visit: wantVisit
        ? {
            landingUrl: str(body?.landing_url, 700) ?? null,
            referrer: str(body?.referrer, 500) ?? null,
            visitReferrer: str(body?.visit_referrer, 500) ?? null,
            isFirstVisit: body?.is_first_visit === true,
            utm,
          }
        : undefined,
      clientContext: ctx,
    });
  } catch (err) {
    console.error("Failed to record tracked page", err);
  }
  return new Response(null, { status: 204 });
}
