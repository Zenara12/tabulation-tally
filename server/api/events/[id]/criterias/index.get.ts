export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const eventId = getRouterParam(event, 'id')!

  return prisma.criteria.findMany({ where: { eventId }, orderBy: { order: 'asc' } })
})
