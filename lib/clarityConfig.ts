import "server-only";

const INTERNAL_BASE_URL = process.env.SALARYREVIEW_INTERNAL_BASE_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

/** Microsoft Clarity project id for this site, resolved from salaryReview-dev's per-hostname
 * tracking_config at render time — so turning tracking on/off, or changing the id, never needs a
 * redeploy here. `null` on any missing config, outage, or unconfigured hostname: RootLayout must
 * render either way, it just skips the Clarity script when this is null. Revalidated every 5
 * minutes rather than fetched fresh on every request — a tracking id changes rarely, and this is
 * on RootLayout's render path for every single page. */
export async function getClarityProjectId(hostname: string): Promise<string | null> {
  if (!INTERNAL_BASE_URL || !INTERNAL_API_KEY) return null;
  try {
    const res = await fetch(
      `${INTERNAL_BASE_URL}/api/internal/tracking-config?domain=${encodeURIComponent(hostname)}`,
      {
        headers: { "X-Internal-Api-Key": INTERNAL_API_KEY },
        signal: AbortSignal.timeout(3000),
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { clarityProjectId: string | null };
    return data.clarityProjectId ?? null;
  } catch {
    return null;
  }
}
