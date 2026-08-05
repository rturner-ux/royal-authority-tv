import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'

// Opted-in subscribers only (directory_visible = true), with a callsign set
// so there's something safe to display -- no email/name is ever exposed
// here. Excludes yourself and anyone you've blocked or who's blocked you.
export async function GET(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const db = supabase()
  const q = req.nextUrl.searchParams.get('q')?.trim()

  const { data: blocks } = await db
    .from('user_blocks')
    .select('blocker_id, blocked_id')
    .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`)

  const hiddenIds = new Set<string>()
  for (const b of blocks ?? []) {
    hiddenIds.add(b.blocker_id === user.id ? b.blocked_id : b.blocker_id)
  }

  let query = db
    .from('subscriber_profiles')
    .select('user_id, callsign, role, avatar_url, is_verified')
    .eq('directory_visible', true)
    .not('callsign', 'is', null)
    .neq('user_id', user.id)
    .order('callsign', { ascending: true })
    .limit(100)

  if (q) query = query.ilike('callsign', `%${q}%`)

  const { data, error } = await query
  if (error) {
    console.error('directory fetch error:', error)
    return NextResponse.json({ error: 'Could not load directory' }, { status: 500 })
  }

  const profiles = (data ?? []).filter((p) => !hiddenIds.has(p.user_id))

  // Attach friend/request status for each profile so the UI can show the
  // right button (Add Friend / Pending / Friends) without another round trip.
  const { data: myRequests } = await db
    .from('friend_requests')
    .select('sender_id, recipient_id, status')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)

  const statusByUser = new Map<string, string>()
  for (const r of myRequests ?? []) {
    const otherId = r.sender_id === user.id ? r.recipient_id : r.sender_id
    statusByUser.set(otherId, r.status === 'accepted' ? 'friends' : r.status === 'pending' ? 'pending' : 'none')
  }

  return NextResponse.json({
    success: true,
    profiles: profiles.map((p) => ({ ...p, friendStatus: statusByUser.get(p.user_id) ?? 'none' })),
  })
}
