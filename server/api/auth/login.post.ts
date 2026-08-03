import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse)

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

  if (!user || !(await verifyPassword(user.password, password))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })

  return { id: user.id, name: user.name, email: user.email, role: user.role }
})
