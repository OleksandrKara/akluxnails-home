"use client";

import { createContext, useContext, useEffect, useState } from "react";
import BookingModal from "./BookingModal";
import type { Preselection } from "./useBookingFlow";
import type { VerifiedPromo } from "./types";

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
