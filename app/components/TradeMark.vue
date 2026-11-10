<script setup lang="ts">
const config = useRuntimeConfig()
const tradeMarkText = config.public.tradeMarkText || 'Nuxt · Prisma · PostgreSQL'
</script>

<template>
  <p class="trademark relative z-10 text-xs text-slate-soft mt-auto mb-25 sm:mb-5">{{ tradeMarkText }}</p>
</template>
