import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { id } = await params
  const { name, sequence } = await req.json()

  const update: Record<string, unknown> = {}
  if (typeof name === 'string' && name.trim()) update.name = name.trim()
  if (typeof sequence === 'number') update.sequence = sequence
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }
  update.updated_at = new Date().toISOString()

  const db = supabase()
  const { error } = await db.from('subscriber_playlists').update(update).eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('playlist update error:', error)
    return NextResponse.json({ error: 'Could not update playlist' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { id } = await params
  const db = supabase()
  const { error } = await db.from('subscriber_playlists').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('playlist delete error:', error)
    return NextResponse.json({ error: 'Could not delete playlist' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
