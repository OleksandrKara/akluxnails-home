"use client";

import { useEffect, useState } from "react";
import { formatCountdown, promoAmountLabel } from "@/lib/promoDisplay";

/**
 * Mobile-first promo banner for the same-day-rebooking-discount ($10) and lapsed-customer-winback
 * ($5) links — only ever rendered by app/page.tsx when the promo/exp/sig query params were
 * verified server-side, so this component itself does no verification (see
 * openspec/changes/same-day-rebooking-discount design.md D6/D8). Full-width, not a corner toast —
 * legible without zooming on a phone. Ticks client-side from the fixed expEpochSeconds already in
 * the URL, no server round-trip needed for the countdown itself.
 *
 * Fixed height (h-8/sm:h-11) with breakpoint-specific copy that's deliberately short enough to
 * always stay on one line, rather than letting text wrap grow the box — HeaderV4 stacks its
 * floating pill nav directly below this banner inside the same fixed container, so a
 * height that isn't fixed and predictable would push the nav around. See HeaderV4's own docs
 * for why the two need to live in one fixed box together.
 */
export default function RebookingPromoBanner({
  expEpochSeconds,
  code,
}: {
  expEpochSeconds: number;
  code: string;
}) {
  const expiresAtMs = expEpochSeconds * 1000;
  const [now, setNow] = useState(() => Date.now());
  const amount = promoAmountLabel(code);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const expired = now >= expiresAtMs;

  return (
    <div
      className="flex h-8 w-full items-center justify-center px-3 text-center text-xs font-medium whitespace-nowrap sm:h-11 sm:px-4 sm:text-sm"
      style={{
        backgroundColor: "var(--color-accent)",
        color: "white",
      }}
      role="status"
    >
      {expired ? (
        <span className="truncate">
          <span className="sm:hidden">Offer expired — see you soon!</span>
          <span className="hidden sm:inline">
            This rebooking offer has expired — but we&apos;d still love to see you again!
          </span>
        </span>
      ) : (
        <span className="truncate">
          <span className="sm:hidden">
            🎁 {amount} off next visit —{" "}
            <span className="font-mono tabular-nums">{formatCountdown(expiresAtMs - now)}</span> left
          </span>
          <span className="hidden sm:inline">
            🎁 <strong>{amount} off</strong> your next visit (min. $99) if you book before midnight —{" "}
            <span className="font-mono tabular-nums">{formatCountdown(expiresAtMs - now)}</span> left
          </span>
        </span>
      )}
    </div>
  );
}
