import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import CardOnFileForm from "@/components/CardOnFileForm";

// A link staff send to clients who booked by phone or Instagram, not something to find in search.
export const metadata: Metadata = {
  title: "Secure your appointment",
  description: "Add a card on file for our cancellation policy. Nothing is charged today.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/card" },
};

export default function CardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="v4-theme flex-1 bg-[var(--color-bg-from)] px-4 py-10 sm:px-6 sm:py-16" style={{ fontFamily: "var(--font-body)" }}>
        <CardOnFileForm />
      </main>
      <SiteFooter />
    </div>
  );
}
