import { NextRequest, NextResponse } from "next/server";
import { getSquareClient } from "@/lib/square/client";
import { findOrCreateCustomer } from "@/lib/square/customers";

const REQUEST_LABELS: Record<string, string> = {
  gift_card: "Gift card request",
  prepay: "Prepay package request",
  referral: "Referral request",
};

/**
 * Lead capture for Homepage V4's Gift Card / Prepay / Referral CTAs. None of these are real
 * purchases yet (no payment/order/activation) — this just records the ask as a note on the
 * matching Square customer so staff can follow up and process it manually, same as no-show fees
 * are handled today. Deliberately simpler than the old 4-hands-request route (no booking/slot
 * needed here, just a contact + a note).
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { requestType, givenName, phoneNumber, emailAddress, detail } = body ?? {};

  if (!givenName || !phoneNumber) {
    return NextResponse.json({ error: "givenName and phoneNumber are required" }, { status: 400 });
  }
  const label = REQUEST_LABELS[requestType];
  if (!label) {
    return NextResponse.json({ error: "Unrecognized requestType" }, { status: 400 });
  }

  try {
    const customerId = await findOrCreateCustomer({
      givenName,
      phoneNumber,
      emailAddress: emailAddress || undefined,
      smsOptIn: false,
    });

    const line = `${label} via Homepage V4${detail ? `: ${detail}` : ""} (${new Date().toISOString().slice(0, 10)}).`;
    const client = getSquareClient();
    const customer = await client.customers.get({ customerId });
    const existingNote = customer.customer?.note ?? "";
    const note = existingNote ? `${existingNote}\n${line}` : line;
    await client.customers.update({ customerId, note });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("v4-request failed", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 502 });
  }
}
