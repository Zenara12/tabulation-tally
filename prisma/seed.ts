/**
 * Prisma seed — creates the default admin account.
 *
 * Run after `npx prisma migrate dev`:
 *   npx tsx prisma/seed.ts
 *
 * Uses the same @adonisjs/hash Scrypt driver that nuxt-auth-utils
 * uses internally, so the stored hash is 100% compatible with
 * verifyPassword() in the login route.
 */
import 'dotenv/config'
import { Hash } from '@adonisjs/hash'
import { Scrypt } from '@adonisjs/hash/drivers/scrypt'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

// Must match nuxt-auth-utils defaults (these are the library defaults)
const scrypt = new Scrypt({
  cost: 16384,
  blockSize: 8,
  parallelization: 1,
  saltSize: 16,
  keyLength: 64,
  maxMemory: 32 * 1024 * 1024,
})
const hasher = new Hash(scrypt)

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@tabulation.local'
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234!'
  const name = process.env.SEED_ADMIN_NAME ?? 'System Admin'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`Admin already exists: ${email}`)
    console.log('To re-seed, delete the user first or set SEED_ADMIN_EMAIL to a new address.')
    return
  }

  const hashed = await hasher.make(password)

  await prisma.user.create({
    data: { name, email, password: hashed, role: 'ADMIN' },
  })

  console.log(`✓ Admin created: ${email}`)
  console.log(`  Password: ${password}`)
  console.log(`  Change this immediately after first login!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
