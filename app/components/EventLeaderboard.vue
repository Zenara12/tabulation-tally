<template>
  <div>
    <div v-if="pending" class="text-sm text-slate py-6">Loading results…</div>

    <div v-else-if="!data" class="text-sm text-slate py-6">No results available.</div>

    <div v-else>
      <div class="flex items-center gap-6 mb-6 text-sm text-slate">
        <span>{{ data.judgeCount }} judge{{ data.judgeCount !== 1 ? 's' : '' }}</span>
        <span>{{ data.criteriaCount }} criteria</span>
        <span
          class="font-medium"
          :class="data.totalWeight === 100 ? 'text-teal' : 'text-crimson'"
        >
          Total weight: {{ data.totalWeight }}%
        </span>
      </div>

      <!-- Incomplete scoring warning -->
      <div
        v-if="data.results.some((r) => !r.complete)"
        class="rounded-md bg-brass/10 border border-brass/30 px-4 py-3 text-sm text-ink mb-5"
      >
        ⚠ Some contestants are missing scores from one or more judges. Rankings may be incomplete.
      </div>

      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs uppercase tracking-wider text-slate-soft border-b border-ink/10">
            <th class="py-3 font-medium w-12">Rank</th>
            <th class="py-3 font-medium">Contestant</th>
            <th
              v-for="c in data.results[0]?.criteriaBreakdown"
              :key="c.criteriaId"
              class="py-3 font-medium text-right w-28"
            >
              {{ c.criteriaName }}
              <span class="block text-[10px] normal-case tracking-normal text-slate-soft/70">{{ c.weight }}%</span>
            </th>
            <th class="py-3 font-medium text-right w-32">Weighted Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in data.results"
            :key="row.contestant.id"
            class="border-b border-ink/5"
            :class="!row.complete ? 'opacity-60' : ''"
          >
            <td class="py-3 tabular font-display text-2xl"
              :class="row.rank === 1 ? 'rank-1' : row.rank === 2 ? 'rank-2' : row.rank === 3 ? 'rank-3' : 'text-slate-soft'"
            >
              {{ row.rank }}
            </td>
            <td class="py-3">
              <span class="font-medium text-ink">{{ row.contestant.name }}</span>
              <span class="block text-xs text-slate-soft tabular">No. {{ row.contestant.number }}</span>
            </td>
            <td
              v-for="c in row.criteriaBreakdown"
              :key="c.criteriaId"
              class="py-3 text-right tabular"
            >
              <span v-if="c.average !== null">
                <span class="text-ink">{{ c.average.toFixed(2) }}</span>
                <span class="block text-[10px] text-slate-soft">+{{ c.weighted.toFixed(2) }} pts</span>
              </span>
              <span v-else class="text-slate-soft text-xs">—</span>
            </td>
            <td class="py-3 text-right tabular">
              <span class="font-display text-xl" :class="row.rank === 1 ? 'text-brass' : 'text-ink'">
                {{ row.weightedTotal.toFixed(2) }}
              </span>
              <span class="block text-[10px] text-slate-soft">/ {{ data.totalWeight }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ eventId: string }>()

const { data, pending, refresh } = await useFetch(`/api/events/${props.eventId}/results`)

// Auto-refresh every 10 s while the component is mounted (useful during live scoring)
// let interval: ReturnType<typeof setInterval>
// onMounted(() => { interval = setInterval(refresh, 10_000) })
// onUnmounted(() => clearInterval(interval))
</script>
