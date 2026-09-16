# ChronoTrack

Portfolio time-tracking demo: projects, start/stop timer, manual entries, dashboard totals, and CSV export.

**Stack:** Next.js App Router · TypeScript · Prisma · SQLite (dev) / Postgres (prod) · NextAuth Credentials · Demo-Login · Tailwind

> Spec: see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) (also at repo root).

## Demo credentials

| Field | Value |
|--------|--------|
| Email | `demo@chronotrack.dev` |
| Password | `ChronoTrack!Demo2026` |

Or click **Demo Login** on `/login` (requires `DEMO_LOGIN_ENABLED=true`).

The seed stores a **bcrypt hash only** — the plaintext password appears **only in this README**, not in seed/source code.

There is **no public registration** in the MVP.

## Setup (local)

```bash
cp .env.example .env
# edit NEXTAUTH_SECRET to a long random string

npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Sign in / Demo Login → Dashboard.

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm test` | Vitest unit tests |
| `npm run db:seed` | Seed demo user, projects, entries |
| `npx prisma migrate dev` | Apply migrations |

## Architecture summary

- **Auth:** NextAuth JWT session with Credentials provider for the seed user, plus a Demo provider gated by `DEMO_LOGIN_ENABLED`. Protected `(app)/*` routes redirect to `/login`.
- **Data:** Prisma models `User`, `Project` (`archived` soft-archive), `TimeEntry` (`endedAt = null` = running timer). Max one active timer per user (enforced in API).
- **Projects:** Soft-archive via `PATCH archived=true`. `DELETE` returns **409** when entries exist.
- **CSV:** UTF-8 (BOM), header row, ISO-8601 `startedAt`/`endedAt`, duration in whole **minutes**.
- **UI:** Dashboard (today/week sums + timer), Projects CRUD/archive, Entries list with filters + manual form + export.

## Tech decisions

| Choice | Why |
|--------|-----|
| Next.js App Router + TS | Portfolio-standard full-stack React with typed routes |
| Prisma + SQLite | Zero-ops local DB; swap `DATABASE_URL` to Postgres for prod |
| NextAuth Credentials | Simple demo auth without OAuth setup friction |
| Soft-archive projects | Preserve history; avoid orphaned time data |
| Vitest for `lib/time` + entry rules | Fast unit coverage of duration/timer invariants |

## Deploy (Vercel + Postgres)

1. Create a Postgres database (Neon, Supabase, Vercel Postgres, etc.).
2. Set env vars: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, optionally `DEMO_LOGIN_ENABLED=true`.
3. In `prisma/schema.prisma`, set `provider = "postgresql"` (or use a prod schema), then `npx prisma migrate deploy`.
4. Run seed once in a one-off job or locally against prod URL.
5. Deploy the Next.js app to Vercel.

## License

MIT — see [LICENSE](./LICENSE).
