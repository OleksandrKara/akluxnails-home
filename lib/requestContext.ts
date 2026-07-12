import { UAParser } from "ua-parser-js";
import { headers } from "next/headers";

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

  const forwardedFor = h.get("x-forwarded-for");
  const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

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
const BOT_USER_AGENT_PATTERN = /^wget|^curl\/|headlesschrome|python-requests|go-http-client|flowiqlabsbot/i;

/** True for traffic that should never count as a real page view/visitor: Docker's own healthcheck
 * (`wget http://127.0.0.1:3000/` on a 30s timer, from inside each container — see Dockerfile) hits
 * the app directly, bypassing nginx, so its Host header is literally the loopback address/port
 * rather than the real domain nginx always forwards (`proxy_set_header Host $host`) — a precise
 * structural signal, not a heuristic. Also flags known scraper/tool user-agents as a second,
 * independent check for bot traffic that *does* come through nginx.
 */
export function isTrackingNoise(ctx: ClientContext): boolean {
  if (ctx.host && /^(127\.0\.0\.1|localhost)(:\d+)?$/i.test(ctx.host)) return true;
  if (ctx.userAgent && BOT_USER_AGENT_PATTERN.test(ctx.userAgent)) return true;
  return false;
}
