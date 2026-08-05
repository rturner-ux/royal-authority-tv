import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'
import { isUuid, isBlockedEitherWay } from '@/lib/friends'

// Returns friends (accepted) plus incoming/outgoing pending requests,
// each hydrated with the other person's callsign/role for display.
export async function GET() {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const db = supabase()

  const { data: rows, error } = await db
    .from('friend_requests')
    .select('*')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('friends fetch error:', error)
    return NextResponse.json({ error: 'Could not load friends' }, { status: 500 })
  }

  const otherIds = Array.from(
    new Set((rows ?? []).map((r) => (r.sender_id === user.id ? r.recipient_id : r.sender_id)))
  )
  const { data: profiles } = otherIds.length
    ? await db.from('subscriber_profiles').select('user_id, callsign, role, avatar_url, is_verified').in('user_id', otherIds)
    : { data: [] }
  const profileById = new Map((profiles ?? []).map((p) => [p.user_id, p]))

  const hydrate = (r: (typeof rows)[number]) => {
    const otherId = r.sender_id === user.id ? r.recipient_id : r.sender_id
    return {
      ...r,
      otherUser: profileById.get(otherId) ?? { user_id: otherId, callsign: null, role: null, avatar_url: null, is_verified: false },
    }
  }

  const friends = (rows ?? []).filter((r) => r.status === 'accepted').map(hydrate)
  const incoming = (rows ?? []).filter((r) => r.status === 'pending' && r.recipient_id === user.id).map(hydrate)
  const outgoing = (rows ?? []).filter((r) => r.status === 'pending' && r.sender_id === user.id).map(hydrate)

  return NextResponse.json({ success: true, friends, incoming, outgoing })
}

export async function POST(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { recipientId } = await req.json()
  if (!isUuid(recipientId)) return NextResponse.json({ error: 'Invalid recipientId' }, { status: 400 })
  if (recipientId === user.id) return NextResponse.json({ error: "Can't friend yourself" }, { status: 400 })

  const db = supabase()

  if (await isBlockedEitherWay(user.id, recipientId)) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

  const { data: existing } = await db
    .from('friend_requests')
    .select('id, status')
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`
    )
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Request already exists', status: existing.status }, { status: 409 })
  }

  const { data, error } = await db
    .from('friend_requests')
    .insert({ sender_id: user.id, recipient_id: recipientId })
    .select()
    .single()

  if (error) {
    console.error('friend request insert error:', error)
    return NextResponse.json({ error: 'Could not send request' }, { status: 500 })
  }

  return NextResponse.json({ success: true, request: data })
}
