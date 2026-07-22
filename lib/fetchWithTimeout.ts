// Shared by every client-side call the booking flow makes to this app's own /api/booking/*
// routes. Before this existed, a slow/unresponsive backend call (itself often waiting on a
// hanging upstream Square API call) left a plain fetch() simply never resolving — no timeout, no
// error, nothing to fall back to. That showed up most visibly as DateTimeStep's "Choose a time"
// screen getting stuck on "Loading available times…" forever, but every other step that talks to
// Square (finding/creating the Square customer, creating the booking, saving a card) had the
// exact same gap — the only difference was which spinner froze.
const TIMEOUT_MS = 12_000;

export interface FetchWithTimeoutOptions extends RequestInit {
  /** Extra attempts beyond the first, only on a timeout/network failure or a 5xx. Defaults to 0
   * (no retry) — safe to raise for an idempotent read (e.g. availability search, the services
   * catalog); leave at 0 for a write (creating a customer, a booking, saving a card) where a
   * timeout doesn't tell you whether the first attempt actually succeeded server-side, and
   * retrying blindly risks a duplicate. */
  retries?: number;
}

/** Every attempt is bounded to TIMEOUT_MS via AbortController, so a hung upstream call fails
 * visibly instead of leaving the caller waiting forever. Throws on a non-ok response (after
 * exhausting retries) so callers can rely on a normal try/catch, same as a network-level failure. */
export async function fetchWithTimeout(url: string, options: FetchWithTimeoutOptions = {}): Promise<Response> {
  const { retries = 0, ...init } = options;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      if (res.ok || res.status < 500) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timeoutId);
    }
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Failed to reach the server");
}
