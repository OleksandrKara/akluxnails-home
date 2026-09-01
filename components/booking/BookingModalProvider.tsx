"use client";

import { createContext, useContext, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Preselection } from "./useBookingFlow";
import type { VerifiedPromo } from "./types";

// Lazy-loaded, not rendered until a visitor actually clicks "Book Now" — the full multi-step flow
// (services/add-ons/date-time/details/card-on-file steps) was previously a static import here,
// which meant every page load shipped and parsed that whole bundle even for visitors who never
// open it. This was the single largest "reduce unused JavaScript" finding in a PageSpeed Insights
// audit (2026-09-01) and a real contributor to mobile LCP "element render delay". `ssr: false`
// since the modal is pure client interaction, never needed for the initial server-rendered paint.
const BookingModal = dynamic(() => import("./BookingModal"), { ssr: false });

type ModalTheme = "v4" | undefined;

const BookingModalContext = createContext<{ open: (preselection?: Preselection, theme?: ModalTheme) => void } | null>(
  null,
);

export function useBookingModal() {
  const ctx = useContext(BookingModalContext);
  if (!ctx) throw new Error("useBookingModal must be used within BookingModalProvider");
  return ctx;
}

export default function BookingModalProvider({ children }: { children: React.ReactNode }) {
  const [preselection, setPreselection] = useState<Preselection | null | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<ModalTheme>(undefined);
  const [verifiedPromo, setVerifiedPromo] = useState<VerifiedPromo | null>(null);

  // Resolved once, on first mount, regardless of when/whether the modal is ever opened — this
  // provider sits above any page's own server-rendered searchParams (see app/layout.tsx), so a
  // plain window.location.search read + a signature-verifying API round-trip is simpler than
  // threading page-level props across the layout boundary. The homepage's own server-rendered
  // promo banner verifies independently, directly — see openspec/changes/same-day-rebooking-
  // discount design.md D8.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("promo");
    const expRaw = params.get("exp");
    const signature = params.get("sig");
    if (!code || !expRaw || !signature) return;

    fetch(`/api/rebooking-promo/verify?promo=${encodeURIComponent(code)}&exp=${encodeURIComponent(expRaw)}&sig=${encodeURIComponent(signature)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setVerifiedPromo({ code: data.code, expEpochSeconds: data.expEpochSeconds, signature: data.signature });
        }
      })
      .catch(() => {
        // Fails closed — no promo state, same as if the params were never present.
      });
  }, []);

  return (
    <BookingModalContext.Provider
      value={{
        open: (p, t) => {
          setPreselection(p);
          setTheme(t);
          setIsOpen(true);
        },
      }}
    >
      {children}
      {isOpen && (
        <BookingModal
          onClose={() => setIsOpen(false)}
          preselection={preselection ?? undefined}
          theme={theme}
          verifiedPromo={verifiedPromo}
        />
      )}
    </BookingModalContext.Provider>
  );
}
