<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md px-3 pb-3 md:hidden"
    aria-label="Mobile navigation"
  >
    <div class="relative grid rounded-2xl border border-ink/10 bg-ink px-2 py-2 shadow-[0_-8px_30px_rgba(18,22,31,0.16)]">
      <div class="grid" :class="links.length === 1 ? 'grid-cols-2' : 'grid-cols-3'">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-medium text-slate-soft transition-colors hover:bg-white/5 hover:text-paper"
          active-class="!bg-white/10 !text-brass"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <template v-if="link.icon === 'dashboard'">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </template>
            <template v-else>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </template>
          </svg>
          <span>{{ link.label }}</span>
        </NuxtLink>

        <button
          type="button"
          class="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-medium transition-colors hover:bg-white/5"
          :class="settingsOpen ? 'bg-white/10 text-brass' : 'text-slate-soft hover:text-paper'"
          :aria-expanded="settingsOpen"
          aria-haspopup="menu"
          @click.stop="settingsOpen = !settingsOpen"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15a1.7 1.7 0 0 0-1.56-1.03H6.7v-2.4h.2a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56v-.2h2.4v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.2v2.4h-.2A1.7 1.7 0 0 0 19.4 15Z" />
          </svg>
          <span>Settings</span>
        </button>
      </div>

      <div
        v-if="settingsOpen"
        class="absolute bottom-full right-3 mb-3 w-64 overflow-hidden rounded-xl border border-ink/10 bg-white text-ink shadow-xl"
        role="menu"
        aria-label="Account settings"
        @click.stop
      >
        <div class="border-b border-ink/10 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-soft">User</p>
          <p class="mt-1 truncate text-sm font-medium text-ink">{{ user?.name || 'Account' }}</p>
          <p class="truncate text-xs text-slate">{{ user?.email }}</p>
        </div>
        <div class="p-1.5">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate transition-colors hover:bg-paper hover:text-ink"
            role="menuitem"
            @click="settingsOpen = false"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
            <span>User</span>
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-crimson transition-colors hover:bg-crimson/5"
            role="menuitem"
            @click="logout"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5M21 12H9" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
type Role = 'ADMIN' | 'JUDGE'
type NavIcon = 'dashboard' | 'users'

const props = defineProps<{ role: Role }>()
const { user, clear } = useUserSession()
const settingsOpen = ref(false)

const links = computed<Array<{ to: string; label: string; icon: NavIcon }>>(() => {
  if (props.role === 'ADMIN') {
    return [
      { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
      { to: '/admin/users', label: 'Judges & Admin', icon: 'users' },
    ]
  }

  return [{ to: '/judge', label: 'Dashboard', icon: 'dashboard' }]
})

function closeOnOutsideClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (settingsOpen.value && !target?.closest('[aria-label="Mobile navigation"]')) {
    settingsOpen.value = false
  }
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  settingsOpen.value = false
  await navigateTo('/login')
}

onMounted(() => document.addEventListener('click', closeOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', closeOnOutsideClick))
</script>
