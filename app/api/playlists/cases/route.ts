import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'

async function ownsPlaylist(db: ReturnType<typeof supabase>, userId: string, playlistId: string): Promise<boolean> {
  const { data } = await db.from('subscriber_playlists').select('id').eq('id', playlistId).eq('user_id', userId).maybeSingle()
  return !!data
}

export async function POST(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { playlistId, incidentId } = await req.json()
  if (!playlistId || !incidentId) {
    return NextResponse.json({ error: 'Missing playlistId or incidentId' }, { status: 400 })
  }

  const db = supabase()
  if (!(await ownsPlaylist(db, user.id, playlistId))) {
    return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
  }

  const { data: existing } = await db
    .from('playlist_cases')
    .select('sequence')
    .eq('playlist_id', playlistId)
    .order('sequence', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await db
    .from('playlist_cases')
    .insert({ playlist_id: playlistId, incident_id: incidentId, sequence: (existing?.sequence ?? -1) + 1 })
    .select()
    .single()

  if (error) {
    // Most likely the unique(playlist_id, incident_id) constraint -- the
    // case is already in this playlist.
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already in this playlist' }, { status: 409 })
    }
    console.error('playlist case insert error:', error)
    return NextResponse.json({ error: 'Could not add case' }, { status: 500 })
  }

  const { data: incident } = await db.from('incidents').select('id, title, slug, category, image_url').eq('id', incidentId).maybeSingle()

  return NextResponse.json({ success: true, case: { ...data, incident: incident ?? null } })
}

export async function PATCH(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { playlistId, orderedIds } = await req.json()
  if (!playlistId || !Array.isArray(orderedIds)) {
    return NextResponse.json({ error: 'Missing playlistId or orderedIds' }, { status: 400 })
  }

  const db = supabase()
  if (!(await ownsPlaylist(db, user.id, playlistId))) {
    return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
  }

  const results = await Promise.all(
    orderedIds.map((id: string, index: number) =>
      db.from('playlist_cases').update({ sequence: index }).eq('id', id).eq('playlist_id', playlistId)
    )
  )

  const failed = results.find((r) => r.error)
  if (failed) {
    console.error('playlist case reorder error:', failed.error)
    return NextResponse.json({ error: 'Could not reorder' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const id = req.nextUrl.searchParams.get('id')
  const playlistId = req.nextUrl.searchParams.get('playlistId')
  if (!id || !playlistId) return NextResponse.json({ error: 'Missing id or playlistId' }, { status: 400 })

  const db = supabase()
  if (!(await ownsPlaylist(db, user.id, playlistId))) {
    return NextResponse.json({ error: 'Playlist not found' }, { status: 404 })
  }

  const { error } = await db.from('playlist_cases').delete().eq('id', id).eq('playlist_id', playlistId)

  if (error) {
    console.error('playlist case delete error:', error)
    return NextResponse.json({ error: 'Could not remove case' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
