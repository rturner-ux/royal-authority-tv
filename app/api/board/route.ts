import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'

// Fetches (creating on first visit) the current subscriber's private
// investigation board along with its pinned items and red-string
// connections. One board per user -- never shared, never visible to anyone
// else; every query here is scoped to the signed-in user's own board id.
export async function GET() {
  const { user, isActive } = await getSubscriberStatus()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!isActive) {
    return NextResponse.json({ error: 'Subscription required' }, { status: 403 })
  }

  const db = supabase()

  let { data: board } = await db.from('investigation_boards').select('id').eq('user_id', user.id).maybeSingle()

  if (!board) {
    const { data: created, error: createError } = await db
      .from('investigation_boards')
      .insert({ user_id: user.id })
      .select('id')
      .single()

    if (createError) {
      console.error('board create error:', createError)
      return NextResponse.json({ error: 'Could not create board' }, { status: 500 })
    }
    board = created
  }

  const [{ data: items, error: itemsError }, { data: connections, error: connError }] = await Promise.all([
    db.from('board_items').select('*').eq('board_id', board.id).order('created_at', { ascending: true }),
    db.from('board_connections').select('*').eq('board_id', board.id).order('created_at', { ascending: true }),
  ])

  if (itemsError || connError) {
    console.error('board fetch error:', itemsError || connError)
    return NextResponse.json({ error: 'Could not load board' }, { status: 500 })
  }

  // Case/person pins reference vetted site data by id -- hydrate the display
  // fields (title/name/photo) here so the client never has to trust
  // anything the user themselves entered for those pin types.
  const incidentIds = (items ?? []).filter((i) => i.incident_id).map((i) => i.incident_id)
  const personIds = (items ?? []).filter((i) => i.person_id).map((i) => i.person_id)

  const [{ data: incidents }, { data: people }] = await Promise.all([
    incidentIds.length
      ? db.from('incidents').select('id, title, slug, category, image_url').in('id', incidentIds)
      : Promise.resolve({ data: [] }),
    personIds.length
      ? db.from('incident_people').select('id, name, role, photo_url, incident_id').in('id', personIds)
      : Promise.resolve({ data: [] }),
  ])

  const incidentById = new Map((incidents ?? []).map((i) => [i.id, i]))
  const personById = new Map((people ?? []).map((p) => [p.id, p]))

  const hydrated = (items ?? []).map((item) => ({
    ...item,
    incident: item.incident_id ? incidentById.get(item.incident_id) ?? null : null,
    person: item.person_id ? personById.get(item.person_id) ?? null : null,
  }))

  return NextResponse.json({ success: true, boardId: board.id, items: hydrated, connections: connections ?? [] })
}
