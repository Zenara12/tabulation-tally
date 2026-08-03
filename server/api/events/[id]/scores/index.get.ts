// Returns the current judge's own scores for this event (used to prefill the
// scoring UI). Admins may pass ?judgeId= to inspect a specific judge's scores.
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user as { id: string; role: 'ADMIN' | 'JUDGE' }
  const eventId = getRouterParam(event, 'id')!
  const query = getQuery(event)

  const judgeId = user.role === 'ADMIN' && query.judgeId ? String(query.judgeId) : user.id

  return prisma.score.findMany({ where: { eventId, judgeId } })
})
