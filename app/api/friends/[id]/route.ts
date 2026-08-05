import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { id } = await params
  const { action } = await req.json()
  if (action !== 'accept' && action !== 'decline') {
    return NextResponse.json({ error: 'action must be accept or decline' }, { status: 400 })
  }

  const db = supabase()

  const { data: existing } = await db.from('friend_requests').select('*').eq('id', id).maybeSingle()
  if (!existing || existing.recipient_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (existing.status !== 'pending') {
    return NextResponse.json({ error: 'Request already resolved' }, { status: 409 })
  }

  const { data, error } = await db
    .from('friend_requests')
    .update({ status: action === 'accept' ? 'accepted' : 'declined', responded_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('friend request update error:', error)
    return NextResponse.json({ error: 'Could not update request' }, { status: 500 })
  }

  return NextResponse.json({ success: true, request: data })
}

// Cancel a pending outgoing request, or unfriend an accepted one -- either
// party can remove an accepted friendship, only the sender can cancel a
// still-pending one.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { id } = await params
  const db = supabase()

  const { data: existing } = await db.from('friend_requests').select('*').eq('id', id).maybeSingle()
  if (!existing || (existing.sender_id !== user.id && existing.recipient_id !== user.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (existing.status === 'pending' && existing.sender_id !== user.id) {
    return NextResponse.json({ error: 'Only the sender can cancel a pending request' }, { status: 403 })
  }

  const { error } = await db.from('friend_requests').delete().eq('id', id)
  if (error) {
    console.error('friend request delete error:', error)
    return NextResponse.json({ error: 'Could not remove' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
