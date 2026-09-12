type LeaderboardState = Record<string, {
  lastUpdated: string | null
}>

/** Shared client state for lightweight tabulation UI concerns. */
export function useTabulationState() {
  const leaderboard = useState<LeaderboardState>('tabulation-leaderboard-state', () => ({}))

  function lastLeaderboardUpdate(eventId: string) {
    return computed(() => leaderboard.value[eventId]?.lastUpdated ?? null)
  }

  function markLeaderboardUpdated(eventId: string, date = new Date()) {
    leaderboard.value = {
      ...leaderboard.value,
      [eventId]: { lastUpdated: date.toISOString() },
    }
  }

  return { lastLeaderboardUpdate, markLeaderboardUpdated }
}
