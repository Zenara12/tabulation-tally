import { z } from 'zod'

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  alias: z.string().optional(),
  characterName: z.string().optional(),
  cosplayPictureUrl: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const contestantId = getRouterParam(event, 'contestantId')!
  const data = await readValidatedBody(event, bodySchema.parse)

  const updateData: Record<string, string | null | undefined> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.alias !== undefined) updateData.alias = data.alias === '' ? null : data.alias
  if (data.characterName !== undefined) updateData.characterName = data.characterName === '' ? null : data.characterName
  if (data.cosplayPictureUrl !== undefined) {
    updateData.cosplayPictureUrl = data.cosplayPictureUrl === '' ? null : data.cosplayPictureUrl
  }

  return prisma.contestant.update({
    where: { id: contestantId },
    data: updateData,
  })
})
