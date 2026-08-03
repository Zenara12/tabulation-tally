import { z } from 'zod'

const bodySchema = z.object({
  number: z.number().int().positive(),
  name: z.string().min(1),
  photoUrl: z.string().url().optional().or(z.literal('')),
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const eventId = getRouterParam(event, 'id')!
  const data = await readValidatedBody(event, bodySchema.parse)

  const existing = await prisma.contestant.findUnique({
    where: { eventId_number: { eventId, number: data.number } },
  })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: `Contestant number ${data.number} is already taken` })
  }

  return prisma.contestant.create({
    data: { ...data, photoUrl: data.photoUrl || null, eventId },
  })
})
