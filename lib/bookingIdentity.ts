import type { NextRequest } from "next/server";
import { getVariantById } from "./variant";

// proxy.ts's matcher deliberately excludes /api/* (it only resolves identity for page renders),
// so booking API routes read the same vid/variant cookies straight off the request instead of
// relying on proxy-injected headers — the cookies are already set from the visitor's page load.
export interface BookingIdentity {
  visitorId: string | null;
  landingPageId: string | null;
  variantId: string | null;
}

export async function resolveBookingIdentity(request: NextRequest): Promise<BookingIdentity> {
  const visitorId = request.cookies.get("vid")?.value ?? null;
  const variantId = request.cookies.get("variant")?.value ?? null;

  if (!variantId) return { visitorId, landingPageId: null, variantId: null };

  const variant = await getVariantById(variantId);
  if (!variant) return { visitorId, landingPageId: null, variantId: null };

  return { visitorId, landingPageId: variant.landingPageId, variantId: variant.variantId };
}
