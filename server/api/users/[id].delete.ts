export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')

  if (id === admin.id) {
    throw createError({ statusCode: 400, statusMessage: 'You cannot delete your own account' })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  const protectedEmail = process.env.SEED_ADMIN_EMAIL || 'admin@tabulation.local'

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  if (user.email.toLowerCase() === protectedEmail.toLowerCase()) {
    throw createError({ statusCode: 400, statusMessage: 'The seeded admin account cannot be deleted' })
  }

  await prisma.user.delete({ where: { id: user.id } })
  return { success: true }
})
