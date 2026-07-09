import HeroV4 from "./HeroV4";
import TrustBarV4 from "./TrustBarV4";
import ServicesPreviewV4 from "./ServicesPreviewV4";
import WhyChooseUsV4 from "./WhyChooseUsV4";
import ValuePropV4 from "./ValuePropV4";
import GalleryV4 from "./GalleryV4";
import ReviewsSection from "../ReviewsSection";
import GuaranteeV4 from "./GuaranteeV4";
import ReferFriendV4 from "./ReferFriendV4";
import PostStoryV4 from "./PostStoryV4";
import PrepayV4 from "./PrepayV4";
import GiftCardV4 from "./GiftCardV4";
import LocationV4 from "./LocationV4";
import FinalCtaV4 from "./FinalCtaV4";
import Footer from "../Footer";
import StickyBookBar from "../StickyBookBar";
import HeaderV4 from "./HeaderV4";

/** The full Homepage V4 template — rendered by app/page.tsx when the resolved variant's key is
 * "homepage-v4" (a real, weighted variant in the live rotation), and by the /v4 redirect target
 * for anyone hitting the old direct link. */
export default function HomePageV4() {
  return (
    <div className="v4-theme flex min-h-screen flex-col bg-[var(--color-bg-from)] pb-16 sm:pb-0" style={{ fontFamily: "var(--font-body)" }}>
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
