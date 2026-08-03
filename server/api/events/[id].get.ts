export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user as { id: string; role: 'ADMIN' | 'JUDGE' }
  const id = getRouterParam(event, 'id')

  const found = await prisma.event.findUnique({
    where: { id },
    include: {
      criterias: { orderBy: { order: 'asc' } },
      contestants: { orderBy: { number: 'asc' } },
      judges: { include: { judge: { select: { id: true, name: true, email: true } } } },
    },
  })

  if (!found) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  if (user.role === 'JUDGE' && !found.judges.some((j) => j.judgeId === user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'You are not assigned to this event' })
  }

  return found
})
