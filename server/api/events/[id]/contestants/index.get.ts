export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const eventId = getRouterParam(event, 'id')!

  const user = session.user as { id: string; role: 'ADMIN' | 'JUDGE' }
  if (user.role === 'JUDGE') {
    const assignment = await prisma.eventJudge.findUnique({
      where: { eventId_judgeId: { eventId, judgeId: user.id } },
    })
    if (!assignment) throw createError({ statusCode: 403, statusMessage: 'You are not assigned to this event' })
  }

  return prisma.contestant.findMany({ where: { eventId }, orderBy: { number: 'asc' } })
})
