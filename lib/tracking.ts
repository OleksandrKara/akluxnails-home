import { getPool } from "./db";
import { deriveClientContext } from "./requestContext";

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  fbclid?: string;
  gclid?: string;
}

/** Records one page view: a marketing.visits row (this visitor's touch, with UTM/referrer/device
 * context) plus a marketing.events row (page_view, tied to the resolved landing page + variant).
 * Never throws — analytics must never break the page render, matching the same guarantee
 * salonLandings' tracking_service.py makes for the mani funnel.
 */
export async function recordPageView(params: {
  visitorId: string;
  landingPageId: string;
  variantId: string;
  landingPath: string;
  referrer: string | null;
  utm: UtmParams;
}): Promise<void> {
  try {
    const ctx = await deriveClientContext();
    const pool = getPool();
    await pool.query(
      `INSERT INTO marketing.visits
         (visitor_id, landing_path, referrer, utm_source, utm_medium, utm_campaign, utm_term,
          utm_content, fbclid, gclid, user_agent, device_type, os_name, os_version, browser_name,
          browser_version, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        params.visitorId, params.landingPath, params.referrer,
        params.utm.utmSource ?? null, params.utm.utmMedium ?? null, params.utm.utmCampaign ?? null,
        params.utm.utmTerm ?? null, params.utm.utmContent ?? null,
        params.utm.fbclid ?? null, params.utm.gclid ?? null,
        ctx.userAgent, ctx.deviceType, ctx.osName, ctx.osVersion, ctx.browserName, ctx.browserVersion,
        ctx.ipAddress,
      ],
    );
    await pool.query(
      `INSERT INTO marketing.events (session_id, landing_page_id, variant_id, event_type, metadata)
       VALUES ($1,$2,$3,'page_view','{}'::jsonb)`,
      [params.visitorId, params.landingPageId, params.variantId],
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
    await getPool().query(
      `INSERT INTO marketing.events (session_id, landing_page_id, variant_id, event_type, metadata)
       VALUES ($1,$2,$3,$4,$5)`,
      [params.visitorId, params.landingPageId, params.variantId, params.eventType, JSON.stringify(params.metadata ?? {})],
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
    await getPool().query(
      `INSERT INTO marketing.funnel_events
         (session_id, landing_page_id, variant_id, flow_key, step_key, step_index, step_count_total, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        params.visitorId,
        params.landingPageId,
        params.variantId,
        params.flowKey,
        params.stepKey,
        params.stepIndex,
        params.stepCountTotal,
        JSON.stringify(params.metadata ?? {}),
      ],
    );
  } catch (err) {
    console.error("Failed to record funnel event", err);
  }
}
