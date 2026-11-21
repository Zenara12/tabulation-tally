import { z } from 'zod'

const bodySchema = z.object({
  contestants: z.array(
    z.object({
      id: z.string(),
      newNumber: z.number(),
    })
  ),
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const { contestants } = await readValidatedBody(event, bodySchema.parse)

  try {
    await prisma.$transaction(async (tx) => {
      // Step 1: Temporarily set numbers to negative values to avoid unique collisions
      for (const item of contestants) {
        await tx.contestant.update({
          where: { id: item.id },
          data: { number: -item.newNumber },
        })
      }

      // Step 2: Set the final positive numbers
      for (const item of contestants) {
        await tx.contestant.update({
          where: { id: item.id },
          data: { number: item.newNumber },
        })
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Prisma error:', error)
    throw error
  }
})