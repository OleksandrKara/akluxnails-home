import { NextRequest, NextResponse } from "next/server";
import { storeCardOnFile } from "@/lib/square/cards";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sourceId, customerId, cardholderName } = body ?? {};
  if (!sourceId || !customerId) {
    return NextResponse.json({ error: "sourceId and customerId are required" }, { status: 400 });
  }

  try {
    const cardId = await storeCardOnFile({ sourceId, customerId, cardholderName });
    return NextResponse.json({ cardId });
  } catch (err) {
    console.error("Failed to store card on file", err);
    return NextResponse.json({ error: "Failed to save card" }, { status: 502 });
  }
}
