import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verifies the same-day-rebooking promo link's HMAC signature — must match salaryReview's
 * RebookingPromoSigner byte-for-byte (HMAC-SHA256 over "{code}.{expEpochSeconds}", base64url
 * without padding), since both sides sign/verify against the same shared secret. See
 * openspec/changes/same-day-rebooking-discount design.md D8.
 *
 * Fails closed: a missing REBOOKING_PROMO_SECRET or any malformed input returns false rather than
 * throwing or, worse, treating an unsignable link as valid.
 */
export function verifyRebookingPromoSignature(code: string, expEpochSeconds: number, signature: string | null): boolean {
  const secret = process.env.REBOOKING_PROMO_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret)
    .update(`${code}.${expEpochSeconds}`)
    .digest("base64url");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
