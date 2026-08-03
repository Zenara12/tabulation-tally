<template>
  <div v-if="event" class="px-10 py-10 max-w-5xl">
    <div class="flex items-start justify-between mb-2">
      <div>
        <NuxtLink to="/admin" class="text-xs text-slate hover:text-ink">← All events</NuxtLink>
        <h1 class="font-display text-3xl text-ink mt-1">{{ event.name }}</h1>
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model="statusModel"
          class="text-sm rounded-md border border-ink/15 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brass/50"
          @change="updateStatus"
        >
          <option value="DRAFT">Draft</option>
          <option value="OPEN">Open for scoring</option>
          <option value="CLOSED">Closed</option>
        </select>
        <button class="text-sm text-crimson hover:underline px-2" @click="removeEvent">Delete</button>
      </div>
    </div>
    <p v-if="event.description" class="text-sm text-slate mb-8">{{ event.description }}</p>
    <div v-else class="mb-8" />

    <div class="flex gap-1 border-b border-ink/10 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
        :class="activeTab === tab ? 'border-brass text-ink' : 'border-transparent text-slate hover:text-ink'"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Criteria -->
    <div v-if="activeTab === 'Criteria'" class="space-y-4">
      <p class="text-xs text-slate">
        Weights should total 100%. Current total:
        <span class="tabular font-medium" :class="totalWeight === 100 ? 'text-teal' : 'text-crimson'">{{ totalWeight }}%</span>
      </p>

      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs uppercase tracking-wider text-slate-soft border-b border-ink/10">
            <th class="py-2.5 font-medium">Criteria</th>
            <th class="py-2.5 font-medium w-32">Weight (%)</th>
            <th class="py-2.5 font-medium w-16 text-right"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in criterias" :key="c.id" class="border-b border-ink/5">
            <td class="py-2.5 text-ink">{{ c.name }}</td>
            <td class="py-2.5 tabular">{{ c.weight }}</td>
            <td class="py-2.5 text-right">
              <button class="text-crimson hover:underline text-xs" @click="deleteCriteria(c.id)">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>

      <form class="flex gap-2 items-end pt-2" @submit.prevent="addCriteria">
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate mb-1">Criteria name</label>
          <input v-model="criteriaForm.name" required class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
        </div>
        <div class="w-28">
          <label class="block text-xs font-medium text-slate mb-1">Weight %</label>
          <input v-model.number="criteriaForm.weight" type="number" min="0" max="100" required class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
        </div>
        <button type="submit" class="rounded-md bg-ink text-paper text-sm font-medium px-4 py-2 hover:bg-ink-soft">Add</button>
      </form>
    </div>

    <!-- Contestants -->
    <div v-else-if="activeTab === 'Contestants'" class="space-y-4">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs uppercase tracking-wider text-slate-soft border-b border-ink/10">
            <th class="py-2.5 font-medium w-16">No.</th>
            <th class="py-2.5 font-medium">Name</th>
            <th class="py-2.5 font-medium w-16 text-right"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in contestants" :key="c.id" class="border-b border-ink/5">
            <td class="py-2.5 tabular text-ink">{{ c.number }}</td>
            <td class="py-2.5 text-ink">{{ c.name }}</td>
            <td class="py-2.5 text-right">
              <button class="text-crimson hover:underline text-xs" @click="deleteContestant(c.id)">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>

      <form class="flex gap-2 items-end pt-2" @submit.prevent="addContestant">
        <div class="w-24">
          <label class="block text-xs font-medium text-slate mb-1">No.</label>
          <input v-model.number="contestantForm.number" type="number" min="1" required class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
        </div>
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate mb-1">Name</label>
          <input v-model="contestantForm.name" required class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
        </div>
        <button type="submit" class="rounded-md bg-ink text-paper text-sm font-medium px-4 py-2 hover:bg-ink-soft">Add</button>
      </form>
      <p v-if="contestantError" class="text-sm text-crimson">{{ contestantError }}</p>
    </div>

    <!-- Judges -->
    <div v-else-if="activeTab === 'Judges'" class="space-y-4">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs uppercase tracking-wider text-slate-soft border-b border-ink/10">
            <th class="py-2.5 font-medium">Name</th>
            <th class="py-2.5 font-medium">Email</th>
            <th class="py-2.5 font-medium w-16 text-right"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="j in event.judges" :key="j.id" class="border-b border-ink/5">
            <td class="py-2.5 text-ink">{{ j.judge.name }}</td>
            <td class="py-2.5 text-slate">{{ j.judge.email }}</td>
            <td class="py-2.5 text-right">
              <button class="text-crimson hover:underline text-xs" @click="unassignJudge(j.judgeId)">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>

      <form class="flex gap-2 items-end pt-2" @submit.prevent="assignJudge">
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate mb-1">Assign judge</label>
          <select v-model="selectedJudgeId" class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
            <option value="" disabled>Select a judge…</option>
            <option v-for="j in availableJudges" :key="j.id" :value="j.id">{{ j.name }} ({{ j.email }})</option>
          </select>
        </div>
        <button type="submit" :disabled="!selectedJudgeId" class="rounded-md bg-ink text-paper text-sm font-medium px-4 py-2 hover:bg-ink-soft disabled:opacity-60">Assign</button>
      </form>
    </div>

    <!-- Results -->
    <div v-else-if="activeTab === 'Results'">
      <EventLeaderboard :event-id="eventId" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const eventId = route.params.id as string

const { data: event, refresh: refreshEvent } = await useFetch(`/api/events/${eventId}`)
const { data: allUsers } = await useFetch('/api/users')

const tabs = ['Criteria', 'Contestants', 'Judges', 'Results'] as const
const activeTab = ref<typeof tabs[number]>('Criteria')

const statusModel = ref(event.value?.status ?? 'DRAFT')
watch(event, (v) => { if (v) statusModel.value = v.status })

const criterias = computed(() => event.value?.criterias ?? [])
const contestants = computed(() => event.value?.contestants ?? [])
const totalWeight = computed(() => criterias.value.reduce((s, c) => s + c.weight, 0))

const availableJudges = computed(() => {
  const assignedIds = new Set((event.value?.judges ?? []).map((j) => j.judgeId))
  return (allUsers.value ?? []).filter((u) => u.role === 'JUDGE' && !assignedIds.has(u.id))
})

async function updateStatus() {
  await $fetch(`/api/events/${eventId}`, { method: 'PATCH', body: { status: statusModel.value } })
  await refreshEvent()
}

async function removeEvent() {
  if (!confirm(`Delete "${event.value?.name}"? This removes all its data.`)) return
  await $fetch(`/api/events/${eventId}`, { method: 'DELETE' })
  await navigateTo('/admin')
}

const criteriaForm = reactive({ name: '', weight: 0 })
async function addCriteria() {
  await $fetch(`/api/events/${eventId}/criterias`, {
    method: 'POST',
    body: { name: criteriaForm.name, weight: criteriaForm.weight, order: criterias.value.length },
  })
  criteriaForm.name = ''
  criteriaForm.weight = 0
  await refreshEvent()
}
async function deleteCriteria(id: string) {
  await $fetch(`/api/events/${eventId}/criterias/${id}`, { method: 'DELETE' })
  await refreshEvent()
}

const contestantForm = reactive({ number: undefined as number | undefined, name: '' })
const contestantError = ref('')
async function addContestant() {
  contestantError.value = ''
  try {
    await $fetch(`/api/events/${eventId}/contestants`, { method: 'POST', body: { ...contestantForm } })
    contestantForm.number = undefined
    contestantForm.name = ''
    await refreshEvent()
  } catch (e: any) {
    contestantError.value = e?.data?.statusMessage || 'Failed to add contestant'
  }
}
async function deleteContestant(id: string) {
  await $fetch(`/api/events/${eventId}/contestants/${id}`, { method: 'DELETE' })
  await refreshEvent()
}

const selectedJudgeId = ref('')
async function assignJudge() {
  await $fetch(`/api/events/${eventId}/judges`, { method: 'POST', body: { judgeId: selectedJudgeId.value } })
  selectedJudgeId.value = ''
  await refreshEvent()
}
async function unassignJudge(judgeId: string) {
  await $fetch(`/api/events/${eventId}/judges/${judgeId}`, { method: 'DELETE' })
  await refreshEvent()
}
</script>
