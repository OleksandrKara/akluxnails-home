import { UAParser } from "ua-parser-js";
import { headers } from "next/headers";
import { isEc2Ip } from "./datacenterIps";

export interface ClientContext {
  userAgent: string | null;
  deviceType: string;
  osName: string | null;
  osVersion: string | null;
  browserName: string | null;
  browserVersion: string | null;
  ipAddress: string | null;
  host: string | null;
}

/** Device/OS/browser/IP derived from the raw request headers — mirrors salonLandings'
 * request_context.py (Python's `user_agents` there, ua-parser-js here), same reasoning: more
 * reliable than trusting anything the client claims about itself.
 */
export async function deriveClientContext(): Promise<ClientContext> {
  const h = await headers();
  const uaString = h.get("user-agent") ?? "";
  const ua = new UAParser(uaString).getResult();

  const deviceType = ua.device.type === "mobile" ? "mobile"
    : ua.device.type === "tablet" ? "tablet"
    : ua.device.type === undefined ? "desktop"
    : "unknown";

  // Cloudflare's CF-Connecting-IP is the real client address. The first X-Forwarded-For entry can
  // be anything the client sent (a reserved 241.x address showed up in visits, 2026-10-12), so it's
  // only the fallback for requests that didn't come through Cloudflare.
  const forwardedFor = h.get("x-forwarded-for");
  const ipAddress = h.get("cf-connecting-ip")?.trim() || (forwardedFor ? forwardedFor.split(",")[0].trim() : null);

  return {
    userAgent: uaString || null,
    deviceType,
    osName: ua.os.name ?? null,
    osVersion: ua.os.version ?? null,
    browserName: ua.browser.name ?? null,
    browserVersion: ua.browser.version ?? null,
    ipAddress,
    host: h.get("host"),
  };
}

// Matches the exact tool/scraper signatures actually seen hammering this site — deliberately NOT
// a generic /bot|crawler|spider/ match, since that would also catch Googlebot, Bingbot, etc., and
// the production domain is meant to stay indexable by those (see nginx/akluxnails-home.conf).
// Mirrors salonLandings' request_context.py _BOT_USER_AGENT_PATTERN — keep the two in sync.
// 2026-10-12: added the self-declared scanners/fetchers found in marketing.visits over 7 days
// (Software Security Research, ChatGPT-User, Palo Alto Networks, Censys, zgrab, Facebook's link
// preview fetcher) and the bare "Mozilla/5.0" / "Mozilla/5.0 (compatible)" strings no browser sends.
const BOT_USER_AGENT_PATTERN =
  /^wget|^curl\/|headlesschrome|python-requests|go-http-client|flowiqlabsbot|software security research|chatgpt-user|paloaltonetworks|palo alto networks|censysinspect|zgrab|facebookexternalhit|^mozilla\/5\.0( \(compatible\))?$/i;

/** True for traffic that should never count as a real page view/visitor: Docker's own healthcheck
 * (`wget http://127.0.0.1:3000/` on a 30s timer, from inside each container — see Dockerfile) hits
 * the app directly, bypassing nginx, so its Host header is literally the loopback address/port
 * rather than the real domain nginx always forwards (`proxy_set_header Host $host`) — a precise
 * structural signal, not a heuristic. Also flags known scraper/tool user-agents as a second,
 * independent check for bot traffic that *does* come through nginx.
 */
export function isAutomatedRequest(ctx: ClientContext): boolean {
  if (ctx.host && /^(127\.0\.0\.1|localhost)(:\d+)?$/i.test(ctx.host)) return true;
  if (ctx.userAgent && BOT_USER_AGENT_PATTERN.test(ctx.userAgent)) return true;
  return false;
}

/** For analytics only (visits, page views, funnel events): isAutomatedRequest plus requests from
 * AWS EC2 servers (see lib/datacenterIps.ts). Not used for booking/contact records, where a real
 * client on a cloud-hosted VPN must never be dropped. */
export async function isTrackingNoise(ctx: ClientContext): Promise<boolean> {
  if (isAutomatedRequest(ctx)) return true;
  return isEc2Ip(ctx.ipAddress);
}
