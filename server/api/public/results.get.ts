// Public final results for completed events.
// This endpoint intentionally returns only aggregate totals; judge identities,
// individual scores, and per-criteria breakdowns are never exposed.
export default defineEventHandler(async () => {
  const events = await prisma.event.findMany({
    where: { status: 'CLOSED' },
    orderBy: { updatedAt: 'desc' },
    include: {
      judges: {
        select: { id: true },
      },
      contestants: {
        select: {
          id: true,
          number: true,
          name: true,
          alias: true,
          characterName: true,
          cosplayPictureUrl: true,
        },
        orderBy: { number: 'asc' },
      },
      scores: {
        select: {
          contestantId: true,
          criteriaId: true,
          score: true,
        },
      },
    },
  })

  return events.map((event) => {
    const judgeCount = event.judges.length
    const results = event.contestants.map((contestant) => {
      const totalScore = event.scores
        .filter((score) => score.contestantId === contestant.id)
        .reduce((sum, score) => sum + score.score, 0)
      const averageScore = judgeCount ? totalScore / judgeCount : 0

      return {
        contestant,
        finalScore: Math.round(averageScore * 100) / 100,
      }
    })

    results.sort((a, b) => {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore
      return a.contestant.number - b.contestant.number
    })

    return {
      id: event.id,
      name: event.name,
      description: event.description,
      completedAt: event.updatedAt,
      judgeCount,
      results: results.map((result, index) => ({
        ...result,
        rank: index + 1,
      })),
    }
  })
})
