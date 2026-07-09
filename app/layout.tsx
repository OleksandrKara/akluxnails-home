import type { Metadata } from "next";
import { Playfair_Display, Jost, Fraunces, Manrope } from "next/font/google";
import BookingModalProvider from "@/components/booking/BookingModalProvider";
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
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "AK.LUX.NAILS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jost.variable} ${fraunces.variable} ${manrope.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <BookingModalProvider>{children}</BookingModalProvider>
      </body>
    </html>
  );
}
