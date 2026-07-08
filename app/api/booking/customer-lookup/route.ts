import { NextRequest, NextResponse } from "next/server";
import { lookupExistingCustomer } from "@/lib/square/customers";

/** Read-only — used while the visitor is still typing their contact info to recognize a
 * returning customer early, so the form can skip re-asking for SMS consent or a new card. Never
 * creates anything; findOrCreateCustomer (on submit) is still the source of truth. */
export async function POST(request: NextRequest) {
  const { phoneNumber, emailAddress } = (await request.json()) ?? {};
  if (!phoneNumber && !emailAddress) {
    return NextResponse.json({ found: false });
  }

  try {
    const existing = await lookupExistingCustomer(phoneNumber, emailAddress);
    if (!existing) return NextResponse.json({ found: false });
    return NextResponse.json({ found: true, ...existing });
  } catch (err) {
    console.error("Customer lookup failed", err);
    return NextResponse.json({ found: false });
  }
}
