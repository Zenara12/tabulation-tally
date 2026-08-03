import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',

  // datasource.url is used by the Prisma CLI for migrate / studio.
  // The runtime client reads the connection string through @prisma/adapter-pg
  // in server/utils/prisma.ts — not from here.
  datasource: {
    url: env('DATABASE_URL'),
  },

  migrations: {
    path: 'prisma/migrations',
  },
})
