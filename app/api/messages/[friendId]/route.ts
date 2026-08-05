import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'
import { isUuid, areFriends, isBlockedEitherWay } from '@/lib/friends'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ friendId: string }> }) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { friendId } = await params
  if (!isUuid(friendId)) return NextResponse.json({ error: 'Invalid friendId' }, { status: 400 })
  if (!(await areFriends(user.id, friendId))) {
    return NextResponse.json({ error: 'Not friends' }, { status: 403 })
  }

  const db = supabase()

  const { data: messages, error } = await db
    .from('direct_messages')
    .select('*')
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true })
    .limit(500)

  if (error) {
    console.error('thread fetch error:', error)
    return NextResponse.json({ error: 'Could not load messages' }, { status: 500 })
  }

  // Mark anything the friend sent us as read now that we've opened the thread.
  const unreadIds = (messages ?? [])
    .filter((m) => m.recipient_id === user.id && !m.read_at)
    .map((m) => m.id)
  if (unreadIds.length > 0) {
    await db.from('direct_messages').update({ read_at: new Date().toISOString() }).in('id', unreadIds)
  }

  return NextResponse.json({ success: true, messages: messages ?? [] })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ friendId: string }> }) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { friendId } = await params
  if (!isUuid(friendId)) return NextResponse.json({ error: 'Invalid friendId' }, { status: 400 })

  const { body } = await req.json()
  if (typeof body !== 'string' || !body.trim()) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
  }
  if (body.length > 2000) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 })
  }

  if (!(await areFriends(user.id, friendId))) {
    return NextResponse.json({ error: 'Not friends' }, { status: 403 })
  }
  if (await isBlockedEitherWay(user.id, friendId)) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

  const db = supabase()

  const { data, error } = await db
    .from('direct_messages')
    .insert({ sender_id: user.id, recipient_id: friendId, body: body.trim() })
    .select()
    .single()

  if (error) {
    console.error('message insert error:', error)
    return NextResponse.json({ error: 'Could not send message' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: data })
}
