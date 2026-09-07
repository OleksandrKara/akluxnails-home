import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Jost, Fraunces, Manrope } from "next/font/google";
import BookingModalProvider from "@/components/booking/BookingModalProvider";
import { getLocalBusinessJsonLd } from "@/lib/siteData";
import { getClarityProjectId } from "@/lib/clarityConfig";
import "./globals.css";

// preload: false on both — found live 2026-09-07 diagnosing a mobile LCP regression: these two
// are the :root (non-V4) heading/body fonts, actually rendered only on /blog, /terms and
// /privacy-policy (globals.css's .v4-theme scope overrides --font-heading/--font-body to
// Fraunces/Manrope for the homepage). Declaring a font in the ROOT layout preloads it on every
// route regardless of whether that route renders it (see next/font's own docs), so the homepage
// was eagerly downloading 2 completely unused font families in its critical path, alongside the 2
// it actually needs. preload:false stops the eager <link rel=preload>; blog/terms/privacy still
// fetch and apply these normally the moment their CSS references the variable — only the
// homepage's unused early fetch goes away.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  preload: false,
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  preload: false,
});

// Homepage V4 only (see globals.css's .v4-theme scope). Started as a close match to
// svitnail.com's own fonts (Space Grotesk/DM Sans), but swapped for a pairing that reads more
// "luxury beauty" and gives the hero's italicized emphasis word a real italic face instead of a
// synthetic slant: Fraunces (a warm, soft-contrast display serif with genuine italics, common in
// modern boutique/beauty branding) for headings, Manrope for body/UI text.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const SITE_URL = "https://akluxnails.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Rewritten 2026-09-07 — owner's own real Search Console data showed page-1 rankings (pos. 3-4)
  // for "nail salon near me"/"nail salon san diego"/"nail salons near me" pulling only 2.6-3.8%
  // CTR, well under the typical 8-15% for that position — the old title/description were generic
  // enough to blend into any competitor's snippet. These borrow the homepage's own strongest,
  // already-proven claims (the hero's "3+ weeks, not 3 days" + the 14-day guarantee) instead.
  title: {
    default: "AK.LUX.NAILS | Manicures That Last 3+ Weeks, San Diego",
    template: "%s | AK.LUX.NAILS",
  },
  description:
    "Russian manicure and non-toxic gel that lasts 3-4 weeks, not 3 days. Backed by our 14-day guarantee. Downtown San Diego nail salon. Book today.",
  // Applies to "/" only — every other route (blog index, each post, terms, privacy) sets its
  // own `alternates.canonical` in its own metadata export, since a route that doesn't override
  // this would otherwise silently inherit "/" as ITS canonical too (Next.js metadata is
  // inherited as-is, not re-resolved per path).
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "AK.LUX.NAILS",
  },
  // Only emits the `google-site-verification` meta tag once a real token is configured — an
  // empty/placeholder token would just be invalid markup, so this stays absent until set.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

const localBusinessJsonLd = getLocalBusinessJsonLd(SITE_URL);
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clarityProjectId = await getClarityProjectId("akluxnails.com");
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jost.variable} ${fraunces.variable} ${manrope.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        {/* NailSalon structured data — real, visible facts only (name/address/phone/hours are
            all rendered on the page; sameAs is the business's real public Instagram). No
            review/aggregateRating markup — see getLocalBusinessJsonLd's own comment for why. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        {gaMeasurementId && (
          <>
            {/* lazyOnload, not afterInteractive — found live 2026-09-07: PageSpeed's mobile LCP
                lab run showed the LCP element (the hero H1 text, no image involved) held up by
                ~1.5s of "element render delay", correlating with GTM/Clarity consuming real
                main-thread time early in the page lifecycle (158ms/71ms respectively, amplified
                by Lighthouse's mobile CPU throttling). Neither script needs to load before the
                page is idle — analytics firing a few hundred ms later than "as soon as possible"
                has no user-facing effect, unlike the hero text painting late. */}
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="lazyOnload"
            />
            <Script id="ga4-init" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `}
            </Script>
          </>
        )}
        {clarityProjectId && (
          <Script id="clarity-init" strategy="lazyOnload">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityProjectId}");
            `}
          </Script>
        )}
        <BookingModalProvider>{children}</BookingModalProvider>
      </body>
    </html>
  );
}
