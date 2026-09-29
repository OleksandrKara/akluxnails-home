// The gtag() global that app/layout.tsx's GA4 snippet defines (absent when GA isn't configured).
interface Window {
  gtag?: (...args: unknown[]) => void;
}
