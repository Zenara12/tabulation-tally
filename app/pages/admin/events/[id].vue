<template>
  <div v-if="event" class="px-4 py-6 sm:px-6 lg:px-10 lg:py-10 max-w-5xl mx-auto">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-2">
      <div>
        <NuxtLink to="/admin" class="text-xs text-slate hover:text-ink">Back to all events</NuxtLink>
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

    <div class="flex gap-1 border-b border-ink/10 mb-6 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap"
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

      <div class="overflow-x-auto rounded-lg border border-ink/10 bg-white">
        <table class="w-full min-w-[520px] text-sm">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wider text-slate-soft border-b border-ink/10">
              <th class="p-2.5 font-medium">Criteria</th>
              <th class="p-2.5 font-medium w-32">Weight (%)</th>
              <th class="p-2.5 font-medium w-16 text-right"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in criterias" :key="c.id" class="border-b border-ink/5">
              <td class="p-2.5 text-ink">{{ c.name }}</td>
              <td class="p-2.5 tabular">{{ c.weight }}</td>
              <td class="p-2.5 text-right">
                <button class="text-crimson hover:underline text-xs" @click="deleteCriteria(c.id)">Remove</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <form class="flex flex-col sm:flex-row gap-2 sm:items-end pt-2" @submit.prevent="addCriteria">
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate mb-1">Criteria name</label>
          <input v-model="criteriaForm.name" required class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
        </div>
        <div class="w-full sm:w-28">
          <label class="block text-xs font-medium text-slate mb-1">Weight %</label>
          <input v-model.number="criteriaForm.weight" type="number" min="0" max="100" required class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
        </div>
        <button type="submit" class="rounded-md bg-ink text-paper text-sm font-medium px-4 py-2 hover:bg-ink-soft">Add</button>
      </form>
    </div>

    <!-- Contestants -->
    <div v-else-if="activeTab === 'Contestants'" class="space-y-5">
      <div class="overflow-x-auto rounded-lg border border-ink/10 bg-white">
        <table class="w-full min-w-[760px] text-sm">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wider text-slate-soft border-b border-ink/10">
              <th class="p-2.5 font-medium w-12">No.</th>
              <th class="p-2.5 font-medium">Name</th>
              <th class="p-2.5 font-medium">Alias</th>
              <th class="p-2.5 font-medium">Character</th>
              <th class="p-2.5 font-medium w-20">Reference</th>
              <th class="p-2.5 font-medium w-16 text-right"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in contestants" :key="c.id" class="border-b border-ink/5">
              <td class="p-2.5 tabular text-slate-soft font-medium">{{ c.number }}</td>
              <td class="p-2.5 text-ink font-medium">{{ c.name }}</td>
              <td class="p-2.5 text-slate text-sm">{{ c.alias || '—' }}</td>
              <td class="p-2.5 text-slate text-sm">{{ c.characterName || '—' }}</td>
              <td class="p-2.5">
                <img
                  v-if="c.cosplayPictureUrl"
                  :src="c.cosplayPictureUrl"
                  class="w-10 h-10 rounded object-cover border border-ink/10"
                  alt="reference"
                >
                <span v-else class="text-slate-soft text-xs">—</span>
              </td>
              <td class="py-2.5 text-right">
                <button class="text-crimson hover:underline text-xs" @click="deleteContestant(c.id)">Remove</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add contestant form -->
      <div class="border border-ink/10 rounded-lg p-5 bg-white space-y-4">
        <p class="text-sm font-medium text-ink">
          Add contestant
          <span class="text-slate-soft font-normal ml-1">- will be assigned No. {{ nextNumber }}</span>
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-xs font-medium text-slate mb-1">Full name <span class="text-crimson">*</span></label>
            <input
              v-model="contestantForm.name"
              required
              placeholder="e.g. Maria Santos"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50"
            >
          </div>

          <div>
            <label class="block text-xs font-medium text-slate mb-1">Alias / cosplayer alias</label>
            <input
              v-model="contestantForm.alias"
              placeholder="e.g. Rin"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50"
            >
          </div>

          <div>
            <label class="block text-xs font-medium text-slate mb-1">Character name</label>
            <input
              v-model="contestantForm.characterName"
              placeholder="e.g. Makima"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50"
            >
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-medium text-slate mb-1">Cosplay reference image</label>
            <div class="flex flex-col sm:flex-row items-start gap-4">
              <label
                class="flex flex-col items-center justify-center w-28 h-28 rounded-lg border-2 border-dashed border-ink/15 cursor-pointer hover:border-brass/60 transition-colors shrink-0"
                :class="imagePreview ? 'border-teal/40' : ''"
              >
                <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover rounded-lg" alt="preview">
                <template v-else>
                  <svg class="w-6 h-6 text-slate-soft mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  <span class="text-[10px] text-slate-soft text-center leading-tight">Upload<br>image</span>
                </template>
                <input type="file" accept="image/*" class="sr-only" @change="onImagePick">
              </label>
              <div class="flex-1 text-xs text-slate-soft pt-1 space-y-1">
                <p>Accepted: JPG, PNG, WebP, GIF</p>
                <p>Recommended: square or portrait, under 2 MB</p>
                <p>This image is used as a reference for judges.</p>
                <button v-if="imagePreview" type="button" class="text-crimson hover:underline mt-1" @click="clearImage">
                  Remove image
                </button>
              </div>
            </div>
          </div>
        </div>

        <p v-if="contestantError" class="text-sm text-crimson">{{ contestantError }}</p>

        <div class="flex justify-end pt-1">
          <button
            :disabled="!contestantForm.name || addingContestant"
            class="rounded-md bg-ink text-paper text-sm font-medium px-5 py-2.5 hover:bg-ink-soft disabled:opacity-60 transition-colors"
            @click="addContestant"
          >
            {{ addingContestant ? 'Adding...' : `Add as Contestant No. ${nextNumber}` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Judges -->
    <div v-else-if="activeTab === 'Judges'" class="space-y-4">
      <div class="overflow-x-auto rounded-lg border border-ink/10 bg-white">
        <table class="w-full min-w-[520px] text-sm">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wider text-slate-soft border-b border-ink/10">
              <th class="p-2.5 font-medium">Name</th>
              <th class="p-2.5 font-medium">Email</th>
              <th class="p-2.5 font-medium w-16 text-right"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="j in event.judges" :key="j.id" class="border-b border-ink/5">
              <td class="p-2.5 text-ink">{{ j.judge.name }}</td>
              <td class="p-2.5 text-slate">{{ j.judge.email }}</td>
              <td class="p-2.5 text-right">
                <button class="text-crimson hover:underline text-xs" @click="unassignJudge(j.judgeId)">Remove</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <form class="flex flex-col sm:flex-row gap-2 sm:items-end pt-2" @submit.prevent="assignJudge">
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate mb-1">Assign judge</label>
          <select v-model="selectedJudgeId" class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
            <option value="" disabled>Select a judge...</option>
            <option v-for="j in availableJudges" :key="j.id" :value="j.id">{{ j.name }} ({{ j.email }})</option>
          </select>
        </div>
        <button type="submit" :disabled="!selectedJudgeId" class="rounded-md bg-ink text-paper text-sm font-medium px-4 py-2 hover:bg-ink-soft disabled:opacity-60">Assign</button>
      </form>
    </div>

    <!-- Results -->
    <div v-else-if="activeTab === 'Results'">
      <EventLeaderboard :event-id="eventId" :event-name="event.name" />
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
const nextNumber = computed(() => {
  if (!contestants.value.length) return 1
  return Math.max(...contestants.value.map((c) => c.number)) + 1
})

const availableJudges = computed(() => {
  const assignedIds = new Set((event.value?.judges ?? []).map((j) => j.judgeId))
  return (allUsers.value ?? []).filter((u: any) => u.role === 'JUDGE' && !assignedIds.has(u.id))
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

// Criteria
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

// Contestants
const contestantForm = reactive({ name: '', alias: '', characterName: '' })
const contestantError = ref('')
const addingContestant = ref(false)
const imagePreview = ref<string | null>(null)
const imageDataUrl = ref<string | null>(null)

function onImagePick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const result = ev.target?.result as string
    imagePreview.value = result
    imageDataUrl.value = result
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  imagePreview.value = null
  imageDataUrl.value = null
}

async function addContestant() {
  contestantError.value = ''
  addingContestant.value = true
  try {
    await $fetch(`/api/events/${eventId}/contestants`, {
      method: 'POST',
      body: {
        name: contestantForm.name,
        alias: contestantForm.alias || undefined,
        characterName: contestantForm.characterName || undefined,
        cosplayPictureUrl: imageDataUrl.value || undefined,
      },
    })
    contestantForm.name = ''
    contestantForm.alias = ''
    contestantForm.characterName = ''
    clearImage()
    await refreshEvent()
  } catch (e: any) {
    contestantError.value = e?.data?.statusMessage || 'Failed to add contestant'
  } finally {
    addingContestant.value = false
  }
}

async function deleteContestant(id: string) {
  await $fetch(`/api/events/${eventId}/contestants/${id}`, { method: 'DELETE' })
  await refreshEvent()
}

// Judges
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
