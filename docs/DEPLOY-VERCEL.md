# ChronoTrack — DB & Vercel build path

## Decision

| Environment | Engine | Schema | Build |
|-------------|--------|--------|-------|
| **Local / default** | SQLite | `prisma/schema.prisma` | `npm run build` → `prisma generate && next build` |
| **Vercel / production** | PostgreSQL | `prisma/postgresql/schema.prisma` | `npm run build:vercel` (migrate deploy + next build) |

SQLite stays the zero-ops local default. Postgres is **only** for production (Vercel filesystem is ephemeral).

## Local (FE / SE)

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
# or: npx next build   /   npm run build
```

No local Postgres required. `npm run build` does **not** run `migrate deploy`.

## Vercel env (UI only — never commit values)

| Name | Purpose |
|------|---------|
| `DATABASE_URL` | Postgres connection string (`postgresql://…`, TLS/`sslmode=require` as needed) |
| `NEXTAUTH_URL` | Public URL (`https://…`) |
| `NEXTAUTH_SECRET` | Long random secret |
| `DEMO_LOGIN_ENABLED` | `true` for demo login button |

## Vercel project settings

- **Build Command:** `npm run build:vercel`
- **Install Command:** `npm install` (postinstall generates client from default sqlite schema — override if needed: `prisma generate --schema=prisma/postgresql/schema.prisma`)

Recommended install+build on Vercel:

```
prisma generate --schema=prisma/postgresql/schema.prisma && prisma migrate deploy --schema=prisma/postgresql/schema.prisma && next build
```

(`package.json` → `build:vercel`)

Migrations for Postgres live under `prisma/postgresql/migrations/` (lock: postgresql).

## One-time prod seed

```bash
DATABASE_URL="postgresql://…" npm run db:seed
```

Idempotent upsert of demo user; sample data only if that user has no projects. Do not set `SEED_RESET` on routine prod seed.

## Note

Default `prisma generate` (postinstall) uses SQLite schema for local. On Vercel always generate with `--schema=prisma/postgresql/schema.prisma` before build.
