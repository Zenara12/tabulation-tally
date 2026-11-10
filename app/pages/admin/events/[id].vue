<template>
  <div v-if="event" class="w-full px-4 py-6 sm:px-6 lg:px-10 lg:py-10 max-w-7xl">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-2">
      <div>
        <NuxtLink to="/admin" class="text-xs text-slate hover:text-ink">Back to all events</NuxtLink>
        <h1 class="font-display text-3xl text-ink mt-1">{{ event.name }}</h1>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select
          v-model="statusModel"
          class="select-menu w-full sm:w-auto text-sm rounded-md border px-3 py-2"
          @change="updateStatus"
        >
          <option value="DRAFT">Draft</option>
          <option value="OPEN">Open for scoring</option>
          <option value="CLOSED">Closed</option>
        </select>
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md text-crimson transition-colors hover:bg-crimson/10 disabled:opacity-50"
          title="Delete event"
          aria-label="Delete event"
          @click="removeEvent"
        >
          <Icon name="lucide:trash-2" class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
    <p v-if="event.description" class="text-sm text-slate mb-8">{{ event.description }}</p>
    <div v-else class="mb-8" />

    <div class="w-full pb-2 sm:w-auto">
      <label for="event-tabs" class="sr-only">Select Option</label>
      <select id="event-tabs" 
        v-model="activeTab"
        class="select-menu w-full rounded-md border px-3 py-2.5 text-sm font-medium sm:min-w-64">
        <option 
          v-for="(tab, index) in tabs" 
          :key="index" 
          :value="tab">
          {{ tab }}
        </option>
      </select>
    </div>

    <!-- Criteria -->
    <div v-if="activeTab === 'Criteria'" class="space-y-4">
      <p class="text-xs text-slate">
        Weights should total 100%. Current total:
        <span class="tabular font-medium" :class="totalWeight === 100 ? 'text-teal' : 'text-crimson'">{{ totalWeight }}%</span>
      </p>

      <AdminDataTable
        :columns="criteriaTableColumns"
        :rows="criterias"
        empty-text="No criteria added yet."
      >
        <template #cell-name="{ value }">
          <span class="text-ink">{{ value }}</span>
        </template>
        <template #cell-weight="{ value }">
          <span class="tabular">{{ value }}</span>
        </template>
        <template #cell-actions="{ row }">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-crimson transition-colors hover:bg-crimson/10"
            title="Remove criteria"
            aria-label="Remove criteria"
            @click="deleteCriteria(row.id)"
          >
            <Icon name="lucide:trash-2" class="h-4 w-4" aria-hidden="true" />
          </button>
        </template>
      </AdminDataTable>

      <form class="flex flex-col sm:flex-row gap-2 sm:items-end pt-2" @submit.prevent="addCriteria">
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate mb-1">Criteria name</label>
          <input v-model="criteriaForm.name" required class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
        </div>
        <div class="w-full sm:w-28">
          <label class="block text-xs font-medium text-slate mb-1">Weight %</label>
          <input v-model.number="criteriaForm.weight" type="number" min="0" max="100" required class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
        </div>
          <button type="submit" class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft sm:w-auto">
            <Icon name="lucide:plus" class="h-4 w-4" aria-hidden="true" />
            Add
          </button>
      </form>
    </div>

    <!-- Contestants -->
    <div v-else-if="activeTab === 'Contestants'" class="space-y-5">
      <AdminDataTable
        :columns="contestantTableColumns"
        :rows="contestants"
        empty-text="No contestants added yet."
      >
        <template #cell-number="{ value }">
          <span class="tabular font-medium text-slate-soft">{{ value }}</span>
        </template>
        <template #cell-name="{ value }">
          <span class="font-medium text-ink">{{ value }}</span>
        </template>
        <template #cell-alias="{ value }">
          <span class="text-sm text-slate">{{ value || '—' }}</span>
        </template>
        <template #cell-characterName="{ value }">
          <span class="text-sm text-slate">{{ value || '—' }}</span>
        </template>
        <template #cell-cosplayPictureUrl="{ row }">
          <img
            v-if="row.cosplayPictureUrl"
            :src="row.cosplayPictureUrl"
            class="h-10 w-10 rounded border border-ink/10 object-cover"
            alt="reference"
          >
          <span v-else class="text-xs text-slate-soft">—</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate transition-colors hover:bg-paper hover:text-ink"
              title="Edit contestant"
              aria-label="Edit contestant"
              @click="openEditContestant(row)"
            >
              <Icon name="lucide:pencil" class="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-md text-crimson transition-colors hover:bg-crimson/10"
              title="Remove contestant"
              aria-label="Remove contestant"
              @click="deleteContestant(row.id)"
            >
              <Icon name="lucide:trash-2" class="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </template>
      </AdminDataTable>

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
                <p>Converted to WebP and compressed under 2 MB before upload</p>
                <p>This image is used as a reference for judges.</p>
                <p v-if="imageProcessing" class="text-teal">Converting and compressing image...</p>
                <button v-if="imagePreview" type="button" class="text-crimson hover:underline mt-1" @click="clearImage">
                  <Icon name="lucide:image-off" class="mr-1 inline-block h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
                  Remove image
                </button>
              </div>
            </div>
          </div>
        </div>

        <p v-if="contestantError" class="text-sm text-crimson">{{ contestantError }}</p>

        <div class="flex justify-stretch sm:justify-end pt-1">
          <button
            :disabled="!contestantForm.name || addingContestant || imageProcessing"
            class="w-full sm:w-auto rounded-md bg-ink text-paper text-sm font-medium px-5 py-2.5 hover:bg-ink-soft disabled:opacity-60 transition-colors"
            @click="addContestant"
          >
            <Icon :name="imageProcessing || addingContestant ? 'lucide:loader-circle' : 'lucide:user-plus'" class="h-4 w-4" :class="imageProcessing || addingContestant ? 'animate-spin' : ''" aria-hidden="true" />
            {{ imageProcessing ? 'Processing image...' : addingContestant ? 'Adding...' : `Add as Contestant No. ${nextNumber}` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Judges -->
    <div v-else-if="activeTab === 'Judges'" class="space-y-4">
      <AdminDataTable
        :columns="judgeTableColumns"
        :rows="judgeTableRows"
        empty-text="No judges assigned yet."
      >
        <template #cell-name="{ value }">
          <span class="text-ink">{{ value }}</span>
        </template>
        <template #cell-email="{ value }">
          <span class="text-slate">{{ value }}</span>
        </template>
        <template #cell-actions="{ row }">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-md text-crimson transition-colors hover:bg-crimson/10"
            title="Remove judge"
            aria-label="Remove judge"
            @click="unassignJudge(row.judgeId)"
          >
            <Icon name="lucide:user-minus" class="h-4 w-4" aria-hidden="true" />
          </button>
        </template>
      </AdminDataTable>

      <form class="flex flex-col sm:flex-row gap-2 sm:items-end pt-2" @submit.prevent="assignJudge">
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate mb-1">Assign judge</label>
          <select v-model="selectedJudgeId" class="select-menu w-full rounded-md border px-3 py-2 text-sm">
            <option value="" disabled>Select a judge...</option>
            <option v-for="j in availableJudges" :key="j.id" :value="j.id">{{ j.name }} ({{ j.email }})</option>
          </select>
        </div>
        <button type="submit" :disabled="!selectedJudgeId" class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft disabled:opacity-60 sm:w-auto">
          <Icon name="lucide:user-plus" class="h-4 w-4" aria-hidden="true" />
          Assign
        </button>
      </form>
    </div>

    <!-- Results -->
    <div v-else-if="activeTab === 'Results'">
      <EventLeaderboard :event-id="eventId" :event-name="event.name" />
    </div>

    <ConfirmationModal
      :open="Boolean(pendingConfirmation)"
      :title="pendingConfirmation?.title"
      :message="pendingConfirmation?.message || ''"
      :confirm-text="pendingConfirmation?.confirmText"
      cancel-text="Cancel"
      :busy="confirming"
      @confirm="confirmPendingAction"
      @cancel="pendingConfirmation = null"
    />

    <ContestantEditModal
      :open="Boolean(editingContestant)"
      :contestant="editingContestant"
      :busy="updatingContestant"
      :error="contestantUpdateError"
      @save="saveContestant"
      @cancel="closeEditContestant"
    />
  </div>
</template>

<script setup lang="ts">
import imageCompression from 'browser-image-compression'
import { onBeforeUnmount } from 'vue'

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
const criteriaTableColumns = [
  { key: 'name', label: 'Criteria' },
  { key: 'weight', label: 'Weight (%)', headerClass: 'w-32' },
  { key: 'actions', label: '', headerClass: 'w-16 text-right', cellClass: 'text-right' },
]
const contestantTableColumns = [
  { key: 'number', label: 'No.', headerClass: 'w-12' },
  { key: 'name', label: 'Name' },
  { key: 'alias', label: 'Alias' },
  { key: 'characterName', label: 'Character' },
  { key: 'cosplayPictureUrl', label: 'Reference', headerClass: 'w-20' },
  { key: 'actions', label: '', headerClass: 'w-16 text-right', cellClass: 'text-right' },
]
const judgeTableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'actions', label: '', headerClass: 'w-16 text-right', cellClass: 'text-right' },
]
const judgeTableRows = computed(() => (event.value?.judges ?? []).map((assignment) => ({
  ...assignment,
  name: assignment.judge.name,
  email: assignment.judge.email,
})))
const nextNumber = computed(() => {
  if (!contestants.value.length) return 1
  return Math.max(...contestants.value.map((c) => c.number)) + 1
})

const availableJudges = computed(() => {
  const assignedIds = new Set((event.value?.judges ?? []).map((j) => j.judgeId))
  return (allUsers.value ?? []).filter((u: any) => u.role === 'JUDGE' && !assignedIds.has(u.id))
})

type ConfirmationAction = 'event' | 'criteria' | 'contestant' | 'judge'
type PendingConfirmation = {
  action: ConfirmationAction
  id?: string
  title: string
  message: string
  confirmText: string
}

const pendingConfirmation = ref<PendingConfirmation | null>(null)
const confirming = ref(false)

type EditableContestant = {
  id: string
  name: string
  alias?: string | null
  characterName?: string | null
  cosplayPictureUrl?: string | null
}

type ContestantEditPayload = {
  name: string
  alias: string
  characterName: string
  image: File | null
  removeImage: boolean
}

const editingContestant = ref<EditableContestant | null>(null)
const updatingContestant = ref(false)
const contestantUpdateError = ref('')

function openEditContestant(contestant: EditableContestant) {
  contestantUpdateError.value = ''
  editingContestant.value = contestant
}

function closeEditContestant() {
  if (updatingContestant.value) return
  editingContestant.value = null
  contestantUpdateError.value = ''
}

async function saveContestant(payload: ContestantEditPayload) {
  const contestant = editingContestant.value
  if (!contestant) return

  updatingContestant.value = true
  contestantUpdateError.value = ''

  try {
    const body = new FormData()
    body.append('name', payload.name)
    body.append('alias', payload.alias)
    body.append('characterName', payload.characterName)
    if (payload.image) body.append('image', payload.image)
    if (payload.removeImage) body.append('removeImage', 'true')

    await $fetch(`/api/events/${eventId}/contestants/${contestant.id}`, {
      method: 'PATCH',
      body,
    })

    await refreshEvent()
    editingContestant.value = null
    contestantUpdateError.value = ''
  } catch (error: any) {
    contestantUpdateError.value = error?.data?.statusMessage || 'Failed to update contestant'
  } finally {
    updatingContestant.value = false
  }
}

function requestConfirmation(action: ConfirmationAction, id?: string) {
  if (action === 'event') {
    pendingConfirmation.value = {
      action,
      title: 'Delete event?',
      message: `Are you sure you want to delete "${event.value?.name}"? This removes all its data.`,
      confirmText: 'Delete event',
    }
    return
  }

  if (action === 'criteria') {
    const criteria = criterias.value.find((item) => item.id === id)
    pendingConfirmation.value = {
      action,
      id,
      title: 'Remove criteria?',
      message: `Are you sure you want to remove "${criteria?.name || 'this criteria'}"?`,
      confirmText: 'Remove',
    }
    return
  }

  if (action === 'contestant') {
    const contestant = contestants.value.find((item) => item.id === id)
    pendingConfirmation.value = {
      action,
      id,
      title: 'Delete contestant?',
      message: `Are you sure you want to delete contestant "${contestant?.name || 'this contestant'}"?`,
      confirmText: 'Delete contestant',
    }
    return
  }

  const judge = event.value?.judges.find((item) => item.judgeId === id)
  pendingConfirmation.value = {
    action,
    id,
    title: 'Remove judge?',
    message: `Are you sure you want to remove ${judge?.judge.name || 'this judge'} from the event?`,
    confirmText: 'Remove judge',
  }
}

async function updateStatus() {
  await $fetch(`/api/events/${eventId}`, { method: 'PATCH', body: { status: statusModel.value } })
  await refreshEvent()
}

async function removeEvent() {
  requestConfirmation('event')
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
  requestConfirmation('criteria', id)
}

// Contestants
const contestantForm = reactive({ name: '', alias: '', characterName: '' })
const contestantError = ref('')
const addingContestant = ref(false)
const imagePreview = ref<string | null>(null)
const compressedImage = ref<File | null>(null)
const imageProcessing = ref(false)
const MAX_IMAGE_BYTES = 2 * 1024 * 1024

async function onImagePick(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  contestantError.value = ''
  imageProcessing.value = true
  try {
    const compressed = await imageCompression(file, {
      fileType: 'image/webp',
      initialQuality: 0.82,
      maxIteration: 10,
      maxSizeMB: 1.95,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
    })

    if (compressed.size >= MAX_IMAGE_BYTES) {
      throw new Error('The image could not be compressed under 2 MB')
    }

    clearImage()
    compressedImage.value = new File(
      [compressed],
      `${file.name.replace(/\.[^/.]+$/, '') || 'contestant'}.webp`,
      { type: 'image/webp', lastModified: Date.now() },
    )
    imagePreview.value = URL.createObjectURL(compressedImage.value)
  } catch {
    clearImage()
    contestantError.value = 'Failed to convert and compress the selected image.'
  } finally {
    imageProcessing.value = false
  }
}

function clearImage() {
  if (imagePreview.value?.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)
  imagePreview.value = null
  compressedImage.value = null
}

onBeforeUnmount(clearImage)

async function addContestant() {
  contestantError.value = ''
  addingContestant.value = true
  try {
    const body = new FormData()
    body.append('name', contestantForm.name)
    if (contestantForm.alias) body.append('alias', contestantForm.alias)
    if (contestantForm.characterName) body.append('characterName', contestantForm.characterName)
    if (compressedImage.value) body.append('image', compressedImage.value)

    await $fetch(`/api/events/${eventId}/contestants`, {
      method: 'POST',
      body,
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
  requestConfirmation('contestant', id)
}

// Judges
const selectedJudgeId = ref('')
async function assignJudge() {
  await $fetch(`/api/events/${eventId}/judges`, { method: 'POST', body: { judgeId: selectedJudgeId.value } })
  selectedJudgeId.value = ''
  await refreshEvent()
}
async function unassignJudge(judgeId: string) {
  requestConfirmation('judge', judgeId)
}

async function confirmPendingAction() {
  const confirmation = pendingConfirmation.value
  if (!confirmation) return

  confirming.value = true
  try {
    if (confirmation.action === 'event') {
      await $fetch(`/api/events/${eventId}`, { method: 'DELETE' })
      await navigateTo('/admin')
    } else if (confirmation.action === 'criteria') {
      await $fetch(`/api/events/${eventId}/criterias/${confirmation.id}`, { method: 'DELETE' })
      await refreshEvent()
    } else if (confirmation.action === 'contestant') {
      await $fetch(`/api/events/${eventId}/contestants/${confirmation.id}`, { method: 'DELETE' })
      await refreshEvent()
    } else if (confirmation.action === 'judge') {
      await $fetch(`/api/events/${eventId}/judges/${confirmation.id}`, { method: 'DELETE' })
      await refreshEvent()
    }
    pendingConfirmation.value = null
  } finally {
    confirming.value = false
  }
}
</script>
