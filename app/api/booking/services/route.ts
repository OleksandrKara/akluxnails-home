import { NextResponse } from "next/server";
import { getCuratedMenu } from "@/lib/square/catalog";
import { toWireItem } from "@/lib/square/wire";

export async function GET() {
  try {
    const menu = await getCuratedMenu();
    return NextResponse.json({
      groups: menu.groups.map((g) => ({
        title: g.title,
        services: g.services.map(toWireItem),
        addOnGroups: g.addOnGroups.map((addOnGroup) => ({
          label: addOnGroup.label,
          options: addOnGroup.options.map(toWireItem),
        })),
      })),
    });
  } catch (err) {
    console.error("Failed to load curated service menu", err);
    return NextResponse.json({ error: "Failed to load services" }, { status: 502 });
  }
}
