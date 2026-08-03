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

  return prisma.criteria.update({ where: { id: criteriaId }, data })
})
