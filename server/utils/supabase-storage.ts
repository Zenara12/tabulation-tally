import { createClient } from '@supabase/supabase-js'

const globalForSupabase = globalThis as unknown as {
  supabaseStorage?: ReturnType<typeof createClient>
}

export function getSupabaseStorage() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase Storage is not configured on the server',
    })
  }

  if (!globalForSupabase.supabaseStorage) {
    globalForSupabase.supabaseStorage = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return globalForSupabase.supabaseStorage
}

export function getSupabaseStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || 'contestant-images'
}
