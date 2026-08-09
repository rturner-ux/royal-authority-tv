import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'
import { getIncidentIdBySlug } from '@/lib/cases'
import { isUuid, areFriends, isBlockedEitherWay } from '@/lib/friends'

// Every partnership for the current user on one case, hydrated with the
// other person's display info -- mirrors GET /api/friends. Case Partners now
// lives on the Friends page instead of the case-file page, so it's also
// queryable by friendId across every case shared with that one friend
// (case info hydrated instead of the other person's, since the caller
// already knows who that is).
export async function GET(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const slug = req.nextUrl.searchParams.get('slug')
  const friendId = req.nextUrl.searchParams.get('friendId')
  if (!slug && !friendId) return NextResponse.json({ error: 'Missing slug or friendId' }, { status: 400 })

  const db = supabase()

  if (friendId) {
    if (!isUuid(friendId)) return NextResponse.json({ error: 'Invalid friendId' }, { status: 400 })

    const { data: rows, error } = await db
      .from('case_partners')
      .select('*')
      .or(
        `and(initiator_id.eq.${user.id},partner_id.eq.${friendId}),and(initiator_id.eq.${friendId},partner_id.eq.${user.id})`
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('case partners (by friend) fetch error:', error)
      return NextResponse.json({ error: 'Could not load case partners' }, { status: 500 })
    }

    const incidentIds = Array.from(new Set((rows ?? []).map((r) => r.incident_id)))
    const { data: incidents } = incidentIds.length
      ? await db.from('incidents').select('id, title, slug').in('id', incidentIds)
      : { data: [] }
    const incidentById = new Map((incidents ?? []).map((i) => [i.id, i]))

    const hydrate = (r: (typeof rows)[number]) => ({
      ...r,
      case: incidentById.get(r.incident_id) ?? null,
    })

    const accepted = (rows ?? []).filter((r) => r.status === 'accepted').map(hydrate)
    const incoming = (rows ?? []).filter((r) => r.status === 'pending' && r.partner_id === user.id).map(hydrate)
    const outgoing = (rows ?? []).filter((r) => r.status === 'pending' && r.initiator_id === user.id).map(hydrate)

    return NextResponse.json({ success: true, accepted, incoming, outgoing })
  }

  const incidentId = await getIncidentIdBySlug(slug!)
  if (!incidentId) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  const { data: rows, error } = await db
    .from('case_partners')
    .select('*')
    .eq('incident_id', incidentId)
    .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('case partners fetch error:', error)
    return NextResponse.json({ error: 'Could not load case partners' }, { status: 500 })
  }

  const otherIds = Array.from(
    new Set((rows ?? []).map((r) => (r.initiator_id === user.id ? r.partner_id : r.initiator_id)))
  )
  const { data: profiles } = otherIds.length
    ? await db.from('subscriber_profiles').select('user_id, callsign, role, avatar_url, is_verified').in('user_id', otherIds)
    : { data: [] }
  const profileById = new Map((profiles ?? []).map((p) => [p.user_id, p]))

  const hydrate = (r: (typeof rows)[number]) => {
    const otherId = r.initiator_id === user.id ? r.partner_id : r.initiator_id
    return {
      ...r,
      otherUser: profileById.get(otherId) ?? { user_id: otherId, callsign: null, role: null, avatar_url: null, is_verified: false },
    }
  }

  const accepted = (rows ?? []).filter((r) => r.status === 'accepted').map(hydrate)
  const incoming = (rows ?? []).filter((r) => r.status === 'pending' && r.partner_id === user.id).map(hydrate)
  const outgoing = (rows ?? []).filter((r) => r.status === 'pending' && r.initiator_id === user.id).map(hydrate)

  return NextResponse.json({ success: true, accepted, incoming, outgoing })
}

export async function POST(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { slug, partnerId } = await req.json()
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  if (!isUuid(partnerId)) return NextResponse.json({ error: 'Invalid partnerId' }, { status: 400 })
  if (partnerId === user.id) return NextResponse.json({ error: "Can't partner with yourself" }, { status: 400 })

  const incidentId = await getIncidentIdBySlug(slug)
  if (!incidentId) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  if (!(await areFriends(user.id, partnerId))) {
    return NextResponse.json({ error: 'You can only partner up with friends' }, { status: 403 })
  }
  if (await isBlockedEitherWay(user.id, partnerId)) {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

  const db = supabase()

  const { data: existing } = await db
    .from('case_partners')
    .select('id, status')
    .eq('incident_id', incidentId)
    .or(
      `and(initiator_id.eq.${user.id},partner_id.eq.${partnerId}),and(initiator_id.eq.${partnerId},partner_id.eq.${user.id})`
    )
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Partnership already exists', status: existing.status }, { status: 409 })
  }

  const { data, error } = await db
    .from('case_partners')
    .insert({ incident_id: incidentId, initiator_id: user.id, partner_id: partnerId })
    .select()
    .single()

  if (error) {
    console.error('case partner insert error:', error)
    return NextResponse.json({ error: 'Could not send partner invite' }, { status: 500 })
  }

  return NextResponse.json({ success: true, partnership: data })
}
