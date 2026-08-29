import { Pool } from "pg";

// Connects to the shared `marketing` Postgres schema owned/migrated by the salonLandings repo.
// This app only ever reads landing_pages/landing_variants and inserts into visits/events — it
// never runs migrations against that schema. One pool per process (Next.js keeps this module
// singleton across requests in both `next dev` and `next start`).

// salonLandings' 2026-08-18 multi-tenant migration (#65, "Add business_id to every marketing.*
// table") made business_id NOT NULL on every table this app writes to, backfilling existing rows
// to 1 (AK.LUX.NAILS) — but never updated this app's own inserts to supply it, since it's a
// separate repo/deploy. This app only ever serves one business, so a fixed constant (matching
// that same backfill default) is correct here, unlike salonLandings' own per-request domain
// resolution for its multi-tenant mani/PMU landing pages.
export const MARKETING_BUSINESS_ID = 1;
declare global {
  var __marketingPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!global.__marketingPool) {
    global.__marketingPool = new Pool({
      host: process.env.MARKETING_DB_HOST,
      port: Number(process.env.MARKETING_DB_PORT ?? 5432),
      database: process.env.MARKETING_DB_NAME,
      user: process.env.MARKETING_DB_USER,
      password: process.env.MARKETING_DB_PASSWORD,
      max: 5,
    });
  }
  return global.__marketingPool;
}
