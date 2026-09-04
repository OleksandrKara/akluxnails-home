import { headers } from "next/headers";
import { after } from "next/server";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import TrustGrid from "@/components/TrustGrid";
import ReviewsSection from "@/components/ReviewsSection";
import LocationSection from "@/components/LocationSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import StickyBookBar from "@/components/StickyBookBar";
import HomePageV4 from "@/components/v4/HomePageV4";
import RebookingPromoBanner from "@/components/RebookingPromoBanner";
import RebookingPromoModal from "@/components/RebookingPromoModal";
import { getVariantById } from "@/lib/variant";
import { recordPageView } from "@/lib/tracking";
import { accentPaletteToCssVars, deriveAccentPalette } from "@/lib/theme";
import { verifyRebookingPromoSignature } from "@/lib/rebookingPromo";
import type { CSSProperties } from "react";

// Every variant key that renders the V4 template (components/v4/HomePageV4.tsx) rather than the
// classic Header/Hero/Services/... tree — a Set so adding another V4-template variant later (a
// new headline test, say "homepage-v6") is a one-line change here, not a new branch.
const V4_TEMPLATE_KEYS = new Set(["homepage-v4", "homepage-v5"]);

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

  // Verified server-side, directly — this component already runs on the server, so no round-trip
  // through /api/rebooking-promo/verify is needed here (that route exists for
  // BookingModalProvider, a client component above any page's own searchParams — see
  // openspec/changes/same-day-rebooking-discount design.md D6/D8). A tampered/missing/expired-
  // looking signature is treated as "no promo" — no banner, exactly like a normal visit.
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const promoCode = first(sp.promo);
  const promoExpRaw = first(sp.exp);
  const promoSignature = first(sp.sig);
  const promoExpEpochSeconds = promoExpRaw ? Number(promoExpRaw) : NaN;
  const promoVerified =
    Boolean(promoCode) &&
    Number.isFinite(promoExpEpochSeconds) &&
    verifyRebookingPromoSignature(promoCode!, promoExpEpochSeconds, promoSignature ?? null);

  // Fired via after() rather than awaited: this write's result feeds nothing in the render below,
  // but two sequential DB round-trips (see recordPageView) were sitting directly in front of TTFB
  // on every single homepage visit — a real, measurable contributor to the mobile LCP regression
  // flagged by the SEO dashboard (2026-09-02, 3.3s vs Google's 2.5s 'good' bar). after() runs this
  // once the response has already been sent, so tracking no longer delays the hero paint. All
  // request-time values it needs (visitorId, variant, referrer, utm) are read above during render,
  // not inside the callback — Server Components can't call headers()/searchParams() from within
  // after() itself (see next/server docs), so everything is captured by closure instead.
  if (visitorId && variant) {
    const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
    const referrer = h.get("referer");
    const utm = {
      utmSource: first(sp.utm_source),
      utmMedium: first(sp.utm_medium),
      utmCampaign: first(sp.utm_campaign),
      utmTerm: first(sp.utm_term),
      utmContent: first(sp.utm_content),
      fbclid: first(sp.fbclid),
      gclid: first(sp.gclid),
    };
    after(() => {
      recordPageView({
        visitorId,
        landingPageId: variant.landingPageId,
        variantId: variant.variantId,
        landingPath: "/",
        referrer,
        utm,
      });
    });
  }

  // A variant can point at an entirely different page template instead of a content override —
  // Homepage V4 (and any later variant reusing that same template with different copy, e.g.
  // "homepage-v5") is a real, weighted variant of "/" this way, so it gets the same page-view
  // tracking above and shows up in the owner dashboard's variant list automatically.
  if (variant?.key && V4_TEMPLATE_KEYS.has(variant.key)) {
    return (
      <HomePageV4
        content={content}
        promoVerified={promoVerified}
        promoExpEpochSeconds={promoExpEpochSeconds}
        promoCode={promoCode}
      />
    );
  }

  const themeStyle: CSSProperties = content.accentColor
    ? (accentPaletteToCssVars(deriveAccentPalette(content.accentColor)) as CSSProperties)
    : {};

  return (
    <div style={themeStyle} className="flex min-h-screen flex-col pb-16 sm:pb-0">
      {promoVerified && <RebookingPromoBanner expEpochSeconds={promoExpEpochSeconds} code={promoCode!} />}
      {promoVerified && <RebookingPromoModal expEpochSeconds={promoExpEpochSeconds} code={promoCode!} />}
      <Header />
      <main>
        <Hero variant={content} />
        <Services />
        <TrustGrid />
        <ReviewsSection />
        <LocationSection />
        <FAQSection />
      </main>
      <Footer />
      <StickyBookBar />
    </div>
  );
}
