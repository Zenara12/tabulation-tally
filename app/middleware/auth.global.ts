// Global route guard: redirects based on session state + role.
// nuxt-auth-utils auto-imports `useUserSession()`.
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, user, fetch } = useUserSession()

  // Make sure the session has been resolved (important on first server render)
  if (import.meta.server) {
    await fetch()
  }

  const isPublic = to.path === '/login'

  if (!loggedIn.value) {
    if (!isPublic) return navigateTo('/login')
    return
  }

  const home = user.value?.role === 'ADMIN' ? '/admin' : '/judge'

  if (isPublic || to.path === '/') {
    return navigateTo(home)
  }

  if (to.path.startsWith('/admin') && user.value?.role !== 'ADMIN') {
    return navigateTo(home)
  }

  if (to.path.startsWith('/judge') && user.value?.role !== 'JUDGE') {
    return navigateTo(home)
  }
})
