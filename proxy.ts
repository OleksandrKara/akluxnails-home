import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getVariantById, getVariantByKey, pickVariant } from "./lib/variant";

// Assigns visitor identity + A/B variant server-side, via cookies, before the page ever renders —
// avoids the localStorage-based fragility the mani funnel originally shipped with (client-side
// random pick + localStorage persistence, which Instagram/Facebook's in-app browser can reset
// mid-session, splitting one visitor's identity/variant in two). Doing this in Proxy means it's
// assigned exactly once per visitor and is immune to that class of bug from day one.
//
// Proxy defaults to the Node.js runtime as of Next.js 16, so a direct Postgres query here is fine
// (this would not have worked on the older Edge-runtime default, which has no raw TCP sockets).
//
// The resolved ids are forwarded to the page via request headers (not just response cookies) —
// on a visitor's very first request there's no guarantee a cookie set here is visible to
// `cookies()` in the same request's page render, but a request header set via
// NextResponse.next({ request: { headers } }) is the documented, reliable way to pass data from
// Proxy to the page for the SAME request.

const VISITOR_COOKIE = "vid";
const VARIANT_COOKIE = "variant";
const COOKIE_MAX_AGE = 400 * 24 * 3600; // ~400 days — matches browsers' own cap on cookie lifetime

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  let visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  let setVisitorCookie = false;
  if (!visitorId) {
    visitorId = randomUUID();
    setVisitorCookie = true;
  }
  requestHeaders.set("x-visitor-id", visitorId);

  const existingVariantId = request.cookies.get(VARIANT_COOKIE)?.value;
  let variantId: string | null = null;
  let landingPageId: string | null = null;
  let setVariantCookie = false;

  // A ?v=<key> deep link (e.g. ?v=homepage-v4) always wins and becomes sticky — the way the owner
  // (or a future ad campaign) can force a specific variant regardless of cookie/random assignment.
  const deepLinkKey = request.nextUrl.searchParams.get("v");
  if (deepLinkKey) {
    const resolved = await getVariantByKey(deepLinkKey);
    if (resolved) {
      variantId = resolved.variantId;
      landingPageId = resolved.landingPageId;
      setVariantCookie = true;
    }
  }

  if (!variantId && existingVariantId) {
    const stillValid = await getVariantById(existingVariantId);
    if (stillValid) {
      variantId = stillValid.variantId;
      landingPageId = stillValid.landingPageId;
    }
  }
  if (!variantId) {
    const resolved = await pickVariant();
    if (resolved) {
      variantId = resolved.variantId;
      landingPageId = resolved.landingPageId;
      setVariantCookie = true;
    }
  }
  if (variantId) requestHeaders.set("x-variant-id", variantId);
  if (landingPageId) requestHeaders.set("x-landing-page-id", landingPageId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (setVisitorCookie) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  }
  if (setVariantCookie && variantId) {
    response.cookies.set(VARIANT_COOKIE, variantId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
