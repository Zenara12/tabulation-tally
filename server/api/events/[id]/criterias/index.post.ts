import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1),
  weight: z.number().min(0).max(100),
  order: z.number().int().default(0),
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const eventId = getRouterParam(event, 'id')!
  const data = await readValidatedBody(event, bodySchema.parse)

  return prisma.criteria.create({ data: { ...data, eventId } })
})
