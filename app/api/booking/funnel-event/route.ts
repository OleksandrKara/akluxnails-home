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
      metadata: availabilitySignal(body?.signal),
    });
  } catch (err) {
    console.error("Failed to record funnel event", err);
  }
  return new Response(null, { status: 204 });
}

/** Whitelists trackAvailabilitySignal's fields (numbers/booleans/one enum only), so nothing else a
 * client sends ends up in the table. */
function availabilitySignal(raw: unknown): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 100000 ? Math.round(v) : null);
  if (!["ok", "empty", "failed"].includes(r.outcome as string)) return undefined;
  return {
    availability: r.outcome,
    slots_next_3_days: num(r.slotsNext3Days),
    days_to_first_slot: num(r.daysToFirstSlot),
    total_slots: num(r.totalSlots),
    technician_chosen: r.technicianChosen === true,
    service_count: num(r.serviceCount),
  };
}
