import { z } from 'zod'

const bodySchema = z.object({ judgeId: z.string().min(1) })

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const eventId = getRouterParam(event, 'id')!
  const { judgeId } = await readValidatedBody(event, bodySchema.parse)

  const judge = await prisma.user.findUnique({ where: { id: judgeId } })
  if (!judge || judge.role !== 'JUDGE') {
    throw createError({ statusCode: 400, statusMessage: 'User is not a judge' })
  }

  return prisma.eventJudge.upsert({
    where: { eventId_judgeId: { eventId, judgeId } },
    create: { eventId, judgeId },
    update: {},
    include: { judge: { select: { id: true, name: true, email: true } } },
  })
})
