<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[720px] text-sm">
      <thead>
        <tr class="text-left text-xs uppercase tracking-wider text-slate-soft border-b border-ink/10">
          <th class="py-3 font-medium w-12">Rank</th>
          <th class="py-3 font-medium w-50">Contestant</th>
          <th class="py-3 font-medium w-40">Character</th>
          <th
            v-for="c in criterias"
            :key="c.criteriaId"
            class="py-3 font-medium text-right w-20"
          >
            {{ c.criteriaName }}
          </th>
          <th class="py-3 font-medium text-right w-25">
            {{ mode === 'total' ? 'Final Score' : 'Total Score' }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row.contestant.id"
          class="border-b border-ink/5"
          :class="!row.complete ? 'opacity-60' : ''"
        >
          <td
            class="py-3 tabular font-display text-2xl"
            :class="row.rank === 1 ? 'rank-1' : row.rank === 2 ? 'rank-2' : row.rank === 3 ? 'rank-3' : 'text-slate-soft'"
          >
            {{ row.rank }}
          </td>

          <td class="py-3">
            <div class="flex items-start gap-3">
              <img
                v-if="row.contestant.cosplayPictureUrl"
                :src="row.contestant.cosplayPictureUrl"
                class="w-8 h-8 rounded object-cover border border-ink/10 shrink-0"
                :alt="row.contestant.characterName || row.contestant.alias || row.contestant.name"
              >
              <section class="flex flex-col gap-1">
                <span class="text-md text-ink">{{ row.contestant.alias || '—' }}</span>
                <span class="text-xs text-ink">{{ row.contestant.name }}</span>
              </section>
            </div>
          </td>

          <td class="py-3 text-slate text-xs">
            {{ row.contestant.characterName || '—' }}
          </td>

          <td
            v-for="c in row.criteriaBreakdown"
            :key="c.criteriaId"
            class="py-3 text-right tabular"
          >
            <span v-if="c.score !== null" class="text-ink">{{ c.score.toFixed(2) }}</span>
            <span v-else class="text-slate-soft text-xs">—</span>
          </td>

          <td class="py-3 text-right tabular">
            <span class="font-display text-xl" :class="row.rank === 1 ? 'text-brass' : 'text-ink'">
              {{ row.weightedTotal.toFixed(2) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  rows: any[]
  criterias: any[]
  mode: 'judge' | 'total'
}>()
</script>
