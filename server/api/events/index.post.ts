import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const data = await readValidatedBody(event, bodySchema.parse)

  return prisma.event.create({ data })
})
