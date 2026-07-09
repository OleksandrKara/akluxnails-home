import { cookies } from "next/headers";
import { getVariantById } from "@/lib/variant";
import { recordFunnelEvent } from "@/lib/tracking";

// Called via navigator.sendBeacon from BookingModal's step effect — best-effort, never blocks
// the booking flow. Same cookie-resolution pattern as /api/track-click.
export async function POST(req: Request) {
  try {
    const jar = await cookies();
    const visitorId = jar.get("vid")?.value;
    const variantId = jar.get("variant")?.value;
    if (!visitorId || !variantId) return new Response(null, { status: 204 });

    const variant = await getVariantById(variantId);
    if (!variant) return new Response(null, { status: 204 });

    const body = await req.json().catch(() => ({}));
    const { flowKey, stepKey, stepIndex, stepCountTotal } = body ?? {};
    if (
      typeof flowKey !== "string" ||
      typeof stepKey !== "string" ||
      typeof stepIndex !== "number" ||
      typeof stepCountTotal !== "number"
    ) {
      return new Response(null, { status: 204 });
    }

    await recordFunnelEvent({
      visitorId,
      landingPageId: variant.landingPageId,
      variantId,
      flowKey,
      stepKey,
      stepIndex,
      stepCountTotal,
    });
  } catch (err) {
    console.error("Failed to record funnel event", err);
  }
  return new Response(null, { status: 204 });
}
