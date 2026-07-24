import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'

// A subscriber's own named, ordered lists of cases. Never shared, never
// visible to anyone else -- every query here is scoped to the signed-in
// user's own rows, the same ownership-check pattern as the Investigation
// Board API routes.
export async function GET() {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const db = supabase()

  const { data: playlists, error: playlistsError } = await db
    .from('subscriber_playlists')
    .select('*')
    .eq('user_id', user.id)
    .order('sequence', { ascending: true })

  if (playlistsError) {
    console.error('playlists fetch error:', playlistsError)
    return NextResponse.json({ error: 'Could not load playlists' }, { status: 500 })
  }

  const playlistIds = (playlists ?? []).map((p) => p.id)

  const { data: cases, error: casesError } = playlistIds.length
    ? await db.from('playlist_cases').select('*').in('playlist_id', playlistIds).order('sequence', { ascending: true })
    : { data: [], error: null }

  if (casesError) {
    console.error('playlist cases fetch error:', casesError)
    return NextResponse.json({ error: 'Could not load playlists' }, { status: 500 })
  }

  const incidentIds = (cases ?? []).map((c) => c.incident_id)
  const { data: incidents } = incidentIds.length
    ? await db.from('incidents').select('id, title, slug, category, image_url').in('id', incidentIds)
    : { data: [] }

  const incidentById = new Map((incidents ?? []).map((i) => [i.id, i]))
  const casesByPlaylist = new Map<string, unknown[]>()
  for (const c of cases ?? []) {
    const hydrated = { ...c, incident: incidentById.get(c.incident_id) ?? null }
    const list = casesByPlaylist.get(c.playlist_id) ?? []
    list.push(hydrated)
    casesByPlaylist.set(c.playlist_id, list)
  }

  const hydratedPlaylists = (playlists ?? []).map((p) => ({
    ...p,
    cases: casesByPlaylist.get(p.id) ?? [],
  }))

  return NextResponse.json({ success: true, playlists: hydratedPlaylists })
}

export async function POST(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { name } = await req.json()
  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Missing name' }, { status: 400 })
  }

  const db = supabase()

  const { data: existing } = await db
    .from('subscriber_playlists')
    .select('sequence')
    .eq('user_id', user.id)
    .order('sequence', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await db
    .from('subscriber_playlists')
    .insert({ user_id: user.id, name: name.trim(), sequence: (existing?.sequence ?? -1) + 1 })
    .select()
    .single()

  if (error) {
    console.error('playlist create error:', error)
    return NextResponse.json({ error: 'Could not create playlist' }, { status: 500 })
  }

  return NextResponse.json({ success: true, playlist: { ...data, cases: [] } })
}
