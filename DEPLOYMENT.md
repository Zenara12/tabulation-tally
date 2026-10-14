# Vercel + Supabase Deployment

This project uses Nuxt/Nitro, `nuxt-auth-utils`, Prisma 7, PostgreSQL, and Zod.
Supabase is used as the PostgreSQL provider; Supabase Auth and the Supabase
JavaScript client are not required by this application.

## Deployment status

The repository is prepared for a first Vercel + Supabase deployment:

- Prisma Client is generated automatically by `postinstall`, including on a
  clean Vercel checkout.
- The results report is restricted to administrators. Judges can only submit
  and read their own scores for events to which they are assigned.
- The contestant migration renames `photoUrl` to `cosplayPictureUrl`, which
  preserves existing image values.

If the old contestant migration has already been applied to a shared database,
do not edit migration history. Restore the old image values from a database
backup first, then create a forward migration. The migration in this branch is
safe for a first deployment because it has not been applied to production.

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

`prisma.config.ts` uses `DIRECT_URL` when it is available and falls back to
`DATABASE_URL` for local development. The runtime Prisma client always reads
`DATABASE_URL` from `server/utils/prisma.ts`.

The `postinstall` script runs `prisma generate && nuxt prepare`, so no custom
Vercel build command or `vercel.json` file is required.

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

1. Create the Supabase project and copy both connection strings.
2. Import this repository into Vercel; keep the framework preset as Nuxt.js.
3. Add `DATABASE_URL`, `DIRECT_URL`, and `NUXT_SESSION_PASSWORD` to the
   Vercel Production environment. Add the seed variables only if you will run
   the seed from a trusted machine.
4. Apply migrations using `npx prisma migrate deploy` from CI or a trusted
   local machine.
5. Run `npx tsx prisma/seed.ts` once to create the first admin.
6. Deploy from Vercel.
7. Verify login, event creation, judge assignment, scoring, results access, and
   logout in the production deployment.

Vercel detects Nuxt automatically; a custom Docker deployment is not required.
The Docker Compose files in this repository are for self-hosted PostgreSQL and
are not used by Vercel.

## One-time setup required from you

Yes. The repository cannot create your cloud accounts or secrets for you. Do
these steps once:

1. In Supabase, create a project, wait for the database to become ready, and
   copy the **Transaction pooler** connection string for `DATABASE_URL` and the
   **Direct connection** (or session-mode connection) for `DIRECT_URL`.
2. Generate a stable random value of at least 32 characters for
   `NUXT_SESSION_PASSWORD`. Keep it unchanged across deploys.
3. In Vercel, import the repository and add the environment variables listed
   above under **Settings → Environment Variables → Production**.
4. From a trusted machine, temporarily set `DIRECT_URL` as the database URL,
   run `npx prisma migrate deploy`, then run `npx tsx prisma/seed.ts` with a
   strong `SEED_ADMIN_PASSWORD`.
5. Deploy and change the seeded admin password immediately after the first
   login.

Supabase Auth, a Supabase anon key, and a Supabase project URL are not required
for this application. Authentication is handled by `nuxt-auth-utils` using the
server-side session secret.

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
