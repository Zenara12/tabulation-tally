export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user as { id: string; role: 'ADMIN' | 'JUDGE' }

  if (user.role === 'ADMIN') {
    return prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { contestants: true, criterias: true, judges: true } },
      },
    })
  }

  // Judges only see events they're assigned to
  return prisma.event.findMany({
    where: { judges: { some: { judgeId: user.id } } },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { contestants: true, criterias: true, judges: true } },
    },
  })
})
