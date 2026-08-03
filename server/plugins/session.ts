// Extend the session's user type declarations for TypeScript
declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'JUDGE'
  }

  interface UserSession {
    user: User
  }
}

export default defineNitroPlugin(() => {
  sessionHooks.hook('fetch', async (_session, _event) => {
    // Session loaded from sealed cookie — extend here if you need
    // to hydrate extra data from DB on each request.
  })
})
