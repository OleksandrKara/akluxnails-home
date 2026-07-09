import { headers } from "next/headers";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import TrustGrid from "@/components/TrustGrid";
import ReviewsSection from "@/components/ReviewsSection";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";
import StickyBookBar from "@/components/StickyBookBar";
import HomePageV4 from "@/components/v4/HomePageV4";
import { getVariantById } from "@/lib/variant";
import { recordPageView } from "@/lib/tracking";
import { accentPaletteToCssVars, deriveAccentPalette } from "@/lib/theme";
import type { CSSProperties } from "react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const h = await headers();
  const sp = await searchParams;
  const visitorId = h.get("x-visitor-id");
  const variantId = h.get("x-variant-id");

  const variant = variantId ? await getVariantById(variantId) : null;
  const content = variant?.content ?? {};

  if (visitorId && variant) {
    const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
    await recordPageView({
      visitorId,
      landingPageId: variant.landingPageId,
      variantId: variant.variantId,
      landingPath: "/",
      referrer: h.get("referer"),
      utm: {
        utmSource: first(sp.utm_source),
        utmMedium: first(sp.utm_medium),
        utmCampaign: first(sp.utm_campaign),
        utmTerm: first(sp.utm_term),
        utmContent: first(sp.utm_content),
        fbclid: first(sp.fbclid),
        gclid: first(sp.gclid),
      },
    });
  }

  // A variant can point at an entirely different page template instead of a content override —
  // Homepage V4 is a real, weighted variant of "/" this way, so it gets the same page-view
  // tracking above and shows up in the owner dashboard's variant list automatically.
  if (variant?.key === "homepage-v4") {
    return <HomePageV4 />;
  }

  const themeStyle: CSSProperties = content.accentColor
    ? (accentPaletteToCssVars(deriveAccentPalette(content.accentColor)) as CSSProperties)
    : {};

  return (
    <div style={themeStyle} className="flex min-h-screen flex-col pb-16 sm:pb-0">
      <Header />
      <main>
        <Hero variant={content} />
        <Services />
        <TrustGrid />
        <ReviewsSection />
        <LocationSection />
      </main>
      <Footer />
      <StickyBookBar />
    </div>
  );
}
