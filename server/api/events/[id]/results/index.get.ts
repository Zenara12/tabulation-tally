// Results endpoint returning:
//  - perJudge: each judge's individual scores + weighted totals (ranked)
//  - total: weighted average across all judges (ranked)
export default defineEventHandler(async (event) => {
  // Results include every judge's scores and are currently exposed only in
  // the admin event view. Do not allow judges to enumerate other events or
  // inspect other judges' scoring data.
  await requireRole(event, ['ADMIN'])
  const eventId = getRouterParam(event, 'id')!

  const [contestants, criterias, eventJudges, scores] = await Promise.all([
    prisma.contestant.findMany({ where: { eventId }, orderBy: { number: 'asc' } }),
    prisma.criteria.findMany({ where: { eventId }, orderBy: { order: 'asc' } }),
    prisma.eventJudge.findMany({
      where: { eventId },
      include: { judge: { select: { id: true, name: true, email: true } } },
    }),
    prisma.score.findMany({ where: { eventId } }),
  ])

  const totalWeight = criterias.reduce((sum, c) => sum + c.weight, 0)
  const judges = eventJudges.map((ej) => ej.judge)

  // ── Helper: build a ranked result row for one contestant given a score subset ──
  function buildRow(contestant: typeof contestants[number], scopedScores: typeof scores) {
    const criteriaBreakdown = criterias.map((criteria) => {
      const relevant = scopedScores.filter(
        (s) => s.contestantId === contestant.id && s.criteriaId === criteria.id,
      )
      const scoreValue = relevant.length ? relevant[0].score : null

      return {
        criteriaId: criteria.id,
        criteriaName: criteria.name,
        weight: criteria.weight,
        score: scoreValue,
        weighted: scoreValue !== null ? (scoreValue * criteria.weight) / 100 : 0,
      }
    })

    const weightedTotal = Math.round(
      criteriaBreakdown.reduce((sum, c) => sum + c.weighted, 0) * 100,
    ) / 100

    return { contestant, criteriaBreakdown, weightedTotal }
  }

  // ── Per-judge view: only that judge's scores, ranked individually ──
  const perJudge = judges.map((judge) => {
    const judgeScores = scores.filter((s) => s.judgeId === judge.id)
    const rows = contestants.map((c) => buildRow(c, judgeScores))
    rows.sort((a, b) => b.weightedTotal - a.weightedTotal)
    const scoresExpected = criterias.length * contestants.length
    return {
      judge,
      results: rows.map((r, i) => ({
        ...r,
        rank: i + 1,
        complete: judgeScores.filter((s) => s.contestantId === r.contestant.id).length === criterias.length,
      })),
      complete: judgeScores.length >= scoresExpected,
    }
  })

  // ── Total view: average each criteria across all judges, then weighted ──
  const totalRows = contestants.map((contestant) => {
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

    const weightedTotal = Math.round(
      criteriaBreakdown.reduce((sum, c) => sum + c.weighted, 0) * 100,
    ) / 100
    const scoresSubmitted = scores.filter((s) => s.contestantId === contestant.id).length
    const scoresExpected = criterias.length * judges.length

    return {
      contestant,
      criteriaBreakdown,
      weightedTotal,
      complete: scoresExpected > 0 && scoresSubmitted >= scoresExpected,
    }
  })

  totalRows.sort((a, b) => b.weightedTotal - a.weightedTotal)

  return {
    totalWeight,
    judgeCount: judges.length,
    criteriaCount: criterias.length,
    perJudge,
    total: {
      results: totalRows.map((r, i) => ({ ...r, rank: i + 1 })),
    },
  }
})
