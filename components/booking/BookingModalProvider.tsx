"use client";

import { createContext, useContext, useState } from "react";
import BookingModal from "./BookingModal";
import type { Preselection } from "./useBookingFlow";

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
        <BookingModal onClose={() => setIsOpen(false)} preselection={preselection ?? undefined} theme={theme} />
      )}
    </BookingModalContext.Provider>
  );
}
