export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const contestantId = getRouterParam(event, 'contestantId')!

  await prisma.contestant.delete({ where: { id: contestantId } })
  return { success: true }
})
