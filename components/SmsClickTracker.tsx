"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { beacon, captureFirstTouch, firstTouch, gaClientId, pageTopic, pushDataLayer } from "@/lib/smsAttribution";

/** Every texting link on the site goes to the nails Twilio number (owner 2026-10-15), so texts
 * land in salaryReview with a traffic source. One listener for all of them (header, hero, gift
 * card, prepay, group booking, refer a friend, VIP, the chat button): a tap is sent to
 * /api/track-click as a `target: "sms"` click with where on the page it was (`source`, from the
 * nearest `data-track`, else "content"), the page, its topic and the visitor's first-touch
 * attribution; it also pushes `sms_click` to the dataLayer. Also captures that first touch on the
 * first page of the visit. */
export default function SmsClickTracker() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    captureFirstTouch();
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest?.("a[href^='sms:']") as HTMLAnchorElement | null;
      if (!link) return;
      const source = (link.closest("[data-track]") as HTMLElement | null)?.dataset.track ?? "content";
      pushDataLayer("sms_click", { link_location: source, page_path: pathname });
      beacon({
        target: "sms",
        source,
        path: pathname,
        topic: pageTopic(pathname).topic,
        ...firstTouch(),
        ga_client_id: gaClientId(),
      });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return null;
}
