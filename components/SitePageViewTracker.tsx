"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  captureFirstSeen,
  captureFirstTouch,
  externalReferrer,
  firstSeen,
  get,
  hasFreshClick,
  set,
  trackedParams,
} from "@/lib/smsAttribution";

const SESSION_KEY = "ak_visit_session";
const VISIT_KEY = "ak_visit_seen";

/** Reports every page of the site to /api/track/page, so the first-touch source and the visit
 * history exist whichever page the visitor lands on or books from. The first page of a browser
 * session, and any page opened from a fresh ad click or tagged link, also creates a visit row;
 * other pages add a page_view event. Also keeps the first touch (UTM, click ids, referrer) in
 * localStorage plus a 180-day cookie. Fire-and-forget: never throws, never delays the page. */
export default function SitePageViewTracker() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    try {
      const firstSeenBefore = Object.keys(firstSeen()).length > 0;
      captureFirstSeen();
      captureFirstTouch();
      const params = trackedParams();
      const newSession = get("session", SESSION_KEY) === null;
      const visit = newSession || hasFreshClick(params);
      set("session", SESSION_KEY, "1");
      const isFirstVisit = newSession && get("local", VISIT_KEY) === null && !firstSeenBefore;
      const body = {
        path: pathname,
        params,
        visit,
        landing_url: window.location.pathname + window.location.search.split("#")[0],
        referrer: externalReferrer() ?? null,
        visit_referrer: document.referrer || null,
        is_first_visit: visit && isFirstVisit,
      };
      if (get("local", VISIT_KEY) === null) set("local", VISIT_KEY, String(Date.now()));
      fetch("/api/track/page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // tracking must never break the page
    }
  }, [pathname]);

  return null;
}
