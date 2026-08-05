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

  const { data: existing } = await db.from('case_partners').select('*').eq('id', id).maybeSingle()
  if (!existing || existing.partner_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (existing.status !== 'pending') {
    return NextResponse.json({ error: 'Invite already resolved' }, { status: 409 })
  }

  const { data, error } = await db
    .from('case_partners')
    .update({ status: action === 'accept' ? 'accepted' : 'declined', responded_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('case partner update error:', error)
    return NextResponse.json({ error: 'Could not update invite' }, { status: 500 })
  }

  return NextResponse.json({ success: true, partnership: data })
}

// Cancel a still-pending invite -- only the initiator can, matching the
// friend-request cancel behavior. Accepted partnerships aren't removable in
// v1 (no "un-partner" flow yet).
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { id } = await params
  const db = supabase()

  const { data: existing } = await db.from('case_partners').select('*').eq('id', id).maybeSingle()
  if (!existing || existing.initiator_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (existing.status !== 'pending') {
    return NextResponse.json({ error: 'Only a pending invite can be cancelled' }, { status: 403 })
  }

  const { error } = await db.from('case_partners').delete().eq('id', id)
  if (error) {
    console.error('case partner delete error:', error)
    return NextResponse.json({ error: 'Could not cancel' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
