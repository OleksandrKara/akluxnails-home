import { getSquareClient } from "./client";

// Same lookup order as salonLandings' SquareCustomerGateway: exact phone match first, then exact
// email match, create only if neither is found. Keeps one customer profile per real person across
// both this homepage and mani's booking flow, since they share the same Square account.
function normalizePhoneE164(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

export interface FindOrCreateCustomerInput {
  givenName: string;
  familyName?: string;
  phoneNumber: string;
  emailAddress?: string;
  smsOptIn: boolean;
}

function consentLine(): string {
  return `SMS marketing opt-in via akluxnails.com booking on ${new Date().toISOString().slice(0, 10)}.`;
}

/** Appends an SMS opt-in record to an existing customer's note without touching whatever staff
 * may already have written there (allergies, preferences, etc.) — never overwrites. Only called
 * when the visitor actually opted in, and skipped if already recorded, to avoid note spam across
 * repeat bookings. */
async function recordSmsOptIn(customerId: string, existingNote: string | null | undefined) {
  const line = consentLine();
  if (existingNote?.includes("SMS marketing opt-in")) return;
  const client = getSquareClient();
  const note = existingNote ? `${existingNote}\n${line}` : line;
  await client.customers.update({ customerId, note });
}

export async function findOrCreateCustomer(input: FindOrCreateCustomerInput): Promise<string> {
  const client = getSquareClient();
  const phoneE164 = normalizePhoneE164(input.phoneNumber);

  const byPhone = await client.customers.search({
    query: { filter: { phoneNumber: { exact: phoneE164 } } },
  });
  const phoneMatch = byPhone.customers?.[0];
  if (phoneMatch?.id) {
    if (input.smsOptIn) await recordSmsOptIn(phoneMatch.id, phoneMatch.note);
    return phoneMatch.id;
  }

  if (input.emailAddress) {
    const byEmail = await client.customers.search({
      query: { filter: { emailAddress: { exact: input.emailAddress } } },
    });
    const emailMatch = byEmail.customers?.[0];
    if (emailMatch?.id) {
      if (input.smsOptIn) await recordSmsOptIn(emailMatch.id, emailMatch.note);
      return emailMatch.id;
    }
  }

  const created = await client.customers.create({
    givenName: input.givenName,
    familyName: input.familyName,
    phoneNumber: phoneE164,
    emailAddress: input.emailAddress,
    referenceId: "akluxnails-home",
    note: input.smsOptIn ? consentLine() : undefined,
  });
  if (!created.customer?.id) {
    throw new Error("Square did not return a customer id");
  }
  return created.customer.id;
}
