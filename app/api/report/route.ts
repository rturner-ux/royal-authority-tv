import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'
import { isUuid } from '@/lib/friends'

export async function POST(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { userId, reason, messageId } = await req.json()
  if (!isUuid(userId)) return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
  if (typeof reason !== 'string' || !reason.trim()) {
    return NextResponse.json({ error: 'Reason required' }, { status: 400 })
  }
  if (messageId !== undefined && messageId !== null && !isUuid(messageId)) {
    return NextResponse.json({ error: 'Invalid messageId' }, { status: 400 })
  }

  const db = supabase()
  const { error } = await db.from('user_reports').insert({
    reporter_id: user.id,
    reported_id: userId,
    reason: reason.trim().slice(0, 1000),
    message_id: messageId ?? null,
  })

  if (error) {
    console.error('report insert error:', error)
    return NextResponse.json({ error: 'Could not file report' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
