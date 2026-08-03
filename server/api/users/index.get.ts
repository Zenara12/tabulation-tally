export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { name: 'asc' },
  })

  return users
})
