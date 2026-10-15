/**
 * Text-link attribution for akluxnails.com (2026-10-14/15): the visitor's first touch (UTM,
 * gclid/fbclid, referrer, Reserve with Google / SMS promo links) kept in localStorage from the first
 * page of the visit, since only the homepage records marketing.visits; and the beacon that tells
 * /api/track-click about a tap on a texting link, which salaryReview's SmsWebsiteLeadService ties
 * to the text that follows. Shared by the chat button and SmsClickTracker.
 */
export const ATTR_KEY = "ak_nails_first_touch";
const ATTR_MAX_AGE_MS = 90 * 86_400_000;

export type Attribution = Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "gclid" | "fbclid" | "referrer" | "landing_path", string>>;

function store(kind: "local" | "session") {
  try {
    return kind === "local" ? localStorage : sessionStorage;
  } catch {
    return null;
  }
}
export function get(kind: "local" | "session", key: string): string | null {
  try {
    return store(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
export function set(kind: "local" | "session", key: string, value: string) {
  try {
    store(kind)?.setItem(key, value);
  } catch {
    // private mode: nothing breaks
  }
}

/** First touch of this visitor: kept for 90 days, replaced only by a fresh ad click. */
export function captureFirstTouch() {
  const params = new URLSearchParams(window.location.search);
  const fresh = ["utm_source", "gclid", "fbclid"].some((k) => params.has(k));
  if (!fresh && get("local", ATTR_KEY)) {
    try {
      const saved = JSON.parse(get("local", ATTR_KEY)!);
      if (Date.now() - (saved.at ?? 0) < ATTR_MAX_AGE_MS) return;
    } catch {
      // unreadable: capture again
    }
  }
  const a: Attribution & { at: number } = { at: Date.now(), landing_path: window.location.pathname };
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid"] as const) {
    const v = params.get(k);
    if (v) a[k] = v.slice(0, 200);
  }
  if (!a.utm_source && !a.gclid && !a.fbclid) {
    if (params.get("rwg_token")) {
      a.utm_source = "google";
      a.utm_medium = "reserve_with_google";
    } else if (params.get("promo")) {
      a.utm_source = "sms";
      a.utm_medium = "promo";
      a.utm_campaign = params.get("promo")!.slice(0, 50);
    }
  }
  if (document.referrer && !document.referrer.startsWith(window.location.origin)) a.referrer = document.referrer.slice(0, 500);
  set("local", ATTR_KEY, JSON.stringify(a));
}

export function firstTouch(): Attribution {
  try {
    const { at: _at, ...rest } = JSON.parse(get("local", ATTR_KEY) ?? "{}");
    void _at;
    return rest;
  } catch {
    return {};
  }
}

export function gaClientId(): string | undefined {
  return document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/)?.[1];
}

/** Page topic for the first message: the title before "|", without "in San Diego". */
export function pageTopic(pathname: string): { body: string; topic?: string } {
  if (pathname === "/" || pathname.startsWith("/v4")) return { body: "Hi! I have a question about a nail appointment." };
  const raw = document.title.split(/[|–—]/)[0].replace(/\s+in (Downtown )?San Diego.*$/i, "").trim();
  if (!raw) return { body: "Hi! I have a question about a nail appointment." };
  const topic = raw.length > 70 ? raw.slice(0, 69).trimEnd() + "…" : raw;
  return pathname.startsWith("/blog/")
    ? { body: `Hi! I just read "${topic}" on your site and have a question.`, topic }
    : { body: `Hi! I have a question about ${topic}.`, topic };
}

export function pushDataLayer(event: string, params: Record<string, unknown>) {
  try {
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...params });
  } catch {
    // analytics only
  }
}

export function beacon(body: Record<string, unknown>) {
  try {
    navigator.sendBeacon?.("/api/track-click", JSON.stringify(body));
  } catch {
    // analytics only
  }
}

