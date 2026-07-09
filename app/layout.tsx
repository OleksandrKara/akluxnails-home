import type { Metadata } from "next";
import { Playfair_Display, Jost, Space_Grotesk, DM_Sans } from "next/font/google";
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

// Homepage V4 only (see globals.css's .v4-theme scope) — matches svitnail.com's own typography
// (Space Grotesk display font, DM Sans body/UI font), which the owner asked to get closer to.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "500", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
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
      className={`${playfair.variable} ${jost.variable} ${spaceGrotesk.variable} ${dmSans.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <BookingModalProvider>{children}</BookingModalProvider>
      </body>
    </html>
  );
}
