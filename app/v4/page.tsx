import type { Metadata } from "next";
import HeroV4 from "@/components/v4/HeroV4";
import TrustBarV4 from "@/components/v4/TrustBarV4";
import ServicesPreviewV4 from "@/components/v4/ServicesPreviewV4";
import WhyChooseUsV4 from "@/components/v4/WhyChooseUsV4";
import ValuePropV4 from "@/components/v4/ValuePropV4";
import GalleryV4 from "@/components/v4/GalleryV4";
import ReviewsSection from "@/components/ReviewsSection";
import GuaranteeV4 from "@/components/v4/GuaranteeV4";
import ReferFriendV4 from "@/components/v4/ReferFriendV4";
import PostStoryV4 from "@/components/v4/PostStoryV4";
import PrepayV4 from "@/components/v4/PrepayV4";
import GiftCardV4 from "@/components/v4/GiftCardV4";
import LocationV4 from "@/components/v4/LocationV4";
import FinalCtaV4 from "@/components/v4/FinalCtaV4";
import Footer from "@/components/Footer";
import StickyBookBar from "@/components/StickyBookBar";
import HeaderV4 from "@/components/v4/HeaderV4";

// Alternative homepage (Homepage V4) — a premium, high-converting redesign inspired by the luxury
// beauty-brand aesthetic, kept entirely separate from the real homepage (app/page.tsx) so it can be
// reviewed/compared without affecting live traffic. Deliberately noindex'd and left out of
// sitemap.ts until it's chosen as the real homepage — see the plan's "SEO indexing" decision.
export const metadata: Metadata = {
  title: "Russian Manicure & Luxury Nail Salon in Downtown San Diego",
  description:
    "AK.LUX.NAILS is a luxury Russian manicure studio in Downtown San Diego — structured gel nails, builder gel, and precision cuticle work, nail health first. 15% off your first visit.",
  robots: { index: false, follow: false },
};

// Without this, Next.js prerenders the page once at build time (it has no headers()/cookies()
// call to force dynamic rendering the way "/" gets it) — baking in a stale Square catalog/pricing
// snapshot from build time instead of ServicesPreviewV4's live data on every request.
export const dynamic = "force-dynamic";

export default function HomePageV4() {
  return (
    <div className="flex min-h-screen flex-col pb-16 sm:pb-0">
      <HeaderV4 />
      <main>
        <HeroV4 />
        <TrustBarV4 />

        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-[var(--color-muted)]">
            AK.LUX.NAILS is a Russian Manicure salon in Downtown San Diego, specializing in
            structured gel nails and builder gel for clients who want their gel manicure to
            actually last. If you&rsquo;ve been searching for a Russian nail salon that treats
            nail health as seriously as the finished look, this is that luxury nail salon in San
            Diego.
          </p>
        </section>

        <ServicesPreviewV4 />
        <WhyChooseUsV4 />
        <ValuePropV4 />
        <GalleryV4 />

        <ReviewsSection />

        <GuaranteeV4 />
        <ReferFriendV4 />
        <PostStoryV4 />
        <PrepayV4 />
        <GiftCardV4 />
        <LocationV4 />
      </main>
      <FinalCtaV4 />
      <Footer />
      <StickyBookBar />
    </div>
  );
}
