<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 px-4 py-4 sm:py-6"
      role="presentation"
      @click.self="cancel"
    >
      <form
        class="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @submit.prevent="submit"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 :id="titleId" class="text-lg font-semibold text-ink">Edit criteria</h2>
            <p class="mt-1 text-sm text-slate">Update the criteria name and weight.</p>
          </div>
          <button
            type="button"
            class="rounded-md p-1.5 text-slate-soft transition-colors hover:bg-paper hover:text-ink disabled:opacity-50"
            :disabled="busy"
            aria-label="Close edit criteria dialog"
            @click="cancel"
          >
            <Icon name="lucide:x" class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div class="mt-5 space-y-4">
          <div>
            <label :for="`${titleId}-name`" class="mb-1 block text-xs font-medium text-slate">Criteria name</label>
            <input
              :id="`${titleId}-name`"
              v-model="form.name"
              required
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50"
            >
          </div>

          <div>
            <label :for="`${titleId}-weight`" class="mb-1 block text-xs font-medium text-slate">Weight %</label>
            <input
              :id="`${titleId}-weight`"
              v-model.number="form.weight"
              type="number"
              min="0"
              :max="maxWeight"
              step="0.01"
              required
              class="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50"
            >
            <p class="mt-1 text-xs text-slate-soft">Maximum allowed: {{ maxWeight }}%</p>
          </div>
        </div>

        <p v-if="error" class="mt-4 text-sm text-crimson">{{ error }}</p>

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
            class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            :disabled="busy || !form.name.trim() || !Number.isFinite(form.weight) || form.weight < 0 || form.weight > maxWeight"
          >
            <Icon :name="busy ? 'lucide:loader-circle' : 'lucide:save'" class="h-4 w-4" :class="busy ? 'animate-spin' : ''" aria-hidden="true" />
            {{ busy ? 'Saving...' : 'Save changes' }}
          </button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
type Criteria = {
  id: string
  name: string
  weight: number
}

const props = withDefaults(defineProps<{
  open: boolean
  criteria?: Criteria | null
  maxWeight: number
  busy?: boolean
  error?: string
}>(), {
  criteria: null,
  busy: false,
  error: '',
})

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'save', payload: { name: string; weight: number }): void
}>()

const form = reactive({ name: '', weight: 0 })
const titleId = `criteria-edit-title-${useId()}`

watch(() => [props.open, props.criteria] as const, ([open]) => {
  if (open) {
    form.name = props.criteria?.name ?? ''
    form.weight = props.criteria?.weight ?? 0
  }
}, { immediate: true })

watch(() => props.maxWeight, (maxWeight) => {
  if (form.weight > maxWeight) form.weight = maxWeight
})

function cancel() {
  if (!props.busy) emit('cancel')
}

function submit() {
  if (props.busy || !form.name.trim() || !Number.isFinite(form.weight) || form.weight < 0 || form.weight > props.maxWeight) return
  emit('save', { name: form.name.trim(), weight: form.weight })
}

function handleKeydown(event: KeyboardEvent) {
  if (props.open && event.key === 'Escape' && !props.busy) cancel()
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))
</script>
