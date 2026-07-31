"use client";

import { useEffect, useState } from "react";

function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Mobile-first promo banner for the same-day-rebooking-discount link — only ever rendered by
 * app/page.tsx when the promo/exp/sig query params were verified server-side, so this component
 * itself does no verification (see openspec/changes/same-day-rebooking-discount design.md D6/D8).
 * Full-width, not a corner toast — legible without zooming on a phone. Ticks client-side from the
 * fixed expEpochSeconds already in the URL, no server round-trip needed for the countdown itself.
 */
export default function RebookingPromoBanner({ expEpochSeconds }: { expEpochSeconds: number }) {
  const expiresAtMs = expEpochSeconds * 1000;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const expired = now >= expiresAtMs;

  return (
    <div
      className="w-full px-4 py-3 text-center text-sm font-medium sm:text-base"
      style={{
        backgroundColor: "var(--color-accent)",
        color: "white",
      }}
      role="status"
    >
      {expired ? (
        <span>This same-day rebooking offer has expired — but we&apos;d still love to see you again!</span>
      ) : (
        <span>
          🎁 <strong>$10 off</strong> your next visit (min. $99) if you book before midnight —{" "}
          <span className="font-mono tabular-nums">{formatCountdown(expiresAtMs - now)}</span> left
        </span>
      )}
    </div>
  );
}
