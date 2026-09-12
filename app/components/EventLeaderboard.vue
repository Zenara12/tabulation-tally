<template>
  <div>
    <div v-if="pending" class="text-sm text-slate py-6">Loading results...</div>
    <div v-else-if="!data" class="text-sm text-slate py-6">No results available.</div>

    <div v-else>
      <!-- Summary bar -->
      <div class="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5 text-sm text-slate">
        <span>{{ data.judgeCount }} judge{{ data.judgeCount !== 1 ? 's' : '' }}</span>
        <span>{{ data.criteriaCount }} criteria</span>
        <span class="font-medium" :class="data.totalWeight === 100 ? 'text-teal' : 'text-crimson'">
          Total weight: {{ data.totalWeight }}%
        </span>
      </div>

      <!-- Tab bar -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-ink/10 mb-6">
        <div class="flex gap-1 overflow-x-auto pb-px">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap"
            :class="activeTab === tab.key
              ? 'border-brass text-ink'
              : 'border-transparent text-slate hover:text-ink'"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="flex items-center gap-3 pb-2">
          <span v-if="lastUpdated" class="text-xs text-slate-soft">
            Updated {{ formatUpdatedAt(lastUpdated) }}
          </span>
          <button
            type="button"
            class="flex items-center gap-1.5 text-sm text-slate hover:text-ink disabled:opacity-50 transition-colors"
            :disabled="pending || refreshing"
            @click="refreshResults"
          >
            <svg class="w-4 h-4" :class="refreshing ? 'animate-spin' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M20 11a8.1 8.1 0 0 0-14.8-4.5L3 9m0-5v5h5M4 13a8.1 8.1 0 0 0 14.8 4.5L21 15m0 5v-5h-5"/>
            </svg>
            {{ refreshing ? 'Refreshing...' : 'Refresh results' }}
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 text-sm text-slate hover:text-ink transition-colors"
            @click="printTab"
          >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8" rx="1"/>
          </svg>
            Print
          </button>
        </div>
      </div>

      <!-- Per-judge tab -->
      <template v-if="activeTab !== 'total'">
        <div v-for="jd in data.perJudge" :key="jd.judge.id">
          <div v-if="activeTab === jd.judge.id">
            <div
              v-if="!jd.complete"
              class="rounded-md bg-brass/10 border border-brass/30 px-4 py-3 text-sm text-ink mb-5"
            >
              Warning: {{ jd.judge.name }} has not scored all contestants yet. Rankings may be incomplete.
            </div>
            <ResultsTable :rows="jd.results" :criterias="judgeColumns" mode="judge" />
          </div>
        </div>
      </template>

      <!-- Total tab -->
      <template v-else>
        <div
          v-if="data.total.results.some((r) => !r.complete)"
          class="rounded-md bg-brass/10 border border-brass/30 px-4 py-3 text-sm text-ink mb-5"
        >
          Warning: Some contestants are missing scores from one or more judges. Rankings may be incomplete.
        </div>
        <ResultsTable :rows="data.total.results" :criterias="totalColumns" mode="total" />
      </template>

      <!-- Hidden printable area -->
      <div id="print-area" class="hidden print:block">
        <div class="mb-6">
          <h1 class="text-2xl font-bold">{{ eventName }}</h1>
          <p class="text-base text-gray-600 mt-1">{{ printTitle }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Printed: {{ printDate }}</p>
        </div>

        <!-- Per-judge print table -->
        <template v-if="activeTab !== 'total'">
          <div v-for="jd in data.perJudge" :key="jd.judge.id">
            <table v-if="activeTab === jd.judge.id" class="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th class="border border-gray-300 px-3 py-2 text-left">Rank</th>
                  <th class="border border-gray-300 px-3 py-2 text-left">Contestant</th>
                  <th class="border border-gray-300 px-3 py-2 text-left">Alias</th>
                  <th class="border border-gray-300 px-3 py-2 text-left">Character</th>
                  <th v-for="c in jd.results[0]?.criteriaBreakdown" :key="c.criteriaId" class="border border-gray-300 px-3 py-2 text-right">
                    {{ c.criteriaName }}<br><span class="text-xs text-gray-400">{{ c.weight }}%</span>
                  </th>
                  <th class="border border-gray-300 px-3 py-2 text-right">Weighted Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in jd.results" :key="row.contestant.id">
                  <td class="border border-gray-300 px-3 py-2 font-bold">{{ row.rank }}</td>
                  <td class="border border-gray-300 px-3 py-2">{{ row.contestant.name }}</td>
                  <td class="border border-gray-300 px-3 py-2 text-gray-600">{{ row.contestant.alias || '—' }}</td>
                  <td class="border border-gray-300 px-3 py-2 text-gray-600">{{ row.contestant.characterName || '—' }}</td>
                  <td v-for="c in row.criteriaBreakdown" :key="c.criteriaId" class="border border-gray-300 px-3 py-2 text-right">
                    {{ c.score !== null ? c.score.toFixed(2) : '—' }}
                  </td>
                  <td class="border border-gray-300 px-3 py-2 text-right font-bold">{{ row.weightedTotal.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- Total print table -->
        <table v-else class="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th class="border border-gray-300 px-3 py-2 text-left">Rank</th>
              <th class="border border-gray-300 px-3 py-2 text-left">Contestant</th>
              <th class="border border-gray-300 px-3 py-2 text-left">Alias</th>
              <th class="border border-gray-300 px-3 py-2 text-left">Character</th>
              <th v-for="c in data.total.results[0]?.criteriaBreakdown" :key="c.criteriaId" class="border border-gray-300 px-3 py-2 text-right">
                {{ c.criteriaName }}<br><span class="text-xs text-gray-400">{{ c.weight }}%</span>
              </th>
              <th class="border border-gray-300 px-3 py-2 text-right">Weighted Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in data.total.results" :key="row.contestant.id">
              <td class="border border-gray-300 px-3 py-2 font-bold">{{ row.rank }}</td>
              <td class="border border-gray-300 px-3 py-2">{{ row.contestant.name }}</td>
              <td class="border border-gray-300 px-3 py-2 text-gray-600">{{ row.contestant.alias || '—' }}</td>
              <td class="border border-gray-300 px-3 py-2 text-gray-600">{{ row.contestant.characterName || '—' }}</td>
              <td v-for="c in row.criteriaBreakdown" :key="c.criteriaId" class="border border-gray-300 px-3 py-2 text-right">
                {{ c.average !== null ? c.average.toFixed(2) : '—' }}
                <span class="block text-xs text-gray-400">+{{ c.weighted.toFixed(2) }}</span>
              </td>
              <td class="border border-gray-300 px-3 py-2 text-right font-bold">{{ row.weightedTotal.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ eventId: string; eventName?: string }>()

const { data, pending, refresh } = await useFetch(`/api/events/${props.eventId}/results`)
const { lastLeaderboardUpdate, markLeaderboardUpdated } = useTabulationState()
const lastUpdated = lastLeaderboardUpdate(props.eventId)
const refreshing = ref(false)

async function refreshResults() {
  refreshing.value = true
  try {
    await refresh()
    markLeaderboardUpdated(props.eventId)
  } finally {
    refreshing.value = false
  }
}

function formatUpdatedAt(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

if (data.value) markLeaderboardUpdated(props.eventId)

// Build tab list: one per judge + "Total" at the end
const tabs = computed(() => {
  if (!data.value) return []
  return [
    ...(data.value.perJudge.map((jd) => ({ key: jd.judge.id, label: jd.judge.name }))),
    { key: 'total', label: 'Total Result' },
  ]
})

const activeTab = ref('total')
// Reset to first tab when data loads
watch(data, (d) => {
  if (d && tabs.value.length) activeTab.value = tabs.value[0].key
}, { immediate: true })

const judgeColumns = computed(() => {
  const jd = data.value?.perJudge.find((j) => j.judge.id === activeTab.value)
  return jd?.results[0]?.criteriaBreakdown ?? []
})
const totalColumns = computed(() => data.value?.total.results[0]?.criteriaBreakdown ?? [])

const printDate = computed(() => new Date().toLocaleString())
const printTitle = computed(() => {
  if (activeTab.value === 'total') return 'Final Results - All Judges Combined'
  const jd = data.value?.perJudge.find((j) => j.judge.id === activeTab.value)
  return jd ? `Scores by Judge: ${jd.judge.name}` : ''
})

function printTab() {
  window.print()
}
</script>

<!-- Print styles: hide the interactive UI, show only #print-area -->
<style>
@media print {
  body > * { display: none !important; }
  #print-area { display: block !important; }
  #print-area table { width: 100%; border-collapse: collapse; }
  #print-area th, #print-area td { border: 1px solid #ccc; padding: 6px 10px; }
}
</style>
