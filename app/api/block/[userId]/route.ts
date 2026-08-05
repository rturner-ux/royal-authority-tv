import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'
import { isUuid } from '@/lib/friends'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { userId } = await params
  if (!isUuid(userId)) return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })

  const db = supabase()
  const { error } = await db.from('user_blocks').delete().eq('blocker_id', user.id).eq('blocked_id', userId)

  if (error) {
    console.error('unblock error:', error)
    return NextResponse.json({ error: 'Could not unblock user' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
