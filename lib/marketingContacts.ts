import { getPool } from "./db";
import { deriveClientContext, isTrackingNoise } from "./requestContext";
import { normalizePhoneE164 } from "./square/customers";

// marketing.contacts/marketing.submissions are the same tables salonLandings (mani) has always
// written to for its own funnel — this app only ever wrote to visits/events/funnel_events, so
// every homepage lead (not just 4-hand requests) was invisible on the owner Contacts page. This
// file mirrors salonLandings' backend/app/services/tracking_service.py + traffic_source.py
// (record_step1_contact / link_contact_to_booking / classify_traffic_source) so both apps feed
// the same shared table the same way.

interface Attribution {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  referrer: string | null;
  fbclid: string | null;
  gclid: string | null;
}

/** Mirrors salonLandings' classify_traffic_source exactly — a paid-click id always wins the
 * "is this a paid ad?" call over UTM alone (see that function's docstring for why), with the UTM
 * breakdown folded in as detail rather than replacing the label. */
function classifyTrafficSource(a: Attribution | null): string {
  if (!a) return "Direct / Unknown";

  let utmDetail: string | null = null;
  if (a.utmSource) {
    const parts = [a.utmSource];
    if (a.utmMedium) parts.push(a.utmMedium);
    if (a.utmCampaign) parts.push(a.utmCampaign);
    utmDetail = parts.join(" / ");
  }

  if (a.fbclid) return utmDetail ? `Meta Ads (${utmDetail})` : "Meta Ads (click)";
  if (a.gclid) return utmDetail ? `Google Ads (${utmDetail})` : "Google Ads (click)";
  if (utmDetail) return utmDetail;

  const referrer = (a.referrer ?? "").toLowerCase();
  if (!referrer) return "Direct / No referrer";
  if (referrer.includes("google.")) return "Google (organic)";
  if (referrer.includes("instagram.com")) return "Instagram (organic)";
  if (referrer.includes("facebook.com") || referrer.includes("fb.com")) return "Facebook (organic)";
  if (referrer.includes("bing.")) return "Bing (organic)";
  if (referrer.includes("yahoo.")) return "Yahoo (organic)";

  try {
    const domain = new URL(a.referrer!).hostname;
    return domain ? `Referral: ${domain}` : "Direct / Unknown";
  } catch {
    return "Direct / Unknown";
  }
}

interface VisitAttribution extends Attribution {
  landingPath: string | null;
}

/** This app never persists a tracking snapshot client-side the way salonLandings' frontend does
 * (see that repo's services/identity.py) — instead the original UTM/referrer captured at page-load
 * time (see app/page.tsx's recordPageView call) already lives in marketing.visits keyed by
 * visitor_id, so it's looked up here rather than plumbed through the whole booking flow. Earliest
 * row = first-touch (original_traffic_source); latest row = most recent touch
 * (marketing_traffic_source) — same first-vs-latest split salonLandings' contacts table makes,
 * just derived from stored visits instead of a second client-sent value.
 */
async function fetchAttribution(
  visitorId: string | null,
): Promise<{ first: VisitAttribution | null; latest: VisitAttribution | null }> {
  if (!visitorId) return { first: null, latest: null };
  const { rows } = await getPool().query<{
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    referrer: string | null;
    fbclid: string | null;
    gclid: string | null;
    landing_path: string | null;
  }>(
    `SELECT utm_source, utm_medium, utm_campaign, referrer, fbclid, gclid, landing_path
       FROM marketing.visits WHERE visitor_id = $1 ORDER BY created_at ASC`,
    [visitorId],
  );
  if (rows.length === 0) return { first: null, latest: null };
  const toAttr = (r: (typeof rows)[number]): VisitAttribution => ({
    utmSource: r.utm_source,
    utmMedium: r.utm_medium,
    utmCampaign: r.utm_campaign,
    referrer: r.referrer,
    fbclid: r.fbclid,
    gclid: r.gclid,
    landingPath: r.landing_path,
  });
  return { first: toAttr(rows[0]), latest: toAttr(rows[rows.length - 1]) };
}

/** Denormalizes the opaque landing_page_id/variant_id (from the vid/variant cookies) into
 * human-readable slug/name at write time — mirrors salonLandings' resolve_landing_context, same
 * reasoning: a later variant rename/delete must never change what a historical contact's record
 * says it saw. */
async function resolveLandingContext(
  landingPageId: string | null,
  variantId: string | null,
): Promise<{ slug: string | null; variantName: string | null }> {
  const pool = getPool();
  let slug: string | null = null;
  let variantName: string | null = null;
  if (landingPageId) {
    const { rows } = await pool.query<{ slug: string }>(
      "SELECT slug FROM marketing.landing_pages WHERE id = $1",
      [landingPageId],
    );
    slug = rows[0]?.slug ?? null;
  }
  if (variantId) {
    const { rows } = await pool.query<{ name: string }>(
      "SELECT name FROM marketing.landing_variants WHERE id = $1",
      [variantId],
    );
    variantName = rows[0]?.name ?? null;
  }
  return { slug, variantName };
}

interface IdentityParams {
  visitorId: string | null;
  landingPageId: string | null;
  variantId: string | null;
}

/** First-touch capture as soon as Step 1 (name + phone) is submitted — see
 * app/api/booking/customer/route.ts. square_customer_id here is a lookup findOrCreateCustomer
 * already performed, matching salonLandings' "never create a Square customer just for this"
 * contract. Never throws — a failure here must never break contact capture itself. */
export async function recordStep1Contact(
  params: IdentityParams & {
    givenName: string;
    phoneNumber: string;
    emailAddress: string | null;
    squareCustomerId: string;
  },
): Promise<void> {
  try {
    const ctx = await deriveClientContext();
    if (isTrackingNoise(ctx)) return;

    const phoneNumber = normalizePhoneE164(params.phoneNumber);
    const { first, latest } = await fetchAttribution(params.visitorId);
    const { slug, variantName } = await resolveLandingContext(params.landingPageId, params.variantId);
    const current = latest ?? first;
    const originalTrafficSource = classifyTrafficSource(first);
    const marketingTrafficSource = classifyTrafficSource(current);

    const pool = getPool();
    await pool.query(
      `INSERT INTO marketing.contacts (
         phone_number, given_name, email_address,
         original_traffic_source, marketing_traffic_source,
         utm_source, utm_medium, utm_campaign, referrer,
         landing_page_slug, variant_name,
         device_type, os_name, os_version, browser_name, browser_version,
         square_customer_id, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, now())
       ON CONFLICT (phone_number) DO UPDATE SET
         given_name = EXCLUDED.given_name,
         email_address = COALESCE(EXCLUDED.email_address, marketing.contacts.email_address),
         marketing_traffic_source = EXCLUDED.marketing_traffic_source,
         utm_source = EXCLUDED.utm_source,
         utm_medium = EXCLUDED.utm_medium,
         utm_campaign = EXCLUDED.utm_campaign,
         referrer = EXCLUDED.referrer,
         device_type = EXCLUDED.device_type,
         os_name = EXCLUDED.os_name,
         os_version = EXCLUDED.os_version,
         browser_name = EXCLUDED.browser_name,
         browser_version = EXCLUDED.browser_version,
         square_customer_id = COALESCE(EXCLUDED.square_customer_id, marketing.contacts.square_customer_id),
         updated_at = now()`,
      [
        phoneNumber,
        params.givenName,
        params.emailAddress,
        originalTrafficSource,
        marketingTrafficSource,
        current?.utmSource ?? null,
        current?.utmMedium ?? null,
        current?.utmCampaign ?? null,
        current?.referrer ?? null,
        slug,
        variantName,
        ctx.deviceType,
        ctx.osName,
        ctx.osVersion,
        ctx.browserName,
        ctx.browserVersion,
        params.squareCustomerId,
      ],
    );

    await pool.query(
      `INSERT INTO marketing.submissions (
         visitor_id, submission_type, customer_email, customer_phone,
         landing_path, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
         fbclid, gclid, user_agent, device_type, os_name, os_version, browser_name, browser_version,
         ip_address, landing_page_slug, variant_name, traffic_source
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NULL,NULL,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [
        params.visitorId,
        "step1",
        params.emailAddress,
        phoneNumber,
        current?.landingPath ?? null,
        current?.referrer ?? null,
        current?.utmSource ?? null,
        current?.utmMedium ?? null,
        current?.utmCampaign ?? null,
        current?.fbclid ?? null,
        current?.gclid ?? null,
        ctx.userAgent,
        ctx.deviceType,
        ctx.osName,
        ctx.osVersion,
        ctx.browserName,
        ctx.browserVersion,
        ctx.ipAddress,
        slug,
        variantName,
        marketingTrafficSource,
      ],
    );
  } catch (err) {
    console.error("Failed to record Step 1 contact", err);
  }
}

/** Links the Step-1-captured contact to the real booking/request that resulted from it — see
 * app/api/booking/create/route.ts, called for both a real Square booking and a 4-hand request
 * (which never creates one — see lib/square/bookings.ts). Falls back to inserting a fresh contact
 * if Step 1's own capture never landed, same as salonLandings' link_contact_to_booking. Never
 * throws — marketing attribution must never break a real booking. */
export async function linkContactToBooking(
  params: IdentityParams & {
    givenName: string;
    phoneNumber: string;
    emailAddress: string | null;
    smsConsent: boolean;
    squareCustomerId: string;
    squareBookingId: string;
    bookingStatus: string;
    bookingStartAt: string | null;
    bookingServiceName: string;
    bookingPriceCents: number | null;
    bookingArtistName: string | null;
    submissionType: "booking" | "four_hand_request";
  },
): Promise<void> {
  try {
    const ctx = await deriveClientContext();
    if (isTrackingNoise(ctx)) return;

    const phoneNumber = normalizePhoneE164(params.phoneNumber);
    const { first, latest } = await fetchAttribution(params.visitorId);
    const { slug, variantName } = await resolveLandingContext(params.landingPageId, params.variantId);
    const current = latest ?? first;
    const trafficSource = classifyTrafficSource(current);
    const bookingPrice = params.bookingPriceCents == null ? null : params.bookingPriceCents / 100;
    const emailConsent = params.emailAddress != null;

    const pool = getPool();
    await pool.query(
      `INSERT INTO marketing.contacts (
         phone_number, given_name, email_address,
         original_traffic_source, marketing_traffic_source,
         utm_source, utm_medium, utm_campaign, referrer,
         landing_page_slug, variant_name,
         device_type, os_name, os_version, browser_name, browser_version,
         sms_marketing_consent, email_marketing_consent,
         square_customer_id, square_booking_id, booking_status, booking_start_at,
         booking_service_name, booking_price, booking_artist_name, updated_at
       ) VALUES (
         $1,$2,$3,$4,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
         $16,$17,$18,$19,$20,$21,$22,$23,$24, now()
       )
       ON CONFLICT (phone_number) DO UPDATE SET
         given_name = EXCLUDED.given_name,
         email_address = COALESCE(EXCLUDED.email_address, marketing.contacts.email_address),
         marketing_traffic_source = EXCLUDED.marketing_traffic_source,
         utm_source = EXCLUDED.utm_source,
         utm_medium = EXCLUDED.utm_medium,
         utm_campaign = EXCLUDED.utm_campaign,
         referrer = EXCLUDED.referrer,
         device_type = EXCLUDED.device_type,
         os_name = EXCLUDED.os_name,
         os_version = EXCLUDED.os_version,
         browser_name = EXCLUDED.browser_name,
         browser_version = EXCLUDED.browser_version,
         sms_marketing_consent = EXCLUDED.sms_marketing_consent,
         email_marketing_consent = EXCLUDED.email_marketing_consent,
         square_customer_id = EXCLUDED.square_customer_id,
         square_booking_id = EXCLUDED.square_booking_id,
         booking_status = EXCLUDED.booking_status,
         booking_start_at = EXCLUDED.booking_start_at,
         booking_service_name = EXCLUDED.booking_service_name,
         booking_price = EXCLUDED.booking_price,
         booking_artist_name = EXCLUDED.booking_artist_name,
         updated_at = now()`,
      [
        phoneNumber,
        params.givenName,
        params.emailAddress,
        trafficSource,
        current?.utmSource ?? null,
        current?.utmMedium ?? null,
        current?.utmCampaign ?? null,
        current?.referrer ?? null,
        slug,
        variantName,
        ctx.deviceType,
        ctx.osName,
        ctx.osVersion,
        ctx.browserName,
        ctx.browserVersion,
        params.smsConsent,
        emailConsent,
        params.squareCustomerId,
        params.squareBookingId,
        params.bookingStatus,
        params.bookingStartAt,
        params.bookingServiceName,
        bookingPrice,
        params.bookingArtistName,
      ],
    );

    await pool.query(
      `INSERT INTO marketing.submissions (
         visitor_id, submission_type, square_booking_id, service_name, price,
         customer_email, customer_phone, landing_path, referrer,
         utm_source, utm_medium, utm_campaign, utm_term, utm_content, fbclid, gclid,
         user_agent, device_type, os_name, os_version, browser_name, browser_version, ip_address,
         landing_page_slug, variant_name, traffic_source
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NULL,NULL,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
      [
        params.visitorId,
        params.submissionType,
        params.squareBookingId,
        params.bookingServiceName,
        bookingPrice,
        params.emailAddress,
        phoneNumber,
        current?.landingPath ?? null,
        current?.referrer ?? null,
        current?.utmSource ?? null,
        current?.utmMedium ?? null,
        current?.utmCampaign ?? null,
        current?.fbclid ?? null,
        current?.gclid ?? null,
        ctx.userAgent,
        ctx.deviceType,
        ctx.osName,
        ctx.osVersion,
        ctx.browserName,
        ctx.browserVersion,
        ctx.ipAddress,
        slug,
        variantName,
        trafficSource,
      ],
    );
  } catch (err) {
    console.error("Failed to link contact to booking", err);
  }
}
