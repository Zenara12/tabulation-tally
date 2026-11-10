<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login' || route.name === 'login')
const isMobile = ref(false)

const checkScreen = () => {
  isMobile.value = window.innerWidth < 640
}

const showTradeMark = computed(() => {
  return isLoginPage.value && !isMobile.value
})

onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreen)
})

</script>
<template>
  <div class="relative flex flex-col items-center min-h-dvh bg-paper">
    <slot />
    <TradeMark :class="{ 'hidden': showTradeMark }" />
  </div>
</template>
