import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',

  // Prisma CLI commands must use a direct/session connection. Runtime queries
  // use DATABASE_URL through @prisma/adapter-pg in server/utils/prisma.ts.
  datasource: {
    // The empty fallback lets `prisma generate` run during dependency
    // installation without exposing a database secret at image build time.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },

  migrations: {
    path: 'prisma/migrations',
  },
})
