export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')

  if (id === admin.id) {
    throw createError({ statusCode: 400, statusMessage: 'You cannot delete your own account' })
  }

  await prisma.user.delete({ where: { id } })
  return { success: true }
})
