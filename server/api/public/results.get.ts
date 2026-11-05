// Public final results for completed events.
// This endpoint intentionally returns only aggregate totals; judge identities,
// individual scores, and per-criteria breakdowns are never exposed.
export default defineEventHandler(async () => {
  const events = await prisma.event.findMany({
    where: { status: 'CLOSED' },
    orderBy: { updatedAt: 'desc' },
    include: {
      criterias: {
        select: { id: true, weight: true },
        orderBy: { order: 'asc' },
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
    const results = event.contestants.map((contestant) => {
      const weightedTotal = event.criterias.reduce((total, criteria) => {
        const scores = event.scores.filter(
          (score) => score.contestantId === contestant.id && score.criteriaId === criteria.id,
        )
        const average = scores.length
          ? scores.reduce((sum, score) => sum + score.score, 0) / scores.length
          : 0

        return total + (average * criteria.weight) / 100
      }, 0)

      return {
        contestant,
        finalScore: Math.round(weightedTotal * 100) / 100,
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
      results: results.map((result, index) => ({
        ...result,
        rank: index + 1,
      })),
    }
  })
})
