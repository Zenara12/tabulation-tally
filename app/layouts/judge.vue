<template>
  <div class="min-h-screen bg-paper flex flex-col md:flex-row">
    <aside class="hidden md:flex md:w-64 shrink-0 bg-ink text-paper flex-col">
      <div class="px-6 py-6 border-b border-white/10">
        <p class="font-display text-2xl tracking-tight text-paper">Tabulation</p>
        <p class="text-xs uppercase tracking-[0.2em] text-teal-soft mt-1">Judge Panel</p>
      </div>

      <nav class="flex-1 px-3 py-5 space-y-1">
        <NuxtLink
          to="/judge"
          class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-soft transition-colors hover:bg-white/5 hover:text-paper"
          active-class="!bg-white/10 !text-brass"
        >
          Assigned Events
        </NuxtLink>
      </nav>

      <div class="px-3 py-5 border-t border-white/10">
        <div class="px-3 py-2 mb-2">
          <p class="text-sm text-paper truncate">{{ user?.name }}</p>
          <p class="text-xs text-slate-soft truncate">{{ user?.email }}</p>
        </div>
        <button
          class="w-full text-left rounded-md px-3 py-2.5 text-sm font-medium text-slate-soft hover:bg-white/5 hover:text-crimson transition-colors"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </aside>

    <main class="flex-1 min-w-0 pb-24 md:pb-0">
      <slot />
    </main>

    <BottomNavigation role="JUDGE" />
  </div>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>
