import "server-only";

/**
 * Abuse limits for the public card-on-file page (akluxnails.com/card). Any page that saves cards
 * is a target for "card testing": bots running stolen card numbers through it to see which ones
 * the bank accepts. Square/the bank refuse bad cards on their own; these limits keep a bot from
 * using us as its checker, and tell staff when it happens.
 *
 * In-memory, per running container: enough for one small site (one live container at a time
 * behind blue/green), and it resets on deploy, which only ever makes it more lenient.
 */
const HOUR_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_IP_PER_HOUR = 6;
const MAX_FAILURES_PER_PHONE_PER_HOUR = 5;
/** Site-wide refusals inside the window that look like an attack rather than real clients
 * mistyping (a normal day has a handful of card entries in total). */
const GLOBAL_FAILURE_LIMIT = 12;
const GLOBAL_WINDOW_MS = 30 * 60 * 1000;
const PAUSE_MS = HOUR_MS;

const ipRequests = new Map<string, number[]>();
const phoneFailures = new Map<string, number[]>();
let globalFailures: number[] = [];
let pausedUntil = 0;

function recent(times: number[] | undefined, windowMs: number, now: number): number[] {
  return (times ?? []).filter((t) => now - t < windowMs);
}

function prune(map: Map<string, number[]>, now: number) {
  if (map.size < 2000) return;
  for (const [key, times] of map) {
    if (recent(times, HOUR_MS, now).length === 0) map.delete(key);
  }
}

export function isPaused(now = Date.now()): boolean {
  return now < pausedUntil;
}

/** Counts this request against the IP; true if the IP is over its hourly limit. */
export function ipOverLimit(ip: string, now = Date.now()): boolean {
  const times = recent(ipRequests.get(ip), HOUR_MS, now);
  times.push(now);
  ipRequests.set(ip, times);
  prune(ipRequests, now);
  return times.length > MAX_REQUESTS_PER_IP_PER_HOUR;
}

export function phoneOverLimit(phone: string, now = Date.now()): boolean {
  return recent(phoneFailures.get(phone), HOUR_MS, now).length >= MAX_FAILURES_PER_PHONE_PER_HOUR;
}

export function failuresForPhone(phone: string, now = Date.now()): number {
  return recent(phoneFailures.get(phone), HOUR_MS, now).length;
}

/** Records a refused card. Returns `pausedNow: true` exactly once, when this failure tips the
 * site-wide count over the limit and the page pauses itself (so the caller sends one alert, not
 * one per bot request). */
export function recordFailure(phone: string, now = Date.now()): { phoneFailures: number; pausedNow: boolean; globalFailures: number } {
  const times = recent(phoneFailures.get(phone), HOUR_MS, now);
  times.push(now);
  phoneFailures.set(phone, times);
  prune(phoneFailures, now);

  globalFailures = recent(globalFailures, GLOBAL_WINDOW_MS, now);
  globalFailures.push(now);
  let pausedNow = false;
  if (globalFailures.length >= GLOBAL_FAILURE_LIMIT && !isPaused(now)) {
    pausedUntil = now + PAUSE_MS;
    pausedNow = true;
  }
  return { phoneFailures: times.length, pausedNow, globalFailures: globalFailures.length };
}

/** Test-only. */
export function resetCardOnFileGuard() {
  ipRequests.clear();
  phoneFailures.clear();
  globalFailures = [];
  pausedUntil = 0;
}
