import { NextRequest, NextResponse } from "next/server";
import { SquareError } from "square";
import { getSquareClient } from "@/lib/square/client";
import { findOrCreateCustomer, normalizePhoneE164 } from "@/lib/square/customers";
import { storeCardOnFileDetailed, type SavedCardInfo } from "@/lib/square/cards";
import { FRIENDLY_MESSAGES, friendlyCardErrorMessage } from "@/lib/square/cardErrors";
import { notifyCardOnFile } from "@/lib/telegram";
import { CARD_AUTHORIZATION_VERSION } from "@/lib/siteData";
import { failuresForPhone, ipOverLimit, isPaused, phoneOverLimit, recordFailure } from "@/lib/cardOnFileGuard";

/**
 * Standalone card-on-file page (akluxnails.com/card, owner request 2026-10-01): a client who
 * booked by phone/Instagram adds a card for the cancellation policy without going through the
 * booking flow.
 *
 * Card data never reaches this server: Square's Web Payments SDK turns it into a one-time token
 * in the browser (Square's own iframe), and only that token comes here. Square checks the card
 * with the bank when it's saved, so a random or invalid number is refused there and never saved.
 *
 * Every outcome goes to staff Telegram: saved (flagged if prepaid, expiring soon, or the name
 * doesn't match the client's Square profile), refused (with the reason), or the page pausing
 * itself after a burst of refusals (see lib/cardOnFileGuard.ts).
 */

const PAUSED_MESSAGE =
  "Adding a card online is temporarily unavailable. Please text us at 619-323-1185 and we'll help.";

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

function pacificNow(): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date());
}

function expiry(card: SavedCardInfo): string | undefined {
  if (!card.expMonth || !card.expYear) return undefined;
  return `${String(card.expMonth).padStart(2, "0")}/${card.expYear}`;
}

/** Last moment the card is still valid: end of its expiry month. */
function expiresWithinDays(card: SavedCardInfo, days: number): boolean {
  if (!card.expMonth || !card.expYear) return false;
  const endOfExpiryMonth = Date.UTC(card.expYear, card.expMonth, 1);
  return endOfExpiryMonth - Date.now() < days * 24 * 60 * 60 * 1000;
}

function sameName(a: string | null | undefined, b: string | null | undefined): boolean {
  const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();
  return norm(a) === norm(b);
}

export async function POST(request: NextRequest) {
  if (isPaused()) {
    return NextResponse.json({ error: PAUSED_MESSAGE }, { status: 503 });
  }
  if (ipOverLimit(clientIp(request))) {
    return NextResponse.json(
      { error: "Too many tries. Please wait a while, or text us at 619-323-1185 and we'll help." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const givenName = String(body?.givenName ?? "").trim().slice(0, 60);
  const familyName = String(body?.familyName ?? "").trim().slice(0, 60);
  const email = String(body?.email ?? "").trim().slice(0, 120);
  const sourceId = typeof body?.sourceId === "string" ? body.sourceId : "";
  const digits = String(body?.phoneNumber ?? "").replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  // Honeypot: a field real visitors never see. Answer like a success so a bot learns nothing.
  if (body?.website) {
    return NextResponse.json({ ok: true });
  }
  if (!givenName || !familyName || national.length !== 10 || !sourceId) {
    return NextResponse.json({ error: "Please fill in your name, phone number and card." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }
  // The authorization must be an explicit, affirmative choice (the checkbox starts unchecked).
  if (body?.authorized !== true || body?.authorizationVersion !== CARD_AUTHORIZATION_VERSION) {
    return NextResponse.json({ error: "Please confirm the card authorization to continue." }, { status: 400 });
  }

  const phone = normalizePhoneE164(national);
  const customerName = `${givenName} ${familyName}`;
  if (phoneOverLimit(phone)) {
    return NextResponse.json(
      { error: "Too many cards were refused for this number. Please text us at 619-323-1185 and we'll help." },
      { status: 429 },
    );
  }

  let customerId: string;
  let profileName: string | null = null;
  let profileNote: string | null = null;
  try {
    customerId = await findOrCreateCustomer({
      givenName,
      familyName,
      phoneNumber: phone,
      emailAddress: email || undefined,
      smsOptIn: false,
    });
    const existing = await getSquareClient().customers.get({ customerId });
    profileName = [existing.customer?.givenName, existing.customer?.familyName].filter(Boolean).join(" ") || null;
    profileNote = existing.customer?.note ?? null;
  } catch (err) {
    console.error("Card-on-file: customer lookup/create failed", err);
    return NextResponse.json({ error: "Something went wrong on our side. Please try again in a minute." }, { status: 502 });
  }

  let card: SavedCardInfo;
  try {
    card = await storeCardOnFileDetailed({ sourceId, customerId, cardholderName: customerName });
  } catch (err) {
    const code = err instanceof SquareError ? err.errors?.[0]?.code : undefined;
    const cardProblem = Boolean(code && FRIENDLY_MESSAGES[code]);
    const message = friendlyCardErrorMessage(err);
    console.warn("Card-on-file: card refused", code ?? err);
    const failure = recordFailure(phone);
    await notifyCardOnFile({
      event: "DECLINED",
      customerName,
      phoneNumber: phone,
      email: email || undefined,
      errorCode: code,
      errorMessage: cardProblem ? message : "Not a card problem: Square/system error, please check",
      failedAttempts: failure.phoneFailures,
    });
    if (failure.pausedNow) {
      await notifyCardOnFile({ event: "BLOCKED", failedAttempts: failure.globalFailures });
    }
    return NextResponse.json({ error: message }, { status: 402 });
  }

  const warnings: string[] = [];
  if (card.prepaid) warnings.push("Prepaid card: it may not have money on it for a $25 fee / Предоплаченная карта: на ней может не быть денег");
  if (expiresWithinDays(card, 60)) warnings.push(`Card expires soon (${expiry(card)}) / Карта скоро истекает`);
  if (profileName && !sameName(profileName, customerName)) {
    warnings.push(`Name on the form "${customerName}" differs from the Square profile "${profileName}" / Имя не совпадает с профилем`);
  }
  const earlierFailures = failuresForPhone(phone);
  if (earlierFailures > 0) {
    warnings.push(`Saved after ${earlierFailures} refused card(s) this hour / Сохранена после ${earlierFailures} отказа(ов)`);
  }

  // Proof of the client's consent, kept on their Square profile next to the card: what they
  // agreed to (versioned text), when (Pacific time), and from where. This is what a dispute needs.
  try {
    const line =
      `Card on file authorized: ${card.brand ?? "card"} ending ${card.last4 ?? "?"}, ${pacificNow()}, ` +
      `via akluxnails.com/card ($25 late-cancel/no-show policy, authorization v${CARD_AUTHORIZATION_VERSION}, IP ${clientIp(request)}).`;
    await getSquareClient().customers.update({ customerId, note: profileNote ? `${profileNote}\n${line}` : line });
  } catch (err) {
    console.error("Card-on-file: saving the authorization note failed (card itself is saved)", err);
    warnings.push("Couldn't write the authorization note to the Square profile / Не удалось записать согласие в профиль Square");
  }

  await notifyCardOnFile({
    event: "SAVED",
    customerName,
    phoneNumber: phone,
    email: email || undefined,
    cardBrand: card.brand,
    last4: card.last4,
    cardType: card.cardType,
    expiry: expiry(card),
    warnings,
  });

  return NextResponse.json({ ok: true, brand: card.brand ?? null, last4: card.last4 ?? null });
}
