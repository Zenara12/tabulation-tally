// Docker HEALTHCHECK endpoint — returns 200 when the server and DB are reachable.
export default defineEventHandler(async () => {
  // Lightweight DB ping to confirm connectivity
  await prisma.$queryRaw`SELECT 1`
  return { status: 'ok', timestamp: new Date().toISOString() }
})
