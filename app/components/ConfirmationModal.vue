<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 px-4 py-4 sm:py-6"
      role="presentation"
      @click.self="cancel"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="messageId"
      >
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crimson/10 text-crimson" aria-hidden="true">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 3 2.8 20h18.4L12 3Z" />
              <path d="M12 9v4m0 3h.01" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <h2 :id="titleId" class="text-lg font-semibold text-ink">{{ title }}</h2>
            <p :id="messageId" class="mt-2 text-sm leading-6 text-slate">{{ message }}</p>
          </div>
        </div>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-medium text-slate transition-colors hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            :disabled="busy"
            @click="cancel"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            class="w-full rounded-lg bg-crimson px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-crimson/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            :disabled="busy"
            @click="confirm"
          >
            {{ busy ? 'Please wait…' : confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  busy?: boolean
}>(), {
  title: 'Confirm action',
  confirmText: 'Yes',
  cancelText: 'No',
  busy: false,
})

const emit = defineEmits<{
  (event: 'confirm'): void
  (event: 'cancel'): void
}>()

const titleId = `confirmation-modal-title-${useId()}`
const messageId = `confirmation-modal-message-${useId()}`

function cancel() {
  if (!props.busy) emit('cancel')
}

function confirm() {
  if (!props.busy) emit('confirm')
}

function handleKeydown(event: KeyboardEvent) {
  if (props.open && event.key === 'Escape' && !props.busy) cancel()
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))
</script>
