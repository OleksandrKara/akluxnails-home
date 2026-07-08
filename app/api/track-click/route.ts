import { cookies } from "next/headers";
import { getVariantById } from "@/lib/variant";
import { recordEvent } from "@/lib/tracking";

// Called via navigator.sendBeacon from BookNowButton — best-effort, never blocks the click-out.
// Unlike Proxy (which forwards ids via request headers for the initial page render), this is a
// separate, later request: the vid/variant cookies set on that first response are just normal
// cookies by now, so reading them here is reliable.
export async function POST(req: Request) {
  try {
    const jar = await cookies();
    const visitorId = jar.get("vid")?.value;
    const variantId = jar.get("variant")?.value;
    if (!visitorId || !variantId) return new Response(null, { status: 204 });

    const variant = await getVariantById(variantId);
    if (!variant) return new Response(null, { status: 204 });

    const body = await req.json().catch(() => ({}));
    await recordEvent({
      visitorId,
      landingPageId: variant.landingPageId,
      variantId,
      eventType: "click",
      metadata: { target: body?.target ?? "unknown" },
    });
  } catch (err) {
    console.error("Failed to record click event", err);
  }
  return new Response(null, { status: 204 });
}
