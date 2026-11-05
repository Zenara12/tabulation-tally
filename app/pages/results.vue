<template>
  <div class="min-h-dvh bg-paper">
    <header class="border-b border-ink/10 bg-white/80">
      <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div>
          <p class="font-display text-2xl tracking-tight text-ink">Tabulation</p>
          <p class="mt-1 text-xs uppercase tracking-[0.2em] text-brass">Final results</p>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <div class="max-w-2xl">
        <h1 class="font-display text-3xl text-ink sm:text-4xl">Completed events</h1>
        <p class="mt-2 text-sm leading-6 text-slate">
          View the final contestant rankings for events with completed scoring.
        </p>
      </div>

      <div v-if="pending" class="mt-10 rounded-xl border border-dashed border-ink/15 py-16 text-center text-sm text-slate">
        Loading final results…
      </div>

      <div v-else-if="error" class="mt-10 rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-8 text-center text-sm text-crimson">
        Unable to load final results right now. Please try again later.
      </div>

      <div v-else-if="!events?.length" class="mt-10 rounded-xl border border-dashed border-ink/15 py-16 text-center">
        <p class="text-sm text-slate">No completed events are available yet.</p>
      </div>

      <div v-else class="mt-10 space-y-10">
        <section v-for="event in events" :key="event.id" :aria-labelledby="`event-${event.id}`">
          <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h2 :id="`event-${event.id}`" class="font-display text-2xl text-ink">{{ event.name }}</h2>
                <span class="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-teal">Completed</span>
              </div>
              <p v-if="event.description" class="mt-1 text-sm text-slate">{{ event.description }}</p>
            </div>
            <time class="text-xs text-slate-soft" :datetime="event.completedAt">
              Finalized {{ formatDate(event.completedAt) }}
            </time>
          </div>

          <div v-if="!event.results.length" class="rounded-xl border border-dashed border-ink/15 py-12 text-center text-sm text-slate">
            No final scores are available for this event.
          </div>

          <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <article
              v-for="row in event.results"
              :key="row.contestant.id"
              class="relative overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm"
              :class="row.rank <= 3 ? 'ring-1 ring-brass/20' : ''"
            >
              <div class="flex items-start gap-4 p-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-xl font-semibold tabular text-paper">
                  {{ row.rank }}
                </div>
                <img
                  v-if="row.contestant.cosplayPictureUrl"
                  :src="row.contestant.cosplayPictureUrl"
                  class="h-20 w-20 shrink-0 rounded-lg border border-ink/10 object-cover"
                  :alt="row.contestant.characterName || row.contestant.alias || row.contestant.name"
                >
                <div v-else class="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-ink/15 bg-paper px-2 text-center text-[10px] text-slate-soft">
                  No image
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-soft">Contestant No. {{ row.contestant.number }}</p>
                  <h3 class="mt-1 truncate text-lg font-semibold text-ink">{{ row.contestant.name }}</h3>
                  <p v-if="row.contestant.alias" class="truncate text-sm text-slate">{{ row.contestant.alias }}</p>
                  <p v-if="row.contestant.characterName" class="truncate text-xs text-slate-soft">{{ row.contestant.characterName }}</p>
                </div>
              </div>

              <div class="flex items-center justify-between gap-3 border-t border-ink/10 bg-paper/50 px-4 py-3">
                <span class="text-xs font-medium uppercase tracking-[0.14em] text-slate-soft">Final score</span>
                <span class="font-display text-2xl text-ink tabular">{{ row.finalScore.toFixed(2) }}</span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: events, pending, error } = await useFetch('/api/public/results')

function formatDate(value: string) {
  return new Date(value).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
