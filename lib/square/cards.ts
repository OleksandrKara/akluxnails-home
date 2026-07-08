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
