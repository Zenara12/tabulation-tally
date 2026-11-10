<template>
  <div class="w-full px-4 py-6 sm:px-6 lg:px-10 lg:py-10 max-w-7xl">
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

        <!-- Scoring cards -->
      <template v-else>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate">
            <span>{{ contestants.length }} contestants</span>
            <span>{{ criterias.length }} criteria</span>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <span v-if="savedAt" class="text-xs text-teal">Saved {{ savedAt }}</span>
            <AppButton
              color="teal"
              size="sm"
              class="w-full sm:w-auto"
              :disabled="saving"
              @click="saveAll"
            >
              {{ saving ? 'Saving...' : 'Save scores' }}
            </AppButton>
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

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard
            v-for="contestant in contestants"
            :key="contestant.id"
            :contestant="contestant"
            :criterias="criterias"
            :scores="localScores"
            @update-score="setScore(contestant.id, $event.criteriaId, $event.value)"
            @open-image="openImage"
          />
        </div>

        <div class="flex justify-end mt-6">
          <AppButton
            color="teal"
            class="px-6"
            :disabled="saving"
            @click="saveAll"
          >
            {{ saving ? 'Saving...' : 'Save all scores' }}
          </AppButton>
        </div>
      </template>

      <Teleport to="body">
        <div
          v-if="previewImage"
          class="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-3 py-4 sm:px-4 sm:py-6"
          @click.self="closeImage"
        >
          <div class="relative w-full max-w-4xl max-h-[calc(100dvh-2rem)] rounded-2xl bg-paper shadow-2xl overflow-hidden">
            <div class="flex items-center justify-between gap-4 border-b border-ink/10 px-4 py-3">
              <div class="min-w-0">
                <p class="font-medium text-ink">Reference image</p>
                <p class="truncate text-xs text-slate">{{ previewLabel }}</p>
              </div>
              <AppButton
                color="transparent"
                variant="ghost"
                size="xs"
                :hover="false"
                class="px-3 hover:bg-ink/5 hover:text-ink"
                @click="closeImage"
              >
                Close
              </AppButton>
            </div>
            <div class="bg-black flex items-center justify-center p-3 sm:p-6">
              <img
                :src="previewImage"
                :alt="previewLabel"
                class="max-h-[calc(100dvh-8rem)] w-full object-contain rounded-lg"
              >
            </div>
          </div>
        </div>
      </Teleport>
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
function setScore(contestantId: string, criteriaId: string, value: number) {
  localScores[key(contestantId, criteriaId)] = value
}

const saving = ref(false)
const saveError = ref('')
const savedAt = ref('')
const previewImage = ref('')
const previewLabel = ref('')

function openImage(src: string, label: string) {
  previewImage.value = src
  previewLabel.value = label
}

function closeImage() {
  previewImage.value = ''
  previewLabel.value = ''
}

function handlePreviewKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && previewImage.value) {
    closeImage()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handlePreviewKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handlePreviewKeydown)
})

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
    saveError.value = errors[0] || ''
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
