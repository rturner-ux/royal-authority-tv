import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'

export async function GET() {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const db = supabase()

  const { data, error } = await db
    .from('case_notifications')
    .select('*, incident:incidents(title, slug, image_url, category)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('notifications fetch error:', error)
    return NextResponse.json({ error: 'Could not load notifications' }, { status: 500 })
  }

  return NextResponse.json({ success: true, notifications: data })
}

export async function PATCH(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { id, all } = await req.json()
  const db = supabase()

  if (all) {
    const { error } = await db
      .from('case_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null)
    if (error) return NextResponse.json({ error: 'Could not update notifications' }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (!id) return NextResponse.json({ error: 'id or all required' }, { status: 400 })

  const { data: existing } = await db.from('case_notifications').select('user_id').eq('id', id).maybeSingle()
  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await db
    .from('case_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return NextResponse.json({ error: 'Could not update notification' }, { status: 500 })

  return NextResponse.json({ success: true })
}
