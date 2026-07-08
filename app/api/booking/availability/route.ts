import { NextRequest, NextResponse } from "next/server";
import { searchAvailability } from "@/lib/square/availability";

export async function GET(request: NextRequest) {
  const variationId = request.nextUrl.searchParams.get("variationId");
  if (!variationId) {
    return NextResponse.json({ error: "variationId is required" }, { status: 400 });
  }

  try {
    const slots = await searchAvailability(variationId);
    return NextResponse.json({
      slots: slots.map((s) => ({
        startAt: s.startAt,
        teamMemberId: s.teamMemberId,
        serviceVariationId: s.serviceVariationId,
        serviceVariationVersion: s.serviceVariationVersion.toString(),
        durationMinutes: s.durationMinutes,
      })),
    });
  } catch (err) {
    console.error("Failed to search availability", err);
    return NextResponse.json({ error: "Failed to load availability" }, { status: 502 });
  }
}
