<template>
  <div class="px-4 py-6 sm:px-6 lg:px-10 lg:py-10 max-w-3xl mx-auto">
    <h1 class="font-display text-3xl text-ink mb-1">Assigned Events</h1>
    <p class="text-sm text-slate mb-8">Events you've been assigned to score.</p>

    <div v-if="pending" class="text-sm text-slate">Loading…</div>

    <div v-else-if="!events?.length" class="border border-dashed border-ink/15 rounded-lg py-16 text-center">
      <p class="text-slate text-sm">You have no assigned events yet.</p>
      <p class="text-xs text-slate-soft mt-1">Ask an admin to assign you to an event.</p>
    </div>

    <div v-else class="space-y-3">
      <NuxtLink
        v-for="evt in events"
        :key="evt.id"
        :to="`/judge/score/${evt.id}`"
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-ink/10 bg-white px-5 py-4 hover:border-teal/60 hover:shadow-sm transition-all"
      >
        <div>
          <div class="flex items-center gap-2.5">
            <p class="font-display text-lg text-ink">{{ evt.name }}</p>
            <span
              class="text-[10px] uppercase tracking-wider font-medium rounded-full px-2 py-0.5"
              :class="statusClass(evt.status)"
            >{{ evt.status }}</span>
          </div>
          <p v-if="evt.description" class="text-sm text-slate mt-0.5">{{ evt.description }}</p>
        </div>
        <div class="text-sm text-teal font-medium shrink-0">
          {{ evt.status === 'OPEN' ? 'Score →' : 'View →' }}
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'judge' })

const { data: events, pending } = await useFetch('/api/events')

function statusClass(status: string) {
  if (status === 'OPEN') return 'bg-teal/10 text-teal'
  if (status === 'CLOSED') return 'bg-crimson/10 text-crimson'
  return 'bg-slate/10 text-slate'
}
</script>
