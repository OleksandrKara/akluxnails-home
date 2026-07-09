"use client";

import { createContext, useContext } from "react";

/** Lets BookNowButton know it's being rendered within Homepage V4 (see HomePageV4.tsx, which
 * wraps its whole tree in V4ThemeProvider) so it can open the booking modal themed to match —
 * without this, every other variant (Control/Variant B/Variant D) gets no provider, so
 * useIsV4Theme() returns false and their modal is completely unaffected. */
const V4ThemeContext = createContext(false);

export function V4ThemeProvider({ children }: { children: React.ReactNode }) {
  return <V4ThemeContext.Provider value={true}>{children}</V4ThemeContext.Provider>;
}

export function useIsV4Theme(): boolean {
  return useContext(V4ThemeContext);
}
