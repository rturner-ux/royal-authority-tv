import 'server-only'
import type { User } from '@supabase/supabase-js'
import { supabaseServerAuth } from './supabase/serverAuth'

// Shared by the newer admin API routes. The original admin routes
// (moderators, notifications) each inline this same check -- left as-is,
// not touched here, since refactoring them isn't part of this change.
export async function requireAdmin(): Promise<User | null> {
  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()
  if (!user) return null

  const { data } = await authDb.from('subscriber_profiles').select('is_admin').eq('user_id', user.id).maybeSingle()
  return data?.is_admin ? user : null
}
