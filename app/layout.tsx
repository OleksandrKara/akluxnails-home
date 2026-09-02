import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Jost, Fraunces, Manrope } from "next/font/google";
import BookingModalProvider from "@/components/booking/BookingModalProvider";
import { getLocalBusinessJsonLd } from "@/lib/siteData";
import { getClarityProjectId } from "@/lib/clarityConfig";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
  title: {
    default: "AK.LUX.NAILS — Nail Salon in Downtown San Diego",
    template: "%s | AK.LUX.NAILS",
  },
  description:
    "AK.LUX.NAILS is a nail-health-first salon in Downtown San Diego specializing in Russian manicures, gel, and nail art. Book your appointment today.",
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
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
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
          <Script id="clarity-init" strategy="afterInteractive">
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
