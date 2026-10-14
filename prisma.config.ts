import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Use the direct/session connection for Prisma CLI operations in hosted
// environments. Local development can continue to use DATABASE_URL alone.
const migrationDatabaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!migrationDatabaseUrl) {
  throw new Error('DIRECT_URL or DATABASE_URL must be set for Prisma CLI operations')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',

  // datasource.url is used by the Prisma CLI for migrate / studio.
  // The runtime client reads the connection string through @prisma/adapter-pg
  // in server/utils/prisma.ts — not from here.
  datasource: {
    url: migrationDatabaseUrl,
  },

  migrations: {
    path: 'prisma/migrations',
  },
})
