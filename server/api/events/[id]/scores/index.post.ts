import { z } from 'zod'

const bodySchema = z.object({
  contestantId: z.string().min(1),
  criteriaId: z.string().min(1),
  score: z.number().min(0).max(100),
})

export default defineEventHandler(async (event) => {
  const judge = await requireRole(event, ['JUDGE'])
  const eventId = getRouterParam(event, 'id')!
  const { contestantId, criteriaId, score } = await readValidatedBody(event, bodySchema.parse)

  const evt = await prisma.event.findUnique({ where: { id: eventId } })
  if (!evt) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  if (evt.status !== 'OPEN') {
    throw createError({ statusCode: 400, statusMessage: 'Scoring is only allowed while the event is open' })
  }

  const assignment = await prisma.eventJudge.findUnique({
    where: { eventId_judgeId: { eventId, judgeId: judge.id } },
  })
  if (!assignment) {
    throw createError({ statusCode: 403, statusMessage: 'You are not assigned to this event' })
  }

  return prisma.score.upsert({
    where: {
      eventId_judgeId_contestantId_criteriaId: { eventId, judgeId: judge.id, contestantId, criteriaId },
    },
    create: { eventId, judgeId: judge.id, contestantId, criteriaId, score },
    update: { score },
  })
})
