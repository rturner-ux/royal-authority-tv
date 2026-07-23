import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'

// Members can see every subscriber's case requests for a given incident, not
// just their own -- the Member Room is a shared space, not a private inbox.
export async function GET(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!isActive) {
    return NextResponse.json({ error: 'Subscription required' }, { status: 403 })
  }

  const incidentId = req.nextUrl.searchParams.get('incidentId')
  if (!incidentId) {
    return NextResponse.json({ error: 'Missing incidentId' }, { status: 400 })
  }

  const db = supabase()

  const { data: questions, error } = await db
    .from('member_questions')
    .select('id, user_id, topic, message, created_at')
    .eq('incident_id', incidentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('member-questions list error:', error)
    return NextResponse.json({ error: 'Could not load requests' }, { status: 500 })
  }

  const userIds = [...new Set((questions ?? []).map((q) => q.user_id))]
  const { data: profiles } = userIds.length
    ? await db.from('subscriber_profiles').select('user_id, callsign, role').in('user_id', userIds)
    : { data: [] }

  const callsignByUser = new Map((profiles ?? []).map((p) => [p.user_id, p.callsign || p.role]))

  const results = (questions ?? []).map((q) => ({
    id: q.id,
    topic: q.topic,
    message: q.message,
    created_at: q.created_at,
    callsign: callsignByUser.get(q.user_id) || 'A Member',
    isMine: q.user_id === user.id,
  }))

  return NextResponse.json({ requests: results })
}

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
