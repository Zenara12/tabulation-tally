// Weighted leaderboard for an event: for every contestant, the average score
// each criteria received (across all judges) is multiplied by that
// criteria's weight, then summed to a single weighted total out of 100.
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const eventId = getRouterParam(event, 'id')!

  const [contestants, criterias, judges, scores] = await Promise.all([
    prisma.contestant.findMany({ where: { eventId }, orderBy: { number: 'asc' } }),
    prisma.criteria.findMany({ where: { eventId } }),
    prisma.eventJudge.findMany({ where: { eventId } }),
    prisma.score.findMany({ where: { eventId } }),
  ])

  const totalWeight = criterias.reduce((sum, c) => sum + c.weight, 0)
  
  const results = contestants.map((contestant) => {
    const criteriaBreakdown = criterias.map((criteria) => {
      const relevant = scores.filter(
        (s) => s.contestantId === contestant.id && s.criteriaId === criteria.id,
      )
      const average = relevant.length
        ? relevant.reduce((sum, s) => sum + s.score, 0) / relevant.length
        : null
      return {
        criteriaId: criteria.id,
        criteriaName: criteria.name,
        weight: criteria.weight,
        average,
        judgeCount: relevant.length,
        weighted: average !== null ? (average * criteria.weight) / 100 : 0,
      }
    })
    console.log('criteriaBreakdown', criteriaBreakdown)
    const weightedTotal = criteriaBreakdown.reduce((sum, c) => sum + c.weighted, 0)
    const scoresSubmitted = scores.filter((s) => s.contestantId === contestant.id).length
    const scoresExpected = criterias.length * judges.length

    return {
      contestant,
      criteriaBreakdown,
      weightedTotal: Math.round(weightedTotal * 100) / 100,
      complete: scoresExpected > 0 && scoresSubmitted >= scoresExpected,
    }
  })

  results.sort((a, b) => b.weightedTotal - a.weightedTotal)

  return {
    totalWeight,
    judgeCount: judges.length,
    criteriaCount: criterias.length,
    results: results.map((r, i) => ({ ...r, rank: i + 1 })),
  }
})
