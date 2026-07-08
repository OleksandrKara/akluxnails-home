import { Pool } from "pg";

// Connects to the shared `marketing` Postgres schema owned/migrated by the salonLandings repo.
// This app only ever reads landing_pages/landing_variants and inserts into visits/events — it
// never runs migrations against that schema. One pool per process (Next.js keeps this module
// singleton across requests in both `next dev` and `next start`).
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
