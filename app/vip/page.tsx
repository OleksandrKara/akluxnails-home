import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import VipCheck from "@/components/VipCheck";

// Reached only from the printed card handed out after a visit, so it stays out of search results
// and the sitemap: it's a perk for clients who were just here, not a public offer.
export const metadata: Metadata = {
  title: "VIP perk",
  description: "Book your next visit today and get $10 off.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/vip" },
};

export default function VipPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="v4-theme flex-1 bg-[var(--color-bg-from)] px-4 py-10 sm:px-6 sm:py-16" style={{ fontFamily: "var(--font-body)" }}>
        <VipCheck />
      </main>
      <SiteFooter />
    </div>
  );
}
