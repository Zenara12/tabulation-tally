<template>
  <div class="w-full px-4 py-6 sm:px-6 lg:px-10 lg:py-10 max-w-7xl">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
      <div>
        <h1 class="font-display text-3xl text-ink">Events</h1>
        <p class="text-sm text-slate mt-1">Create and manage tabulation events.</p>
      </div>
      <AppButton
        class="w-full sm:w-auto"
        @click="showCreate = true"
      >
        + New event
      </AppButton>
    </div>

    <div v-if="pending" class="text-sm text-slate">Loading events…</div>

    <div v-else-if="!events?.length" class="border border-dashed border-ink/15 rounded-lg py-16 text-center">
      <p class="text-slate text-sm">No events yet. Create your first one to get started.</p>
    </div>

    <div v-else class="space-y-3">
      <NuxtLink
        v-for="evt in events"
        :key="evt.id"
        :to="`/admin/events/${evt.id}`"
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-ink/10 bg-white px-5 py-4 hover:border-brass/60 hover:shadow-sm transition-all"
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
        <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm tabular text-slate shrink-0">
          <span>{{ evt._count.contestants }} contestants</span>
          <span>{{ evt._count.criterias }} criteria</span>
          <span>{{ evt._count.judges }} judges</span>
        </div>
      </NuxtLink>
    </div>

    <!-- Create modal -->
    <div v-if="showCreate" class="fixed inset-0 bg-ink/40 flex items-center justify-center px-4 py-4 sm:py-6 z-50" @click.self="showCreate = false">
      <div class="bg-white rounded-lg w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 sm:p-6">
        <h2 class="font-display text-xl text-ink mb-4">New event</h2>
        <form class="space-y-4" @submit.prevent="createEvent">
          <div>
            <label class="block text-sm font-medium text-ink mb-1.5">Name</label>
            <input v-model="form.name" required class="w-full rounded-md border border-ink/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
          </div>
          <div>
            <label class="block text-sm font-medium text-ink mb-1.5">Description (optional)</label>
            <textarea v-model="form.description" rows="3" class="w-full rounded-md border border-ink/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50" />
          </div>
          <p v-if="createError" class="text-sm text-crimson">{{ createError }}</p>
          <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
            <AppButton color="transparent" variant="ghost" :hover="false" class="w-full sm:w-auto hover:text-ink" @click="showCreate = false">Cancel</AppButton>
            <AppButton type="submit" class="w-full sm:w-auto" :disabled="creating">
              {{ creating ? 'Creating…' : 'Create event' }}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data: events, pending, refresh } = await useFetch('/api/events')

const showCreate = ref(false)
const creating = ref(false)
const createError = ref('')
const form = reactive({ name: '', description: '' })

function statusClass(status: string) {
  if (status === 'OPEN') return 'bg-teal/10 text-teal'
  if (status === 'CLOSED') return 'bg-crimson/10 text-crimson'
  return 'bg-slate/10 text-slate'
}

async function createEvent() {
  creating.value = true
  createError.value = ''
  try {
    await $fetch('/api/events', { method: 'POST', body: { ...form } })
    showCreate.value = false
    form.name = ''
    form.description = ''
    await refresh()
  } catch (e: any) {
    createError.value = e?.data?.statusMessage || 'Failed to create event'
  } finally {
    creating.value = false
  }
}
</script>
