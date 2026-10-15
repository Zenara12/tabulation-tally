# Vercel + Supabase Deployment

This project uses Nuxt/Nitro, `nuxt-auth-utils`, Prisma 7, PostgreSQL, and Zod.
Supabase is used as the PostgreSQL provider; Supabase Auth and the Supabase
JavaScript client are not required by this application.

## Deployment status

This branch includes the Vercel container deployment path:

- `Dockerfile.vercel` builds and starts the Nuxt/Nitro server on Vercel.
- Prisma Client is generated automatically during `npm ci`.
- Prisma CLI commands use `DIRECT_URL` when it is configured.
- Results are restricted to administrators, and judge event data requires an
  event assignment.
- The contestant migration copies legacy `photoUrl` values to
  `cosplayPictureUrl` before removing the old column.

## Recommended connection setup

Use two PostgreSQL connection strings:

- `DATABASE_URL`: Supabase transaction-pooler URL for Vercel runtime traffic.
- `DIRECT_URL`: Supabase direct/session URL for Prisma migrations and other
  Prisma CLI commands.

Vercel functions are serverless, so the pooled connection is preferred for
application traffic. Prisma migrations should use a direct database connection
instead of the transaction pooler.

## Required Vercel environment variables

Configure these for the Production environment in Vercel:

```env
DATABASE_URL="postgresql://...pooler...:6543/postgres?..."
DIRECT_URL="postgresql://...direct-or-session...:5432/postgres?..."
NUXT_SESSION_PASSWORD="a-random-secret-at-least-32-characters-long"
SEED_ADMIN_EMAIL="admin@example.com"
```

Do not commit real values. `NUXT_SESSION_PASSWORD` must remain stable between
deployments; changing it invalidates existing sessions.

`SEED_ADMIN_PASSWORD` and `SEED_ADMIN_NAME` are optional and are only needed
when running the seed script:

```env
SEED_ADMIN_PASSWORD="use-a-temporary-strong-password"
SEED_ADMIN_NAME="System Admin"
```

The database password in either URL must be URL-encoded when it contains
characters such as `@`, `:`, `/`, `?`, or `#`.

## Prisma configuration

`prisma.config.ts` uses `DIRECT_URL` for Prisma CLI commands and falls back to
`DATABASE_URL` for local development. The runtime Prisma client continues to
read the pooled `DATABASE_URL` from `server/utils/prisma.ts`.

`package.json` generates the ignored Prisma client during installation:

```json
"postinstall": "prisma generate && nuxt prepare"
```

## Local development setup

Create a local `.env` file from `.env.example` and provide a development
PostgreSQL URL:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tabulation_db?schema=public"
NUXT_SESSION_PASSWORD="a-local-secret-at-least-32-characters-long"
```

Install dependencies and generate Prisma Client:

```bash
npm install
npx prisma generate
```

When the Prisma schema changes during development, create and apply a
migration locally:

```bash
npx prisma migrate dev --name describe_the_change
npx prisma generate
```

Commit both the schema changes and the generated migration directory. Do not
commit `generated/` because it is intentionally regenerated during install.

## Apply the production database schema

Run this from a trusted machine or CI job with the production direct URL
available. Do not run `migrate dev` against production.

```bash
$env:DATABASE_URL = $env:DIRECT_URL
npx prisma migrate deploy
```

On macOS/Linux, the equivalent is:

```bash
DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy
```

If `prisma.config.ts` has been changed to read `DIRECT_URL`, simply run:

```bash
npx prisma migrate deploy
```

Verify the migration status before deploying the application:

```bash
npx prisma migrate status
```

## Create the first admin account

Run the seed once after the production migrations have completed:

```bash
npx tsx prisma/seed.ts
```

The seed script creates the configured admin account and does not overwrite an
existing account. Change the initial password immediately after the first
login.

Do not run the seed automatically on every Vercel request or server startup.

## Vercel deployment sequence

1. Create the Supabase project.
2. Copy the Supabase pooled runtime URL into `DATABASE_URL`.
3. Copy the Supabase direct/session URL into `DIRECT_URL`.
4. Set `NUXT_SESSION_PASSWORD` and the seed values in Vercel.
5. Apply migrations using `npx prisma migrate deploy` from CI or a trusted
   local machine.
6. Run `npx tsx prisma/seed.ts` once to create the first admin.
7. Import the repository into Vercel and deploy. Vercel detects the root
   `Dockerfile.vercel` automatically.
8. Verify login, event creation, judge assignment, scoring, results access, and
   logout in the production deployment.

The Docker Compose files remain for self-hosted PostgreSQL and are not used by
Vercel. Standard Nuxt deployment without Docker is also supported, but this
branch is configured for the Vercel container workflow.

## Smoke-test checklist

- `/api/health` returns a successful response.
- Admin can log in with the seeded account.
- A judge cannot access an unassigned event.
- A judge cannot read another judge's scores.
- Scores can be created and updated while an event is `OPEN`.
- Scores cannot be submitted after an event is `CLOSED`.
- Results and rankings use the expected criteria weights.
- Existing contestant images remain available after migrations.
- Logout invalidates the session cookie.

## Official references

- [Nuxt on Vercel](https://vercel.com/docs/frameworks/full-stack/nuxt)
- [Supabase Prisma setup](https://supabase.com/docs/guides/database/prisma)
- [Supabase serverless database connections](https://supabase.com/docs/guides/database/connecting-to-postgres/serverless-drivers)
- [Prisma deployment on Vercel](https://www.prisma.io/docs/guides/postgres/vercel)
- [Prisma and connection poolers](https://docs.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer)
