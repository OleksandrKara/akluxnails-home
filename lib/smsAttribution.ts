/**
 * Text-link attribution for akluxnails.com (2026-10-14/15): the visitor's first touch (UTM,
 * gclid/fbclid, referrer, Reserve with Google / SMS promo links) kept in localStorage from the first
 * page of the visit, (every page records marketing.visits through SitePageViewTracker); and the beacon that tells
 * /api/track-click about a tap on a texting link, which salaryReview's SmsWebsiteLeadService ties
 * to the text that follows. Shared by the chat button and SmsClickTracker.
 */
export const ATTR_KEY = "ak_nails_first_touch";
export const FIRST_SEEN_KEY = "ak_nails_first_seen";
const ATTR_MAX_AGE_MS = 180 * 86_400_000;
const COOKIE_MAX_AGE_S = 180 * 86_400;
export const CLICK_IDS = ["gclid", "gbraid", "wbraid", "fbclid", "msclkid"] as const;
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type Attribution = Partial<
  Record<
    "utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content" | "gclid" | "gbraid" | "wbraid" | "fbclid" | "msclkid" | "referrer" | "landing_path" | "landing_url",
    string
  >
>;

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

function readCookie(name: string): string | null {
  try {
    const m = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
    return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
  } catch {
    return null;
  }
}
function writeCookie(name: string, value: string) {
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE_S}; SameSite=Lax${secure}`;
  } catch {
    // best-effort only
  }
}

/** localStorage first, the cookie mirror when storage is blocked or wiped (Safari ITP, in-app browsers). */
function readSaved(key: string): (Attribution & { at?: number }) | null {
  for (const raw of [get("local", key), readCookie(key)]) {
    if (!raw) continue;
    try {
      const saved = JSON.parse(raw);
      if (Date.now() - (saved.at ?? 0) < ATTR_MAX_AGE_MS) return saved;
    } catch {
      // unreadable: try the next copy
    }
  }
  return null;
}
function save(key: string, value: object) {
  const json = JSON.stringify(value);
  set("local", key, json);
  writeCookie(key, json);
}

/** Our own pages never count as a referrer. */
export function externalReferrer(): string | undefined {
  const ref = document.referrer;
  if (!ref) return undefined;
  try {
    const host = new URL(ref).hostname;
    if (host === window.location.hostname || /(^|\.)akluxnails\.com$/.test(host)) return undefined;
  } catch {
    return undefined;
  }
  return ref.slice(0, 500);
}

/** The UTM / click-id / promo parameters of the current URL, the only query parts we keep. */
export function trackedParams(search = window.location.search): Record<string, string> {
  const params = new URLSearchParams(search);
  const out: Record<string, string> = {};
  for (const k of [...UTM_KEYS, ...CLICK_IDS]) {
    const v = params.get(k);
    if (v) out[k] = v.slice(0, k.startsWith("utm_") ? 200 : 500);
  }
  if (params.get("rwg_token")) out.rwg_token = "1";
  const promo = params.get("promo");
  if (promo) out.promo = promo.slice(0, 50);
  return out;
}

export function hasFreshClick(p: Record<string, string>): boolean {
  return Boolean(p.utm_source || CLICK_IDS.some((k) => p[k]));
}

/** Where the visitor first showed up, kept for good: never replaced, so the CRM can tell the very
 * first visit from a later ad click. */
export function captureFirstSeen() {
  if (readSaved(FIRST_SEEN_KEY)) return;
  const p = trackedParams();
  const q = new URLSearchParams(Object.entries(p).filter(([k]) => k !== "rwg_token")).toString();
  save(FIRST_SEEN_KEY, {
    at: Date.now(),
    landing_path: window.location.pathname,
    landing_url: window.location.pathname + (q ? `?${q}` : ""),
    referrer: externalReferrer(),
    ...p,
  });
}

/** Attribution touch of this visitor: kept for 180 days, replaced only by a fresh ad click or
 * tagged link (UTM, click id, Reserve with Google, SMS promo). Stored in localStorage and a cookie. */
export function captureFirstTouch() {
  const p = trackedParams();
  const fresh = hasFreshClick(p);
  if (!fresh && readSaved(ATTR_KEY)) return;
  const q = new URLSearchParams(Object.entries(p).filter(([k]) => k !== "rwg_token")).toString();
  const a: Attribution & { at: number } = {
    at: Date.now(),
    landing_path: window.location.pathname,
    landing_url: window.location.pathname + (q ? `?${q}` : ""),
  };
  for (const k of [...UTM_KEYS, ...CLICK_IDS] as const) {
    if (p[k]) a[k] = p[k];
  }
  if (!a.utm_source && !CLICK_IDS.some((k) => a[k])) {
    if (p.rwg_token) {
      a.utm_source = "google";
      a.utm_medium = "reserve_with_google";
    } else if (p.promo) {
      a.utm_source = "sms";
      a.utm_medium = "promo";
      a.utm_campaign = p.promo;
    }
  }
  const ref = externalReferrer();
  if (ref) a.referrer = ref;
  save(ATTR_KEY, a);
}

export function firstTouch(): Attribution {
  const saved = readSaved(ATTR_KEY);
  if (!saved) return {};
  const { at: _at, ...rest } = saved;
  void _at;
  return rest;
}

export function firstSeen(): Attribution {
  const saved = readSaved(FIRST_SEEN_KEY);
  if (!saved) return {};
  const { at: _at, ...rest } = saved;
  void _at;
  return rest;
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

