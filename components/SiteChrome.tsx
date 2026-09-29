import HeaderV4 from "./v4/HeaderV4";
import Footer from "./Footer";
import { V4ThemeProvider } from "./v4/V4ThemeContext";

/**
 * One header and footer for every page of akluxnails.com (owner request 2026-09-29): the
 * homepage's own V4 header/footer, reused on the blog, service pages, prices, terms and privacy
 * instead of the older classic Header. Both are wrapped in `.v4-theme` (the homepage palette and
 * fonts, see app/globals.css) so they look exactly like the homepage's, whatever theme the page
 * body uses, and in V4ThemeProvider so the header's Book Now opens the same themed booking modal.
 */
export function SiteHeader() {
  return (
    <div className="v4-theme" style={{ fontFamily: "var(--font-body)" }}>
      <V4ThemeProvider>
        <HeaderV4 variant="page" />
      </V4ThemeProvider>
      {/* The header is fixed; this keeps page content from sliding underneath it. */}
      <div className="h-20 sm:h-28" aria-hidden />
    </div>
  );
}

export function SiteFooter() {
  return (
    <div className="v4-theme mt-auto" style={{ fontFamily: "var(--font-body)" }}>
      <Footer />
    </div>
  );
}
