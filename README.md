# akluxnails-home

Public homepage for [akluxnails.com](https://akluxnails.com) — AK.LUX.NAILS, a nail salon in
Downtown San Diego. Replaces the previous Squarespace site. Aimed at organic traffic (Google
search, AI chat answers, Google Business Profile), unlike the paid-ads funnel at
mani.akluxnails.com (a separate repo, `salonLandings`).

Deliberately a separate app/deploy from that funnel: its own containers, port, nginx config, and
CI/CD pipeline, so a change here (a blog post, a copy edit) can never affect the live ads funnel.

- Next.js (App Router), design tokens ported from salonLandings for visual consistency
- A/B variants resolved server-side in `proxy.ts` (cookie-based, no client-side localStorage)
- Blog: file-based MDX posts under `content/blog/`
- "Book Now" links out to mani.akluxnails.com's existing booking flow

## Local development

```bash
npm install
cp .env.example .env   # fill in MARKETING_DB_PASSWORD
npm run dev
```

## Deploy

`docker compose up -d --build`, same as the other two repos on this VPS — see `.github/workflows/deploy.yml`
for the automated version (push to `main`).
