import { NextResponse } from "next/server";
import { getCuratedMenu, type CatalogServiceItem } from "@/lib/square/catalog";

// bigint (variation version) isn't JSON-serializable — send it as a string, parsed back to
// bigint server-side (see app/api/booking/create/route.ts) when the booking is actually created.
function toWireItem(item: CatalogServiceItem) {
  return {
    itemId: item.itemId,
    name: item.name,
    variations: item.variations.map((v) => ({
      variationId: v.variationId,
      variationVersion: v.variationVersion.toString(),
      name: v.name,
      priceCents: v.priceCents,
    })),
  };
}

export async function GET() {
  try {
    const menu = await getCuratedMenu();
    return NextResponse.json({
      groups: menu.groups.map((g) => ({ title: g.title, services: g.services.map(toWireItem) })),
      addOns: menu.addOns.map(toWireItem),
    });
  } catch (err) {
    console.error("Failed to load curated service menu", err);
    return NextResponse.json({ error: "Failed to load services" }, { status: 502 });
  }
}
