"use client";

import { createContext, useContext, useState } from "react";
import BookingModal from "./BookingModal";

const BookingModalContext = createContext<{ open: () => void } | null>(null);

export function useBookingModal() {
  const ctx = useContext(BookingModalContext);
  if (!ctx) throw new Error("useBookingModal must be used within BookingModalProvider");
  return ctx;
}

export default function BookingModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BookingModalContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}
      {isOpen && <BookingModal onClose={() => setIsOpen(false)} />}
    </BookingModalContext.Provider>
  );
}
