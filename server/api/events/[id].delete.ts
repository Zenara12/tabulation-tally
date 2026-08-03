export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')

  await prisma.event.delete({ where: { id } })
  return { success: true }
})
