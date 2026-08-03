export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const eventId = getRouterParam(event, 'id')!
  const judgeId = getRouterParam(event, 'judgeId')!

  await prisma.eventJudge.delete({ where: { eventId_judgeId: { eventId, judgeId } } })
  return { success: true }
})
