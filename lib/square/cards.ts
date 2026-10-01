import { randomUUID } from "crypto";
import { getSquareClient } from "./client";

export interface StoreCardInput {
  sourceId: string;
  customerId: string;
  cardholderName?: string;
}

/**
 * Stores a Web-Payments-SDK-tokenized card on the customer's Square profile for no-show
 * protection. This never charges anything — it's pure card-on-file storage. If a no-show occurs,
 * the salon charges this saved card manually from Square's own dashboard/POS, matching the
 * existing manual cancellation-fee process (see salaryReview's NoShowFeeService).
 */
export async function storeCardOnFile(input: StoreCardInput): Promise<string> {
  const client = getSquareClient();
  const response = await client.cards.create({
    idempotencyKey: randomUUID(),
    sourceId: input.sourceId,
    card: {
      customerId: input.customerId,
      cardholderName: input.cardholderName,
    },
  });
  if (!response.card?.id) {
    throw new Error("Square did not return a card id");
  }
  return response.card.id;
}

export interface SavedCardInfo {
  id: string;
  brand?: string;
  last4?: string;
  cardType?: string;
  prepaid: boolean;
  expMonth?: number;
  expYear?: number;
}

/** Same as storeCardOnFile, but returns what Square knows about the saved card (never the
 * number), so the card-on-file page can flag prepaid or soon-expiring cards to staff. */
export async function storeCardOnFileDetailed(input: StoreCardInput): Promise<SavedCardInfo> {
  const client = getSquareClient();
  const response = await client.cards.create({
    idempotencyKey: randomUUID(),
    sourceId: input.sourceId,
    card: {
      customerId: input.customerId,
      cardholderName: input.cardholderName,
    },
  });
  const card = response.card;
  if (!card?.id) {
    throw new Error("Square did not return a card id");
  }
  return {
    id: card.id,
    brand: card.cardBrand ?? undefined,
    last4: card.last4 ?? undefined,
    cardType: card.cardType ?? undefined,
    prepaid: card.prepaidType === "PREPAID",
    expMonth: card.expMonth != null ? Number(card.expMonth) : undefined,
    expYear: card.expYear != null ? Number(card.expYear) : undefined,
  };
}
