export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const eventId = getRouterParam(event, 'id')!

  return prisma.contestant.findMany({ where: { eventId }, orderBy: { number: 'asc' } })
})
