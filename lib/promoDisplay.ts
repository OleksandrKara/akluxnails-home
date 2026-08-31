/** REBOOK10 = $10 off (same-day-rebooking-discount), WINBACK5 = $5 off
 * (lapsed-customer-winback-automation) — see openspec/changes/lapsed-customer-winback-automation
 * design.md D9. Shared, client-safe (no "server-only") display helpers so RebookingPromoBanner
 * (persistent top bar) and RebookingPromoModal (first-load popup) never drift on amount/countdown
 * formatting. Falls back to the REBOOK10 wording for an unrecognized code (shouldn't happen — both
 * callers only ever see a code that already passed server-side signature verification, and only
 * these two codes are ever signed — but a wrong amount is worse than a slightly-generic one). */
export function promoAmountLabel(code: string): string {
  return code === "WINBACK5" ? "$5" : "$10";
}

export function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}
