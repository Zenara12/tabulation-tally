import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED']).optional(),
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  const data = await readValidatedBody(event, bodySchema.parse)

  return prisma.event.update({ where: { id }, data })
})
