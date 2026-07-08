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
  };
}
