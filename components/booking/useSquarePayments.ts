"use client";

import { useEffect, useRef, useState } from "react";

// Square's own type isn't published for the CDN global — kept minimal, just what this app uses.
interface SquareCard {
  attach(selector: string): Promise<void>;
  destroy(): Promise<void>;
  tokenize(verificationDetails?: unknown): Promise<{
    status: string;
    token?: string;
    errors?: { message: string }[];
  }>;
}
interface SquarePayments {
  card(): Promise<SquareCard>;
}
declare global {
  interface Window {
    Square?: { payments(appId: string, locationId: string): SquarePayments };
  }
}

const SDK_URL =
  process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "sandbox"
    ? "https://sandbox.web.squarecdn.com/v1/square.js"
    : "https://web.squarecdn.com/v1/square.js";

const APP_ID = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
const LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

/** Loads the Web Payments SDK script once and attaches a card element to #card-container.
 * Card data never touches this app's server — only the resulting token does (see CardStep).
 */
export function useSquareCard(containerId: string) {
  const [card, setCard] = useState<SquareCard | null>(null);
  const [error, setError] = useState<string | null>(
    !APP_ID || !LOCATION_ID ? "Card payments are not configured yet." : null,
  );
  const attachedRef = useRef(false);

  useEffect(() => {
    if (!APP_ID || !LOCATION_ID) return;
    let cancelled = false;

    async function setup() {
      if (!window.Square) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = SDK_URL;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Square payments script"));
          document.head.appendChild(script);
        });
      }
      if (cancelled || !window.Square) return;

      const payments = window.Square.payments(APP_ID!, LOCATION_ID!);
      const cardInstance = await payments.card();
      if (cancelled) return;
      if (!attachedRef.current) {
        await cardInstance.attach(`#${containerId}`);
        attachedRef.current = true;
      }
      setCard(cardInstance);
    }

    setup().catch((err) => {
      console.error("Square payments setup failed", err);
      if (!cancelled) setError("Could not load the card form. Please refresh and try again.");
    });

    return () => {
      cancelled = true;
    };
  }, [containerId]);

  return { card, error };
}
