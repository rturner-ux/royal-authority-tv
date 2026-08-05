import 'server-only'
import { supabase } from './supabase/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Client-supplied ids go into raw PostgREST .or() filter strings below --
// validating the shape first avoids filter-injection via a crafted id.
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
}

export async function areFriends(userA: string, userB: string): Promise<boolean> {
  const db = supabase()
  const { data } = await db
    .from('friend_requests')
    .select('id')
    .eq('status', 'accepted')
    .or(`and(sender_id.eq.${userA},recipient_id.eq.${userB}),and(sender_id.eq.${userB},recipient_id.eq.${userA})`)
    .maybeSingle()
  return !!data
}

export async function isBlockedEitherWay(userA: string, userB: string): Promise<boolean> {
  const db = supabase()
  const { data } = await db
    .from('user_blocks')
    .select('id')
    .or(`and(blocker_id.eq.${userA},blocked_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_id.eq.${userA})`)
    .maybeSingle()
  return !!data
}
