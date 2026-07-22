import { NextRequest, NextResponse } from "next/server";
import { searchAvailability } from "@/lib/square/availability";

export async function GET(request: NextRequest) {
  const variationIdsParam = request.nextUrl.searchParams.get("variationIds");
  const variationIds = variationIdsParam?.split(",").filter(Boolean) ?? [];
  if (variationIds.length === 0) {
    return NextResponse.json({ error: "variationIds is required" }, { status: 400 });
  }
  const teamMemberId = request.nextUrl.searchParams.get("teamMemberId") ?? undefined;

  try {
    const slots = await searchAvailability(variationIds, undefined, teamMemberId);
    return NextResponse.json({
      slots: slots.map((s) => ({
        startAt: s.startAt,
        segments: s.segments.map((seg) => ({
          teamMemberId: seg.teamMemberId,
          serviceVariationId: seg.serviceVariationId,
          serviceVariationVersion: seg.serviceVariationVersion.toString(),
          durationMinutes: seg.durationMinutes,
        })),
      })),
    });
  } catch (err) {
    console.error("Failed to search availability", err);
    return NextResponse.json({ error: "Failed to load availability" }, { status: 502 });
  }
}
