<template>
  <article class="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
    <div class="flex items-start gap-4 p-4 sm:gap-5 sm:p-5">
      <button
        v-if="contestant.cosplayPictureUrl"
        type="button"
        class="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-paper sm:h-24 sm:w-24 lg:h-16 lg:w-16 xl:h-20 xl:w-20"
        :aria-label="`View reference image for ${imageLabel}`"
        @click="emit('open-image', contestant.cosplayPictureUrl, imageLabel)"
      >
        <img
          :src="contestant.cosplayPictureUrl"
          class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          :alt="imageLabel"
        >
        <span class="absolute inset-x-0 bottom-0 bg-ink/70 px-2 py-1 text-center text-[10px] font-medium text-paper opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          View image
        </span>
      </button>

      <div v-else class="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-ink/15 bg-paper px-2 text-center text-xs text-slate-soft sm:h-24 sm:w-24 lg:h-16 lg:w-16 xl:h-20 xl:w-20">
        No reference image
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 class="truncate text-xl font-semibold text-ink sm:text-2xl">{{ contestant.name }}</h2>
          <span class="tabular text-xs text-slate-soft">No. {{ contestant.number }}</span>
        </div>

        <div class="mt-3 space-y-2">
          <div class="flex min-h-9 flex-col justify-center border-b-2 border-paper-dim">
            <span class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-soft">Alias</span>
            <span class="truncate text-sm font-medium text-ink sm:text-base">{{ contestant.alias || '—' }}</span>
          </div>
          <div class="flex min-h-9 flex-col justify-center border-b-2 border-paper-dim">
            <span class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-soft">Character</span>
            <span class="truncate text-sm font-medium text-ink sm:text-base">{{ contestant.characterName || '—' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-ink/10 bg-paper/50 p-4 sm:p-5">
      <div class="grid grid-cols-1 gap-4">
        <div v-for="criteria in criterias" :key="criteria.id">
          <label
            :for="`score-${contestant.id}-${criteria.id}`"
            class="mb-1.5 flex items-baseline justify-between gap-3"
          >
            <span class="text-base font-semibold text-ink sm:text-lg">{{ criteria.name }}</span>
            <span class="shrink-0 text-xs font-medium text-slate-soft">{{ criteria.weight }}%</span>
          </label>
          <input
            :id="`score-${contestant.id}-${criteria.id}`"
            type="number"
            min="0"
            max="100"
            step="0.5"
            :value="scoreValue(criteria.id)"
            class="min-h-12 w-full rounded-lg border bg-white px-3 py-2.5 text-right text-base tabular text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors"
            :class="hasScore(criteria.id) ? 'border-teal/40 bg-teal/5' : 'border-ink/20'"
            placeholder="Enter score"
            @change="updateScore(criteria.id, $event)"
          >
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
type Contestant = {
  id: string
  number: number
  name: string
  alias?: string | null
  characterName?: string | null
  cosplayPictureUrl?: string | null
}

type Criteria = {
  id: string
  name: string
  weight: number
}

const props = defineProps<{
  contestant: Contestant
  criterias: Criteria[]
  scores: Record<string, number>
}>()

const emit = defineEmits<{
  (event: 'update-score', payload: { criteriaId: string; value: number }): void
  (event: 'open-image', src: string, label: string): void
}>()

const imageLabel = computed(() =>
  props.contestant.characterName || props.contestant.alias || props.contestant.name,
)

function scoreKey(criteriaId: string) {
  return `${props.contestant.id}:${criteriaId}`
}

function scoreValue(criteriaId: string) {
  return props.scores[scoreKey(criteriaId)] ?? ''
}

function hasScore(criteriaId: string) {
  return scoreKey(criteriaId) in props.scores
}

function updateScore(criteriaId: string, event: Event) {
  const input = event.target as HTMLInputElement
  emit('update-score', { criteriaId, value: Number(input.value) })
}
</script>
