import { SquareError } from "square";

// Square's real error codes for a declined/invalid card (see Square's ErrorCode reference) —
// mapped to plain-language messages a customer can actually act on, instead of a generic
// "something went wrong" that just leaves them stuck.
const FRIENDLY_MESSAGES: Record<string, string> = {
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
  INVALID_CARD_DATA: "This card couldn't be validated. Please double-check the details or try a different card.",
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

const DEFAULT_MESSAGE = "This card couldn't be saved. Please double-check the details or try a different card.";

export function friendlyCardErrorMessage(err: unknown): string {
  if (err instanceof SquareError) {
    const code = err.errors?.[0]?.code;
    if (code && FRIENDLY_MESSAGES[code]) return FRIENDLY_MESSAGES[code];
  }
  return DEFAULT_MESSAGE;
}
