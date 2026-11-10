import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  weight: z.number().min(0).max(100).optional(),
  order: z.number().int().optional(),
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const criteriaId = getRouterParam(event, 'criteriaId')!
  const data = await readValidatedBody(event, bodySchema.parse)

  const currentCriteria = await prisma.criteria.findUnique({
    where: { id: criteriaId },
    select: { eventId: true },
  })

  if (!currentCriteria) {
    throw createError({ statusCode: 404, statusMessage: 'Criteria not found' })
  }

  if (data.weight !== undefined) {
    const otherCriteria = await prisma.criteria.aggregate({
      where: {
        eventId: currentCriteria.eventId,
        id: { not: criteriaId },
      },
      _sum: { weight: true },
    })
    const otherWeight = otherCriteria._sum.weight ?? 0

    if (otherWeight + data.weight > 100) {
      throw createError({
        statusCode: 400,
        statusMessage: `Criteria weights cannot exceed 100%. Only ${Math.max(0, 100 - otherWeight)}% is available for this criteria.`,
      })
    }
  }

  return prisma.criteria.update({ where: { id: criteriaId }, data })
})
