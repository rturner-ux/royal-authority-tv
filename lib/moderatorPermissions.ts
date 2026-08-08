import 'server-only'
import { supabaseServerAuth } from './supabase/serverAuth'

export type ModeratorPermission = 'moderate_comments' | 'moderate_chat'

export const MODERATOR_PERMISSION_LABELS: Record<ModeratorPermission, string> = {
  moderate_comments: 'Approve/reject case comments',
  moderate_chat: 'Ban/unban live chat users',
}

export const ALL_MODERATOR_PERMISSIONS: ModeratorPermission[] = ['moderate_comments', 'moderate_chat']

// Admins implicitly have every permission -- not stored on the row, a
// property of being an admin. Returns the signed-in user's id alongside
// the yes/no so callers that need it (e.g. to record who banned someone)
// don't have to look it up a second time.
export async function checkPermission(
  permission: ModeratorPermission
): Promise<{ allowed: boolean; userId: string | null }> {
  const db = await supabaseServerAuth()
  const {
    data: { user },
  } = await db.auth.getUser()
  if (!user) return { allowed: false, userId: null }

  const { data } = await db
    .from('subscriber_profiles')
    .select('is_admin, is_moderator, moderator_permissions')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!data) return { allowed: false, userId: user.id }
  if (data.is_admin) return { allowed: true, userId: user.id }
  if (data.is_moderator && (data.moderator_permissions ?? []).includes(permission)) {
    return { allowed: true, userId: user.id }
  }
  return { allowed: false, userId: user.id }
}
