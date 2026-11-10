<template>
  <div class="min-h-dvh bg-paper flex flex-col md:flex-row">
    <aside class="hidden md:flex md:w-64 shrink-0 bg-ink text-paper flex-col">
      <div class="px-6 py-6 border-b border-white/10">
        <p class="font-display text-2xl tracking-tight text-paper">Tabulation</p>
        <p class="text-xs uppercase tracking-[0.2em] text-brass mt-1">Admin Console</p>
      </div>

      <nav class="flex-1 px-3 py-5 space-y-1">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-soft transition-colors hover:bg-white/5 hover:text-paper"
          active-class="!bg-white/10 !text-brass"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="px-3 py-5 border-t border-white/10">
        <div class="px-3 py-2 mb-2">
          <p class="text-sm text-paper truncate">{{ user?.name }}</p>
          <p class="text-xs text-slate-soft truncate">{{ user?.email }}</p>
        </div>
        <AppButton
          color="transparent"
          variant="ghost"
          :hover="false"
          class="w-full justify-start px-3 text-left text-slate-soft hover:bg-white/5 hover:text-crimson"
          @click="logout"
        >
          Sign out
        </AppButton>
      </div>
    </aside>

    <main class="flex flex-1 flex-col items-center min-w-0">
      <slot />
      <TradeMark />
    </main>

    <BottomNavigation role="ADMIN" />
  </div>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession()

const links = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Judges & Admins' },
]

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>
