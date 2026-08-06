<template>
  <div class="px-4 py-6 sm:px-6 lg:px-10 lg:py-10 max-w-5xl mx-auto">
    <div v-if="pending" class="text-sm text-slate">Loading event...</div>

    <template v-else-if="event">
      <div class="mb-6">
        <NuxtLink to="/judge" class="text-xs text-slate hover:text-ink">Back to assigned events</NuxtLink>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 mt-1">
          <h1 class="font-display text-3xl text-ink">{{ event.name }}</h1>
          <span
            class="text-[10px] uppercase tracking-wider font-medium rounded-full px-2 py-0.5 w-fit"
            :class="statusClass(event.status)"
          >{{ event.status }}</span>
        </div>
        <p v-if="event.description" class="text-sm text-slate mt-1">{{ event.description }}</p>
      </div>

      <!-- Event not open -->
      <div
        v-if="event.status !== 'OPEN'"
        class="rounded-lg border border-dashed border-ink/15 py-12 text-center"
      >
        <p class="text-slate text-sm">
          {{ event.status === 'DRAFT' ? 'This event has not been opened for scoring yet.' : 'Scoring for this event has closed.' }}
        </p>
      </div>

      <!-- Scoring grid -->
      <template v-else>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate">
            <span>{{ contestants.length }} contestants</span>
            <span>{{ criterias.length }} criteria</span>
          </div>
          <div class="flex items-center gap-3">
            <span v-if="savedAt" class="text-xs text-teal">Saved {{ savedAt }}</span>
            <button
              :disabled="saving"
              class="rounded-md bg-teal text-paper text-sm font-medium px-4 py-2 hover:bg-teal-soft disabled:opacity-60 transition-colors"
              @click="saveAll"
            >
              {{ saving ? 'Saving...' : 'Save scores' }}
            </button>
          </div>
        </div>

        <p v-if="saveError" class="text-sm text-crimson mb-3">{{ saveError }}</p>

        <!-- Progress bar across all scoreable cells -->
        <div class="mb-6">
          <div class="flex justify-between text-xs text-slate mb-1">
            <span>Scoring progress</span>
            <span class="tabular">{{ filledCount }} / {{ totalCells }} cells</span>
          </div>
          <div class="h-1.5 rounded-full bg-ink/10 overflow-hidden">
            <div
              class="h-full bg-teal rounded-full transition-all duration-300"
              :style="{ width: progressPct + '%' }"
            />
          </div>
        </div>

        <div class="overflow-x-auto rounded-lg border border-ink/10 bg-white">
          <table class="w-full min-w-[860px] text-sm border-collapse">
            <thead>
              <tr>
                <th class="text-left py-3 pr-4 font-medium text-xs uppercase tracking-wider text-slate-soft border-b border-ink/10 w-56">
                  Contestant
                </th>
                <th
                  v-for="c in criterias"
                  :key="c.id"
                  class="text-right py-3 px-3 font-medium text-xs uppercase tracking-wider text-slate-soft border-b border-ink/10 w-36"
                >
                  {{ c.name }}
                  <span class="block normal-case tracking-normal text-slate-soft/60">{{ c.weight }}%</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contestant in contestants" :key="contestant.id" class="border-b border-ink/5 group">
                <td class="py-3 pr-4">
                  <div class="flex items-start gap-3">
                    <img
                      v-if="contestant.cosplayPictureUrl"
                      :src="contestant.cosplayPictureUrl"
                      class="w-10 h-10 rounded object-cover border border-ink/10 shrink-0"
                      :alt="contestant.characterName || contestant.alias || contestant.name"
                    >
                    <div>
                      <span class="font-medium text-ink">{{ contestant.name }}</span>
                      <span class="block text-xs tabular text-slate-soft">No. {{ contestant.number }}</span>
                      <span v-if="contestant.alias" class="block text-[10px] text-slate-soft/70 truncate max-w-[180px]">
                        Alias: {{ contestant.alias }}
                      </span>
                      <span v-if="contestant.characterName" class="block text-[10px] text-slate-soft/70 truncate max-w-[180px]">
                        Character: {{ contestant.characterName }}
                      </span>
                    </div>
                  </div>
                </td>
                <td v-for="criteria in criterias" :key="criteria.id" class="py-2 px-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    :value="getScore(contestant.id, criteria.id)"
                    class="w-full rounded border text-right tabular text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors"
                    :class="hasScore(contestant.id, criteria.id)
                      ? 'border-teal/30 bg-teal/5 text-ink'
                      : 'border-ink/15 bg-white text-ink'"
                    placeholder="-"
                    @change="setScore(contestant.id, criteria.id, Number(($event.target as HTMLInputElement).value))"
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end mt-6">
          <button
            :disabled="saving"
            class="rounded-md bg-teal text-paper text-sm font-medium px-6 py-2.5 hover:bg-teal-soft disabled:opacity-60 transition-colors"
            @click="saveAll"
          >
            {{ saving ? 'Saving...' : 'Save all scores' }}
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'judge' })

const route = useRoute()
const eventId = route.params.id as string

const { data: event, pending } = await useFetch(`/api/events/${eventId}`)
const { data: myScores, refresh: refreshScores } = await useFetch(`/api/events/${eventId}/scores`)

// Local score map: contestantId:criteriaId -> score value
const localScores = reactive<Record<string, number>>({})

// Populate local scores from server data once available
watch(myScores, (scores) => {
  if (!scores) return
  for (const s of scores) {
    localScores[`${s.contestantId}:${s.criteriaId}`] = s.score
  }
}, { immediate: true })

const contestants = computed(() => event.value?.contestants ?? [])
const criterias = computed(() => event.value?.criterias ?? [])

const totalCells = computed(() => contestants.value.length * criterias.value.length)
const filledCount = computed(() =>
  Object.values(localScores).filter((v) => v !== undefined && v !== null).length
)
const progressPct = computed(() =>
  totalCells.value === 0 ? 0 : Math.round((filledCount.value / totalCells.value) * 100)
)

function key(contestantId: string, criteriaId: string) {
  return `${contestantId}:${criteriaId}`
}
function getScore(contestantId: string, criteriaId: string) {
  return localScores[key(contestantId, criteriaId)] ?? ''
}
function hasScore(contestantId: string, criteriaId: string) {
  return key(contestantId, criteriaId) in localScores
}
function setScore(contestantId: string, criteriaId: string, value: number) {
  localScores[key(contestantId, criteriaId)] = value
}

const saving = ref(false)
const saveError = ref('')
const savedAt = ref('')

async function saveAll() {
  saving.value = true
  saveError.value = ''

  const entries = Object.entries(localScores)
  const errors: string[] = []

  await Promise.allSettled(
    entries.map(async ([k, score]) => {
      const [contestantId, criteriaId] = k.split(':')
      try {
        await $fetch(`/api/events/${eventId}/scores`, {
          method: 'POST',
          body: { contestantId, criteriaId, score },
        })
      } catch (e: any) {
        errors.push(e?.data?.statusMessage || `Failed to save score for ${k}`)
      }
    })
  )

  if (errors.length) {
    saveError.value = errors[0]
  } else {
    const now = new Date()
    savedAt.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    await refreshScores()
  }

  saving.value = false
}

function statusClass(status: string) {
  if (status === 'OPEN') return 'bg-teal/10 text-teal'
  if (status === 'CLOSED') return 'bg-crimson/10 text-crimson'
  return 'bg-slate/10 text-slate'
}
</script>
