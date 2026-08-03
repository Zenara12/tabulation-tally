import type { H3Event } from 'h3'

/**
 * Ensures the current request has a valid session AND that the session
 * user's role is one of `roles`. Throws a 401/403 H3 error otherwise.
 * Returns the session's user object on success.
 */
export async function requireRole(event: H3Event, roles: Array<'ADMIN' | 'JUDGE'>) {
  const session = await requireUserSession(event)
  const user = session.user as { id: string; role: 'ADMIN' | 'JUDGE'; name: string; email: string }

  if (!roles.includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: insufficient role' })
  }

  return user
}
