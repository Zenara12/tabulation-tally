<template>
  <div class="px-10 py-10 max-w-4xl">
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="font-display text-3xl text-ink">Judges & Admins</h1>
        <p class="text-sm text-slate mt-1">Manage who can sign in to the system.</p>
      </div>
      <button
        class="rounded-md bg-ink text-paper text-sm font-medium px-4 py-2.5 hover:bg-ink-soft transition-colors"
        @click="showCreate = true"
      >
        + New account
      </button>
    </div>

    <div v-if="pending" class="text-sm text-slate">Loading…</div>

    <table v-else class="w-full text-sm">
      <thead>
        <tr class="text-left text-xs uppercase tracking-wider text-slate-soft border-b border-ink/10">
          <th class="py-2.5 font-medium">Name</th>
          <th class="py-2.5 font-medium">Email</th>
          <th class="py-2.5 font-medium">Role</th>
          <th class="py-2.5 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id" class="border-b border-ink/5">
          <td class="py-3 text-ink">{{ u.name }}</td>
          <td class="py-3 text-slate">{{ u.email }}</td>
          <td class="py-3">
            <span
              class="text-[10px] uppercase tracking-wider font-medium rounded-full px-2 py-0.5"
              :class="u.role === 'ADMIN' ? 'bg-brass/15 text-[#8a6d16]' : 'bg-teal/10 text-teal'"
            >{{ u.role }}</span>
          </td>
          <td class="py-3 text-right">
            <button
              v-if="!isSeedAdmin(u.email)"
              class="text-sm text-crimson hover:underline"
              @click="remove(u.id)"
            >Remove</button>
            <span v-else class="text-xs text-slate-soft">Protected</span>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showCreate" class="fixed inset-0 bg-ink/40 flex items-center justify-center px-4 z-50" @click.self="showCreate = false">
      <div class="bg-white rounded-lg w-full max-w-md p-6">
        <h2 class="font-display text-xl text-ink mb-4">New account</h2>
        <form class="space-y-4" @submit.prevent="createUser">
          <div>
            <label class="block text-sm font-medium text-ink mb-1.5">Full name</label>
            <input v-model="form.name" required class="w-full rounded-md border border-ink/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
          </div>
          <div>
            <label class="block text-sm font-medium text-ink mb-1.5">Email</label>
            <input v-model="form.email" type="email" required class="w-full rounded-md border border-ink/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
          </div>
          <div>
            <label class="block text-sm font-medium text-ink mb-1.5">Temporary password</label>
            <input v-model="form.password" type="text" minlength="8" required class="w-full rounded-md border border-ink/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
            <p class="text-xs text-slate mt-1">At least 8 characters. Share this with them securely.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-ink mb-1.5">Role</label>
            <select v-model="form.role" class="w-full rounded-md border border-ink/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brass/50">
              <option value="JUDGE">Judge</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <p v-if="createError" class="text-sm text-crimson">{{ createError }}</p>
          <div class="flex justify-end gap-2 pt-1">
            <button type="button" class="text-sm px-4 py-2.5 text-slate hover:text-ink" @click="showCreate = false">Cancel</button>
            <button type="submit" :disabled="creating" class="rounded-md bg-ink text-paper text-sm font-medium px-4 py-2.5 hover:bg-ink-soft disabled:opacity-60">
              {{ creating ? 'Creating…' : 'Create account' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { data: users, pending, refresh } = await useFetch('/api/users')
const config = useRuntimeConfig()
const seedAdminEmail = config.public.seedAdminEmail || 'admin@tabulation.local'

const showCreate = ref(false)
const creating = ref(false)
const createError = ref('')
const form = reactive({ name: '', email: '', password: '', role: 'JUDGE' })

function isSeedAdmin(email: string) {
  return email.toLowerCase() === seedAdminEmail.toLowerCase()
}

async function createUser() {
  creating.value = true
  createError.value = ''
  try {
    await $fetch('/api/users', { method: 'POST', body: { ...form } })
    showCreate.value = false
    Object.assign(form, { name: '', email: '', password: '', role: 'JUDGE' })
    await refresh()
  } catch (e: any) {
    createError.value = e?.data?.statusMessage || 'Failed to create account'
  } finally {
    creating.value = false
  }
}

async function remove(id: string) {
  if (!confirm('Remove this account? This cannot be undone.')) return
  await $fetch(`/api/users/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>
