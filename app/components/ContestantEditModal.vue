<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-ink/60 px-4 py-4 sm:py-6"
      role="presentation"
      @click.self="cancel"
    >
      <form
        class="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @submit.prevent="submit"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 :id="titleId" class="text-lg font-semibold text-ink">Edit contestant</h2>
            <p class="mt-1 text-sm text-slate">Update contestant details and reference image.</p>
          </div>
          <button
            type="button"
            class="rounded-md p-1.5 text-slate-soft transition-colors hover:bg-paper hover:text-ink disabled:opacity-50"
            :disabled="busy"
            aria-label="Close edit contestant dialog"
            @click="cancel"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label :for="`${titleId}-name`" class="mb-1 block text-xs font-medium text-slate">Full name</label>
            <input
              :id="`${titleId}-name`"
              v-model="form.name"
              required
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50"
            >
          </div>

          <div>
            <label :for="`${titleId}-alias`" class="mb-1 block text-xs font-medium text-slate">Alias / cosplayer alias</label>
            <input
              :id="`${titleId}-alias`"
              v-model="form.alias"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50"
            >
          </div>

          <div>
            <label :for="`${titleId}-character`" class="mb-1 block text-xs font-medium text-slate">Character name</label>
            <input
              :id="`${titleId}-character`"
              v-model="form.characterName"
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50"
            >
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-medium text-slate">Cosplay reference image</label>
            <div class="flex items-start gap-4">
              <label
                class="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-ink/15 transition-colors hover:border-brass/60"
                :class="imagePreview ? 'border-teal/40' : ''"
              >
                <img v-if="imagePreview" :src="imagePreview" class="h-full w-full object-cover" alt="contestant reference preview">
                <template v-else>
                  <svg class="mb-1 h-5 w-5 text-slate-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <span class="text-center text-[10px] leading-tight text-slate-soft">Upload<br>image</span>
                </template>
                <input type="file" accept="image/*" class="sr-only" :disabled="busy || imageProcessing" @change="onImagePick">
              </label>
              <div class="space-y-1 pt-1 text-xs text-slate-soft">
                <p>Accepted: JPG, PNG, WebP, GIF</p>
                <p>Converted to WebP and compressed under 2 MB</p>
                <p v-if="imageProcessing" class="text-teal">Processing image...</p>
                <button
                  v-if="imagePreview"
                  type="button"
                  class="mt-1 text-crimson hover:underline disabled:opacity-50"
                  :disabled="busy || imageProcessing"
                  @click="clearImage"
                >
                  Remove image
                </button>
              </div>
            </div>
          </div>
        </div>

        <p v-if="error || imageError" class="mt-4 text-sm text-crimson">{{ error || imageError }}</p>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-medium text-slate transition-colors hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            :disabled="busy"
            @click="cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            :disabled="busy || imageProcessing || !form.name.trim()"
          >
            {{ busy ? 'Saving...' : 'Save changes' }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import imageCompression from 'browser-image-compression'

type Contestant = {
  id: string
  name: string
  alias?: string | null
  characterName?: string | null
  cosplayPictureUrl?: string | null
}

const props = withDefaults(defineProps<{
  open: boolean
  contestant?: Contestant | null
  busy?: boolean
  error?: string
}>(), {
  contestant: null,
  busy: false,
  error: '',
})

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'save', payload: {
    name: string
    alias: string
    characterName: string
    image: File | null
    removeImage: boolean
  }): void
}>()

const form = reactive({ name: '', alias: '', characterName: '' })
const imagePreview = ref<string | null>(null)
const compressedImage = ref<File | null>(null)
const removeImage = ref(false)
const imageProcessing = ref(false)
const imageError = ref('')
const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const titleId = `contestant-edit-title-${useId()}`

watch(() => [props.open, props.contestant] as const, ([open]) => {
  if (open) syncForm()
}, { immediate: true })

function syncForm() {
  const contestant = props.contestant
  form.name = contestant?.name ?? ''
  form.alias = contestant?.alias ?? ''
  form.characterName = contestant?.characterName ?? ''
  revokePreview()
  imagePreview.value = contestant?.cosplayPictureUrl ?? null
  compressedImage.value = null
  removeImage.value = false
  imageError.value = ''
}

function revokePreview() {
  if (imagePreview.value?.startsWith('blob:')) URL.revokeObjectURL(imagePreview.value)
}

function clearImage() {
  revokePreview()
  imagePreview.value = null
  compressedImage.value = null
  removeImage.value = true
  imageError.value = ''
}

async function onImagePick(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  imageProcessing.value = true
  imageError.value = ''
  try {
    const compressed = await imageCompression(file, {
      fileType: 'image/webp',
      initialQuality: 0.82,
      maxIteration: 10,
      maxSizeMB: 1.95,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
    })

    if (compressed.size >= MAX_IMAGE_BYTES) throw new Error('The image could not be compressed under 2 MB')

    revokePreview()
    compressedImage.value = new File(
      [compressed],
      `${file.name.replace(/\.[^/.]+$/, '') || 'contestant'}.webp`,
      { type: 'image/webp', lastModified: Date.now() },
    )
    imagePreview.value = URL.createObjectURL(compressedImage.value)
    removeImage.value = false
  } catch {
    imageError.value = 'Failed to convert and compress the selected image.'
  } finally {
    imageProcessing.value = false
  }
}

function cancel() {
  if (!props.busy) emit('cancel')
}

function submit() {
  if (props.busy || imageProcessing.value || !form.name.trim()) return
  emit('save', {
    name: form.name.trim(),
    alias: form.alias.trim(),
    characterName: form.characterName.trim(),
    image: compressedImage.value,
    removeImage: removeImage.value,
  })
}

function handleKeydown(event: KeyboardEvent) {
  if (props.open && event.key === 'Escape' && !props.busy) cancel()
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  revokePreview()
})
</script>
