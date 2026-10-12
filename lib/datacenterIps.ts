/** Amazon EC2 IPv4 ranges, from AWS's own published list, so analytics can drop page views that
 * come from cloud servers rather than people (2026-10-12). Evidence: three EC2 hosts in us-east-2
 * sent ~2,300 homepage "visits" in two weeks (Chrome/113 UA, a new visitor cookie every time, only
 * "/", zero booking-funnel events), more than all real visitors together. A real client almost
 * never browses from an EC2 instance.
 *
 * Fetched lazily and cached for a day; if AWS can't be reached we simply don't filter (never
 * break page tracking over this).
 */
const SOURCE = "https://ip-ranges.amazonaws.com/ip-ranges.json";
const TTL_MS = 24 * 60 * 60 * 1000;

let ranges: [number, number][] | null = null;
let loadedAt = 0;
let loading: Promise<void> | null = null;

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = Number(p);
    if (!Number.isInteger(v) || v < 0 || v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

async function load(): Promise<void> {
  const res = await fetch(SOURCE, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`AWS ip-ranges ${res.status}`);
  const data = (await res.json()) as { prefixes: { ip_prefix: string; service: string }[] };
  const list: [number, number][] = [];
  for (const p of data.prefixes) {
    if (p.service !== "EC2") continue;
    const [base, bits] = p.ip_prefix.split("/");
    const start = ipv4ToInt(base);
    if (start === null) continue;
    const size = 2 ** (32 - Number(bits));
    list.push([start, start + size - 1]);
  }
  list.sort((a, b) => a[0] - b[0]);
  ranges = list;
  loadedAt = Date.now();
}

/** True if `ip` is inside an AWS EC2 range. Never throws; false while the list isn't loaded yet. */
export async function isEc2Ip(ip: string | null): Promise<boolean> {
  if (!ip) return false;
  if (!ranges || Date.now() - loadedAt > TTL_MS) {
    loading ??= load().catch((err) => console.error("Failed to load AWS ip ranges", err)).finally(() => {
      loading = null;
    });
    await loading;
  }
  const n = ipv4ToInt(ip);
  if (n === null || !ranges) return false;
  let lo = 0;
  let hi = ranges.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const [s, e] = ranges[mid];
    if (n < s) hi = mid - 1;
    else if (n > e) lo = mid + 1;
    else return true;
  }
  return false;
}
