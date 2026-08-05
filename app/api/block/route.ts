import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'
import { isUuid } from '@/lib/friends'

export async function POST(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { userId } = await req.json()
  if (!isUuid(userId)) return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
  if (userId === user.id) return NextResponse.json({ error: "Can't block yourself" }, { status: 400 })

  const db = supabase()

  // Blocking also severs any existing friendship/request between the two.
  await db
    .from('friend_requests')
    .delete()
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`
    )

  const { error } = await db
    .from('user_blocks')
    .upsert({ blocker_id: user.id, blocked_id: userId }, { onConflict: 'blocker_id,blocked_id' })

  if (error) {
    console.error('block insert error:', error)
    return NextResponse.json({ error: 'Could not block user' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
