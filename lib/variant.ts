import { getPool } from "./db";

/** Per-variant content overrides, stored in marketing.landing_variants.content (jsonb). Mirrors
 * the same idea salonLandings uses for the mani funnel (LandingVariantContent), scoped to what a
 * general homepage needs rather than a booking-funnel page.
 */
export interface HomeVariantContent {
  heroHeadline?: string;
  heroSubheadline?: string;
  ctaText?: string;
  /** Single brand hex color — the rest of the palette (dark/hover/tints) is derived, see theme.ts. */
  accentColor?: string;
}

export interface ResolvedVariant {
  landingPageId: string;
  variantId: string;
  content: HomeVariantContent;
}

interface VariantRow {
  id: string;
  landing_page_id: string;
  weight: number;
  content: HomeVariantContent;
}

let cachedLandingPageId: string | null = null;

async function landingPageId(): Promise<string | null> {
  if (cachedLandingPageId) return cachedLandingPageId;
  const slug = process.env.LANDING_PAGE_SLUG ?? "home";
  const { rows } = await getPool().query<{ id: string }>(
    "SELECT id FROM marketing.landing_pages WHERE slug = $1",
    [slug],
  );
  if (rows.length === 0) return null;
  cachedLandingPageId = rows[0].id;
  return cachedLandingPageId;
}

/** Weighted-random pick among this landing page's active variants. Null if the landing_pages row
 * or any active variant doesn't exist yet (falls back to default copy — see page.tsx).
 */
export async function pickVariant(): Promise<ResolvedVariant | null> {
  const pageId = await landingPageId();
  if (!pageId) return null;

  const { rows } = await getPool().query<VariantRow>(
    "SELECT id, landing_page_id, weight, content FROM marketing.landing_variants WHERE landing_page_id = $1 AND active = true",
    [pageId],
  );
  if (rows.length === 0) return null;

  const totalWeight = rows.reduce((sum, r) => sum + r.weight, 0);
  if (totalWeight <= 0) return null;
  let roll = Math.random() * totalWeight;
  for (const row of rows) {
    roll -= row.weight;
    if (roll <= 0) {
      return { landingPageId: row.landing_page_id, variantId: row.id, content: row.content ?? {} };
    }
  }
  // Floating-point edge case — fall back to the last row rather than returning nothing.
  const last = rows[rows.length - 1];
  return { landingPageId: last.landing_page_id, variantId: last.id, content: last.content ?? {} };
}

/** Re-fetches a specific already-assigned variant by id (used when a visitor's cookie already
 * names one) — content only, no re-roll, so a returning visitor keeps seeing the same variant.
 */
export async function getVariantById(variantId: string): Promise<ResolvedVariant | null> {
  const { rows } = await getPool().query<VariantRow>(
    "SELECT id, landing_page_id, weight, content FROM marketing.landing_variants WHERE id = $1 AND active = true",
    [variantId],
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  return { landingPageId: row.landing_page_id, variantId: row.id, content: row.content ?? {} };
}
