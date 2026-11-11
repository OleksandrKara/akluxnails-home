import { getPool, MARKETING_BUSINESS_ID } from "./db";
import { deriveClientContext, isTrackingNoise, type ClientContext } from "./requestContext";

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  fbclid?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  msclkid?: string;
}

/** Records one page view: a marketing.events page_view row (tied to the resolved landing page +
 * variant, metadata = path and tracked query) and, when `visit` is set (first page of a browser
 * session or a fresh ad click), a marketing.visits row with this visitor's touch (UTM, click ids,
 * referrer, device context). Never throws: analytics must never break the page.
 */
export async function recordPageView(params: {
  visitorId: string;
  landingPageId: string;
  variantId: string;
  path: string;
  query: string;
  visit?: {
    landingUrl: string | null;
    referrer: string | null;
    visitReferrer: string | null;
    isFirstVisit: boolean;
    utm: UtmParams;
  };
  clientContext?: ClientContext;
}): Promise<void> {
  try {
    const ctx = params.clientContext ?? (await deriveClientContext());
    if (await isTrackingNoise(ctx)) return;
    const pool = getPool();
    const v = params.visit;
    if (v) {
      await pool.query(
        `INSERT INTO marketing.visits
           (visitor_id, landing_path, referrer, utm_source, utm_medium, utm_campaign, utm_term,
            utm_content, fbclid, gclid, gbraid, wbraid, msclkid, landing_url, visit_referrer,
            is_first_visit, user_agent, device_type, os_name, os_version, browser_name,
            browser_version, ip_address, business_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
        [
          params.visitorId, params.path, v.referrer,
          v.utm.utmSource ?? null, v.utm.utmMedium ?? null, v.utm.utmCampaign ?? null,
          v.utm.utmTerm ?? null, v.utm.utmContent ?? null,
          v.utm.fbclid ?? null, v.utm.gclid ?? null,
          v.utm.gbraid ?? null, v.utm.wbraid ?? null, v.utm.msclkid ?? null,
          v.landingUrl, v.visitReferrer, v.isFirstVisit,
          ctx.userAgent, ctx.deviceType, ctx.osName, ctx.osVersion, ctx.browserName, ctx.browserVersion,
          ctx.ipAddress, MARKETING_BUSINESS_ID,
        ],
      );
    }
    await pool.query(
      `INSERT INTO marketing.events (session_id, landing_page_id, variant_id, event_type, metadata, business_id)
       VALUES ($1,$2,$3,'page_view',$4::jsonb,$5)`,
      [
        params.visitorId, params.landingPageId, params.variantId,
        JSON.stringify({ path: params.path, query: params.query }), MARKETING_BUSINESS_ID,
      ],
    );
  } catch (err) {
    console.error("Failed to record page view", err);
  }
}

/** Records a lightweight interaction event (e.g. the "Book Now" click-out) — same
 * never-throws guarantee as recordPageView.
 */
export async function recordEvent(params: {
  visitorId: string;
  landingPageId: string;
  variantId: string;
  eventType: "click" | "page_view" | "booking_started" | "booking_completed";
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    if (await isTrackingNoise(await deriveClientContext())) return;
    await getPool().query(
      `INSERT INTO marketing.events (session_id, landing_page_id, variant_id, event_type, metadata, business_id)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [params.visitorId, params.landingPageId, params.variantId, params.eventType, JSON.stringify(params.metadata ?? {}), MARKETING_BUSINESS_ID],
    );
  } catch (err) {
    console.error("Failed to record event", err);
  }
}

/** Records one booking-funnel step-reached event — see marketing.funnel_events, a table shared
 * with mani (also written by its own backend) and read by salaryReview's funnel dashboard. Same
 * never-throws guarantee as recordEvent/recordPageView.
 */
export async function recordFunnelEvent(params: {
  visitorId: string;
  landingPageId: string;
  variantId: string;
  flowKey: string;
  stepKey: string;
  stepIndex: number;
  stepCountTotal: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    if (await isTrackingNoise(await deriveClientContext())) return;
    await getPool().query(
      `INSERT INTO marketing.funnel_events
         (session_id, landing_page_id, variant_id, flow_key, step_key, step_index, step_count_total, metadata, business_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        params.visitorId,
        params.landingPageId,
        params.variantId,
        params.flowKey,
        params.stepKey,
        params.stepIndex,
        params.stepCountTotal,
        JSON.stringify(params.metadata ?? {}),
        MARKETING_BUSINESS_ID,
      ],
    );
  } catch (err) {
    console.error("Failed to record funnel event", err);
  }
}
