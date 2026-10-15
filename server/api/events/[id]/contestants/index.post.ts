import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1),
  alias: z.string().optional(),
  characterName: z.string().optional(),
  // Accepts a base64 data-URL (image/*;base64,...) or an https URL or empty
  cosplayPictureUrl: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const eventId = getRouterParam(event, 'id')!
  const data = await readValidatedBody(event, bodySchema.parse)

  // Auto-increment: find the current max number for this event and add 1
  const last = await prisma.contestant.findFirst({
    where: { eventId },
    orderBy: { number: 'desc' },
    select: { number: true },
  })
  const number = (last?.number ?? 0) + 1

  return prisma.contestant.create({
    data: {
      eventId,
      number,
      name: data.name,
      alias: data.alias || null,
      characterName: data.characterName || null,
      cosplayPictureUrl: data.cosplayPictureUrl || null,
    },
  })
})
