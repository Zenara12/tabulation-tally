import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'JUDGE']).default('JUDGE'),
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const data = await readValidatedBody(event, bodySchema.parse)

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'A user with that email already exists' })
  }

  const hashed = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashed,
      role: data.role,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return user
})
