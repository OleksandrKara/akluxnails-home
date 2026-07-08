import type { MetadataRoute } from "next";

// Production-oriented policy (allow everything, point at the sitemap). The preview subdomain gets
// an additional `X-Robots-Tag: noindex` header at the nginx layer (see deploy docs) — more
// reliable than trying to branch this file on Host, since Next.js's robots.ts convention doesn't
// receive the request.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://akluxnails.com/sitemap.xml",
  };
}
