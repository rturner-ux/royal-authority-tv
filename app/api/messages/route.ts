import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'
import type { DirectMessage } from '@/lib/types'

// One preview row per friend: their most recent message with you (if any),
// hydrated with their callsign. Friends with no messages yet still show up
// so a new friendship is reachable from the inbox.
export async function GET() {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const db = supabase()

  const { data: friendRows } = await db
    .from('friend_requests')
    .select('sender_id, recipient_id')
    .eq('status', 'accepted')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)

  const friendIds = (friendRows ?? []).map((r) => (r.sender_id === user.id ? r.recipient_id : r.sender_id))
  if (friendIds.length === 0) return NextResponse.json({ success: true, conversations: [] })

  const { data: profiles } = await db
    .from('subscriber_profiles')
    .select('user_id, callsign, role')
    .in('user_id', friendIds)
  const profileById = new Map((profiles ?? []).map((p) => [p.user_id, p]))

  const { data: messages } = await db
    .from('direct_messages')
    .select('*')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(500)

  const lastByFriend = new Map<string, DirectMessage>()
  const unreadByFriend = new Map<string, number>()
  for (const m of messages ?? []) {
    const friendId = m.sender_id === user.id ? m.recipient_id : m.sender_id
    if (!friendIds.includes(friendId)) continue
    if (!lastByFriend.has(friendId)) lastByFriend.set(friendId, m)
    if (m.recipient_id === user.id && !m.read_at) {
      unreadByFriend.set(friendId, (unreadByFriend.get(friendId) ?? 0) + 1)
    }
  }

  const conversations = friendIds
    .map((friendId) => ({
      friend: profileById.get(friendId) ?? { user_id: friendId, callsign: null, role: null },
      lastMessage: lastByFriend.get(friendId) ?? null,
      unreadCount: unreadByFriend.get(friendId) ?? 0,
    }))
    .sort((a, b) => {
      const at = a.lastMessage?.created_at ?? ''
      const bt = b.lastMessage?.created_at ?? ''
      return bt.localeCompare(at)
    })

  return NextResponse.json({ success: true, conversations })
}
