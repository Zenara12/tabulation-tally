export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const criteriaId = getRouterParam(event, 'criteriaId')!

  await prisma.criteria.delete({ where: { id: criteriaId } })
  return { success: true }
})
