import { SquareError } from "square";

// Square's real error codes for a declined/invalid card (see Square's ErrorCode reference) —
// mapped to plain-language messages a customer can actually act on, instead of a generic
// "something went wrong" that just leaves them stuck. Exported so the client-side tokenize()
// error path (lib/square/tokenizeErrors.ts — no "square" package import there, since that file
// is bundled into the browser) can reuse the exact same wording instead of drifting out of sync.
export const FRIENDLY_MESSAGES: Record<string, string> = {
  CVV_FAILURE: "The security code (CVV) doesn't match your card. Please double-check it and try again.",
  ADDRESS_VERIFICATION_FAILURE: "The billing ZIP code doesn't match your card. Please check it and try again.",
  INVALID_POSTAL_CODE: "That ZIP code doesn't look right. Please check it and try again.",
  INSUFFICIENT_FUNDS: "This card was declined for insufficient funds. Please try a different card.",
  CARD_EXPIRED: "This card has expired. Please try a different card.",
  EXPIRATION_FAILURE: "This card's expiration date is invalid. Please check it and try again.",
  INVALID_EXPIRATION: "This card's expiration date is invalid. Please check it and try again.",
  INVALID_EXPIRATION_YEAR: "This card's expiration year is invalid. Please check it and try again.",
  INVALID_EXPIRATION_DATE: "This card's expiration date is invalid. Please check it and try again.",
  PAN_FAILURE: "That card number doesn't look valid. Please double-check it and try again.",
  INVALID_CARD: "This card couldn't be validated. Please double-check the details or try a different card.",
  INVALID_CARD_DATA:
    "This card couldn't be validated. Please double-check the card number, expiration date, security code (CVV) and ZIP, or try a different card.",
  UNSUPPORTED_CARD_BRAND: "That card type isn't supported. Please try a different card.",
  CARD_NOT_SUPPORTED: "This card isn't supported for online booking. Please try a different card.",
  CARD_DECLINED: "This card was declined. Please try a different card or contact your bank.",
  CARD_DECLINED_CALL_ISSUER: "This card was declined — your bank has asked you to call them before trying again.",
  CARD_DECLINED_VERIFICATION_REQUIRED: "Your bank needs to verify this card. Please contact them, or try a different card.",
  GENERIC_DECLINE: "This card was declined. Please try a different card or contact your bank.",
  CARD_TOKEN_EXPIRED: "That took a bit too long — please re-enter your card details and try again.",
  CARD_TOKEN_USED: "Please re-enter your card details and try again.",
  INVALID_ACCOUNT: "Your bank couldn't locate this account. Please try a different card.",
  VOICE_FAILURE: "Your bank requires phone verification for this card. Please try a different card.",
  ALLOWABLE_PIN_TRIES_EXCEEDED: "This card has exceeded its PIN attempts. Please try a different card.",
};

export const DEFAULT_MESSAGE = "This card couldn't be saved. Please double-check the details or try a different card.";

/** Square's error code (CVV_FAILURE, CARD_DECLINED, ...) from a failed SDK call. Read by shape,
 * not `instanceof SquareError`: in the production build the thrown error isn't always the same
 * class instance as the one imported here, and the instanceof check silently failed (2026-10-01:
 * a wrong CVV was reported to staff as a system error and the client got the generic message). */
export function squareErrorCode(err: unknown): string | undefined {
  const fromShape = (e: unknown) =>
    (e as { errors?: { code?: unknown }[] } | null)?.errors?.[0]?.code;
  const code =
    (err instanceof SquareError ? err.errors?.[0]?.code : undefined) ??
    fromShape(err) ??
    fromShape((err as { body?: unknown } | null)?.body);
  return typeof code === "string" ? code : undefined;
}

export function friendlyCardErrorMessage(err: unknown): string {
  const code = squareErrorCode(err);
  if (code && FRIENDLY_MESSAGES[code]) return FRIENDLY_MESSAGES[code];
  return DEFAULT_MESSAGE;
}

/** Staff-facing reason for the Telegram alert, "English / Russian" (the alert splits on " / "
 * into its two language sections). Square's INVALID_CARD_DATA doesn't say which field was wrong,
 * so it says so instead of guessing. */
export function staffCardErrorReason(code: string | undefined): string {
  switch (code) {
    case "CVV_FAILURE":
      return "Wrong security code (CVV) / Неверный CVV-код";
    case "ADDRESS_VERIFICATION_FAILURE":
    case "INVALID_POSTAL_CODE":
      return "ZIP code doesn't match the card / ZIP-код не совпадает с картой";
    case "INVALID_CARD_DATA":
    case "INVALID_CARD":
    case "PAN_FAILURE":
      return (
        "Card details rejected: wrong card number, expiry date, CVV or ZIP (Square doesn't say which), usually a typo" +
        " / Данные карты не прошли проверку: неверный номер, срок, CVV или ZIP (Square не уточняет, что именно), обычно опечатка"
      );
    case "CARD_EXPIRED":
      return "Card is expired / Карта просрочена";
    case "EXPIRATION_FAILURE":
    case "INVALID_EXPIRATION":
    case "INVALID_EXPIRATION_YEAR":
    case "INVALID_EXPIRATION_DATE":
      return "Wrong expiry date / Неверный срок действия карты";
    case "INSUFFICIENT_FUNDS":
      return "Insufficient funds / Недостаточно средств на карте";
    case "CARD_DECLINED":
    case "GENERIC_DECLINE":
    case "CARD_DECLINED_CALL_ISSUER":
    case "CARD_DECLINED_VERIFICATION_REQUIRED":
    case "INVALID_ACCOUNT":
    case "VOICE_FAILURE":
    case "ALLOWABLE_PIN_TRIES_EXCEEDED":
      return "Declined by the bank / Банк отклонил карту";
    case "UNSUPPORTED_CARD_BRAND":
    case "CARD_NOT_SUPPORTED":
      return "Card type not supported / Этот тип карты не поддерживается";
    case "CARD_TOKEN_EXPIRED":
    case "CARD_TOKEN_USED":
      return "Form expired, the client needs to re-enter the card / Форма устарела, клиенту нужно ввести карту заново";
    case undefined:
      return "Error on our side (Square/system), not the card, please check / Ошибка на нашей стороне (Square/система), а не карты, нужно проверить";
    default:
      return `Refused by Square / Square отклонил карту`;
  }
}
