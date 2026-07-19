import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'

export async function POST(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!isActive) {
    return NextResponse.json({ error: 'Subscription required' }, { status: 403 })
  }

  const { incidentId, topic, message } = await req.json()
  if (!incidentId || !topic || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { error } = await supabase().from('member_questions').insert({
    user_id: user.id,
    incident_id: incidentId,
    topic,
    message,
  })

  if (error) {
    console.error('member-questions insert error:', error)
    return NextResponse.json({ error: 'Could not save your question' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
