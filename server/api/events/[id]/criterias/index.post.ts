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

  const currentTotal = await prisma.criteria.aggregate({
    where: { eventId },
    _sum: { weight: true },
  })
  const totalWeight = currentTotal._sum.weight ?? 0

  if (totalWeight + data.weight > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: `Criteria weights cannot exceed 100%. Only ${Math.max(0, 100 - totalWeight)}% remains.`,
    })
  }

  return prisma.criteria.create({ data: { ...data, eventId } })
})
