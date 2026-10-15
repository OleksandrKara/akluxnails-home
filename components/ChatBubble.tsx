"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useBookingModal } from "./booking/BookingModalProvider";
import { useIsV4Theme } from "./v4/V4ThemeContext";
import { LOCATION } from "@/lib/siteData";

/**
 * Styled like the site's own header (owner 2026-10-15): the dark #1f1620 of the header pill, champagne
 * gold accent and plum ink from .v4-theme, Fraunces headings, uppercase gold buttons like Book Now.
 *
 * Floating chat button + a "hi from the team" teaser, bottom right on every page (owner request
 * 2026-10-14, same as pmu-annakara.com's): the faces of Lucy, Christine and Jane, who answer the
 * texts. "Text us" opens a text to the nails Twilio number (+1 844-981-4613), so the text lands in
 * salaryReview (staff Telegram alert, inbox) instead of the main line, with a first message that
 * names the page. No texting number on screen.
 *
 * Traffic source (owner: "make sure the traffic source gets through"): the tap is sent to
 * /api/track-click as a `target: "sms"` click with the page, its topic and the visitor's first-touch
 * attribution (UTM, gclid/fbclid, referrer, kept in localStorage from the first page of the visit,
 * since only the homepage records marketing.visits). salaryReview's SmsWebsiteLeadService ties the
 * text that arrives next to that tap and saves the contact with that source.
 *
 * Teaser rules: once per browser session at most, after 30s on the site (across pages) once the
 * visitor has scrolled, or earlier on desktop when the mouse leaves through the top of the window
 * (never in the first 8s); never over the booking or promo popup or while typing; x hides it for
 * 7 days; tapping it opens the chat card. On desktop, where `sms:` often opens nothing, the card's
 * big button opens booking and texting stays a small link.
 */
const SMS_NUMBER = "+18449814613";
const ATTR_KEY = "ak_nails_first_touch";
const ATTR_MAX_AGE_MS = 90 * 86_400_000;
const TEASER_SESSION_KEY = "ak_chat_teaser_shown";
const TEASER_DISMISS_KEY = "ak_chat_teaser_dismissed_until";
const SESSION_START_KEY = "ak_session_started_at";
const TEASER_AFTER_MS = 30_000;
const EXIT_MIN_MS = 8_000;
const DISMISS_DAYS = 7;
const HIDDEN_ON = ["/card", "/vip"];

type Attribution = Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "gclid" | "fbclid" | "referrer" | "landing_path", string>>;

function store(kind: "local" | "session") {
  try {
    return kind === "local" ? localStorage : sessionStorage;
  } catch {
    return null;
  }
}
function get(kind: "local" | "session", key: string): string | null {
  try {
    return store(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function set(kind: "local" | "session", key: string, value: string) {
  try {
    store(kind)?.setItem(key, value);
  } catch {
    // private mode: nothing breaks
  }
}

/** First touch of this visitor: kept for 90 days, replaced only by a fresh ad click. */
function captureFirstTouch() {
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

function firstTouch(): Attribution {
  try {
    const { at: _at, ...rest } = JSON.parse(get("local", ATTR_KEY) ?? "{}");
    void _at;
    return rest;
  } catch {
    return {};
  }
}

function gaClientId(): string | undefined {
  return document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/)?.[1];
}

/** Page topic for the first message: the title before "|", without "in San Diego". */
function pageTopic(pathname: string): { body: string; topic?: string } {
  if (pathname === "/" || pathname.startsWith("/v4")) return { body: "Hi! I have a question about a nail appointment." };
  const raw = document.title.split(/[|–—]/)[0].replace(/\s+in (Downtown )?San Diego.*$/i, "").trim();
  if (!raw) return { body: "Hi! I have a question about a nail appointment." };
  const topic = raw.length > 70 ? raw.slice(0, 69).trimEnd() + "…" : raw;
  return pathname.startsWith("/blog/")
    ? { body: `Hi! I just read "${topic}" on your site and have a question.`, topic }
    : { body: `Hi! I have a question about ${topic}.`, topic };
}

function busy(): boolean {
  const el = document.activeElement;
  if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return true;
  if (document.querySelector('[data-track="chat_bubble"] [role="dialog"]')) return true;
  return !!document.querySelector('[role="dialog"][aria-modal="true"]') || document.body.style.overflow === "hidden";
}

function teaserAllowed(): boolean {
  if (get("session", TEASER_SESSION_KEY)) return false;
  const until = Number(get("local", TEASER_DISMISS_KEY) ?? 0);
  return !(until && Date.now() < until);
}

function pushDataLayer(event: string, params: Record<string, unknown>) {
  try {
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...params });
  } catch {
    // analytics only
  }
}

function beacon(body: Record<string, unknown>) {
  try {
    navigator.sendBeacon?.("/api/track-click", JSON.stringify(body));
  } catch {
    // analytics only
  }
}

export default function ChatBubble() {
  const pathname = usePathname() ?? "/";
  const { open: openBooking } = useBookingModal();
  const isV4 = useIsV4Theme();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null);
  const [href, setHref] = useState(`sms:${SMS_NUMBER}`);
  const [topic, setTopic] = useState<string | undefined>();
  const [desktop, setDesktop] = useState(false);
  const [teaser, setTeaser] = useState(false);
  // Sits inside the homepage's mobile sticky booking bar while it's up (StickyBookBar leaves the
  // space on its right for it), floats on its own everywhere else.
  const [docked, setDocked] = useState(false);
  const hidden = HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    captureFirstTouch();
  }, []);

  useEffect(() => {
    const check = () =>
      setDocked(
        !!document.querySelector('[data-sticky-book-bar="visible"]') && window.matchMedia("(max-width: 639px)").matches,
      );
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    const t = window.setTimeout(check, 300);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      window.clearTimeout(t);
    };
  }, [pathname]);

  useEffect(() => {
    if (hidden || !teaserAllowed()) return;
    let start = Number(get("session", SESSION_START_KEY) ?? 0);
    if (!start) {
      start = Date.now();
      set("session", SESSION_START_KEY, String(start));
    }
    let scrolled = window.scrollY > 300;
    const show = (trigger: string) => {
      if (busy() || !teaserAllowed()) return false;
      set("session", TEASER_SESSION_KEY, "1");
      setTeaser(true);
      pushDataLayer("chat_teaser_shown", { trigger, page_path: window.location.pathname });
      return true;
    };
    const tick = window.setInterval(() => {
      if (scrolled && Date.now() - start >= TEASER_AFTER_MS && show("timer")) window.clearInterval(tick);
    }, 2_000);
    const onScroll = () => {
      if (window.scrollY > 300) scrolled = true;
    };
    const onLeave = (e: MouseEvent) => {
      if (e.relatedTarget === null && e.clientY <= 0 && Date.now() - start >= EXIT_MIN_MS) show("exit_intent");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (window.matchMedia("(pointer: fine)").matches) document.addEventListener("mouseout", onLeave);
    return () => {
      window.clearInterval(tick);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [pathname, hidden]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (hidden) return null;

  function toggle(source: "bubble" | "teaser") {
    if (open) return setOpen(false);
    setTeaser(false);
    const t = pageTopic(pathname);
    setTopic(t.topic);
    setHref(`sms:${SMS_NUMBER}?&body=${encodeURIComponent(t.body)}`);
    setDesktop(window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches);
    pushDataLayer("chat_open", { source, page_path: pathname });
    beacon({ target: "chat_open", source, path: pathname });
    setOpen(true);
  }

  function dismissTeaser() {
    setTeaser(false);
    set("local", TEASER_DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
  }

  /** The tap salaryReview ties the incoming text to: page, topic and first-touch source. */
  function onTextTap() {
    pushDataLayer("sms_click", { link_location: "chat_bubble", page_path: pathname });
    beacon({ target: "sms", source: "chat_bubble", path: pathname, topic, ...firstTouch(), ga_client_id: gaClientId() });
  }

  const avatars = ["lucy", "christine", "jane"];

  return (
    <div
      data-track="chat_bubble"
      style={{ fontFamily: "var(--font-body)", bottom: docked ? "calc(8px + env(safe-area-inset-bottom, 0px))" : "calc(16px + env(safe-area-inset-bottom, 0px))" }}
      className="v4-theme fixed right-4 z-40 flex flex-col items-end gap-3 print:hidden"
    >
      {teaser && !open ? (
        <div className="ak-chat-teaser relative w-[min(320px,calc(100vw-32px))]">
          <button
            type="button"
            onClick={() => toggle("teaser")}
            className="block w-full rounded-2xl bg-white p-4 pr-9 text-left shadow-[0_10px_32px_rgba(0,0,0,0.16)] ring-1 ring-black/5"
          >
            <span className="flex">
              {avatars.map((n, i) => (
                <Image
                  key={n}
                  src={`/images/team/chat-${n}.webp`}
                  alt=""
                  width={40}
                  height={40}
                  className={`h-10 w-10 rounded-full object-cover ring-2 ring-white${i ? " -ml-2.5" : ""}`}
                />
              ))}
            </span>
            <span className="mt-2 block text-[16px] leading-snug text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
              AK.LUX.NAILS
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--color-gold-text)]">Lucy, Christine &amp; Jane</span>
            <span className="mt-2 block text-[14px] leading-snug text-[var(--color-muted)]">
              Hi! Have a question about nails or prices? Text us and we&apos;ll be happy to help.
            </span>
          </button>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={dismissTeaser}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-black/40 hover:bg-black/5 hover:text-black/70"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      ) : null}
      {open ? (
        <div
          role="dialog"
          aria-label="Questions? Text us"
          className="w-[min(320px,calc(100vw-32px))] overflow-hidden rounded-2xl bg-white text-left shadow-[0_12px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
        >
          <div className="flex items-start justify-between gap-3 bg-[#1f1620] px-5 pb-4 pt-4 text-white">
            <div>
              <p className="text-[18px] leading-snug" style={{ fontFamily: "var(--font-heading)" }}>Questions? Text us</p>
              <p className="mt-1 text-[13px] leading-snug text-white/70">About a service, prices or an appointment.</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="-mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="px-5 pb-5 pt-4">
            {desktop ? (
              <>
                <button
                  type="button"
                  className="flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] py-3.5 text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)] transition hover:bg-[var(--color-accent-hover)]"
                  onClick={() => {
                    setOpen(false);
                    beacon({ target: "book_now", source: "chat_bubble" });
                    openBooking(undefined, isV4 ? "v4" : undefined);
                  }}
                >
                  Book an appointment
                </button>
                <p className="mt-3 text-center text-[13px] text-[var(--color-muted-2)]">
                  <a href={href} onClick={onTextTap} className="whitespace-nowrap font-medium text-[var(--color-ink)] underline underline-offset-2">
                    Text us
                  </a>{" "}
                  or call{" "}
                  <a href={LOCATION.phoneHref} className="whitespace-nowrap font-medium text-[var(--color-ink)] underline underline-offset-2">
                    {LOCATION.phone}
                  </a>
                </p>
              </>
            ) : (
              <>
                <a
                  href={href}
                  onClick={onTextTap}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] py-4 text-[14px] font-bold uppercase tracking-[0.12em] text-[var(--color-ink)] transition hover:bg-[var(--color-accent-hover)]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-4.6A8.4 8.4 0 1 1 21 11.5z" />
                  </svg>
                  Text us
                </a>
                <p className="mt-3 text-center text-[13px] text-[var(--color-muted-2)]">
                  or call{" "}
                  <a href={LOCATION.phoneHref} className="whitespace-nowrap font-medium text-[var(--color-ink)] underline underline-offset-2">
                    {LOCATION.phone}
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      ) : null}
      <button
        type="button"
        aria-label={open ? "Close chat" : "Questions? Text us"}
        aria-expanded={open}
        onClick={() => toggle("bubble")}
        className="grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-[#1f1620] text-[var(--color-accent)] shadow-[0_8px_24px_rgba(31,22,32,0.35)] transition-transform hover:scale-105 active:scale-95"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 3C6.5 3 2 6.9 2 11.7c0 2.4 1.1 4.6 3 6.2L4.2 21.5a.5.5 0 0 0 .7.6l4.2-2c.9.2 1.9.4 2.9.4 5.5 0 10-3.9 10-8.8S17.5 3 12 3zm-4.5 10a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6zm4.5 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6zm4.5 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6z" />
          </svg>
        )}
      </button>
    </div>
  );
}
