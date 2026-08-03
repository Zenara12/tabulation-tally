<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <!-- Signature panel: a live scoreboard tally, ink background -->
    <div class="hidden lg:flex flex-col justify-between bg-ink text-paper px-14 py-12 relative overflow-hidden">
      <div class="relative z-10">
        <p class="font-display text-3xl tracking-tight">Tabulation</p>
        <p class="text-xs uppercase tracking-[0.25em] text-brass mt-1">Scoring, settled fairly</p>
      </div>

      <div class="relative z-10 space-y-4">
        <p class="font-display text-4xl leading-tight max-w-sm">
          Every score, tallied&nbsp;transparently.
        </p>
        <div class="space-y-3 pt-4 max-w-sm">
          <div
            v-for="(row, i) in mockBoard"
            :key="row.name"
            class="flex items-center gap-3 tabular text-sm"
          >
            <span
              class="w-6 text-right"
              :class="i === 0 ? 'text-brass' : i === 1 ? 'text-slate-soft' : 'text-slate-soft/70'"
            >{{ i + 1 }}</span>
            <span class="flex-1 font-body text-paper/80">{{ row.name }}</span>
            <span class="w-14 text-right">{{ row.score.toFixed(2) }}</span>
            <div class="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
              <div class="h-full bg-brass rounded-full" :style="{ width: row.score + '%' }" />
            </div>
          </div>
        </div>
      </div>

      <p class="relative z-10 text-xs text-slate-soft">Nuxt · Prisma · PostgreSQL</p>
    </div>

    <!-- Login form -->
    <div class="flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-sm">
        <div class="lg:hidden mb-8">
          <p class="font-display text-2xl tracking-tight text-ink">Tabulation</p>
        </div>

        <h1 class="font-display text-3xl text-ink mb-1">Sign in</h1>
        <p class="text-sm text-slate mb-8">Enter your credentials to continue.</p>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <div>
            <label class="block text-sm font-medium text-ink mb-1.5" for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-soft focus:outline-none focus:ring-2 focus:ring-brass/50 focus:border-brass"
              placeholder="you@example.com"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-ink mb-1.5" for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-soft focus:outline-none focus:ring-2 focus:ring-brass/50 focus:border-brass"
              placeholder="••••••••"
            >
          </div>

          <p v-if="error" class="text-sm text-crimson">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-md bg-ink text-paper text-sm font-medium py-2.5 hover:bg-ink-soft transition-colors disabled:opacity-60"
          >
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { fetch: refreshSession, user } = useUserSession()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const mockBoard = [
  { name: 'Contestant No. 07', score: 96.4 },
  { name: 'Contestant No. 12', score: 94.1 },
  { name: 'Contestant No. 03', score: 91.8 },
]

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await refreshSession()
    await navigateTo(user.value?.role === 'ADMIN' ? '/admin' : '/judge')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Unable to sign in. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
