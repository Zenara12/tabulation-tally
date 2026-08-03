import { z } from 'zod'

const bodySchema = z.object({
  number: z.number().int().positive().optional(),
  name: z.string().min(1).optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const contestantId = getRouterParam(event, 'contestantId')!
  const data = await readValidatedBody(event, bodySchema.parse)

  return prisma.contestant.update({
    where: { id: contestantId },
    data: { ...data, photoUrl: data.photoUrl === '' ? null : data.photoUrl },
  })
})
