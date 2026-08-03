import 'server-only'
import { supabase } from './supabase/server'

export type PlaylistPreview = {
  id: string
  name: string
  caseCount: number
  thumbnails: string[]
}

// Shared by /account and /account/videos so both profile views agree on
// playlist counts/thumbnails without duplicating the join logic.
export async function getPlaylistPreviews(
  userId: string
): Promise<{ previews: PlaylistPreview[]; savedIncidentIds: Set<string> }> {
  const svc = supabase()

  const { data: myPlaylists } = await svc
    .from('subscriber_playlists')
    .select('id, name')
    .eq('user_id', userId)
    .order('sequence', { ascending: true })

  const playlistIds = (myPlaylists ?? []).map((p) => p.id)
  const { data: playlistCases } = playlistIds.length
    ? await svc.from('playlist_cases').select('playlist_id, incident_id, incidents(image_url)').in('playlist_id', playlistIds)
    : { data: [] }

  const casesByPlaylist = new Map<string, { incident_id: string; image_url: string | null }[]>()
  const savedIncidentIds = new Set<string>()
  for (const pc of playlistCases ?? []) {
    const incident = Array.isArray(pc.incidents) ? pc.incidents[0] : pc.incidents
    const list = casesByPlaylist.get(pc.playlist_id) ?? []
    list.push({ incident_id: pc.incident_id, image_url: incident?.image_url ?? null })
    casesByPlaylist.set(pc.playlist_id, list)
    savedIncidentIds.add(pc.incident_id)
  }

  const previews = (myPlaylists ?? []).map((p) => {
    const cases = casesByPlaylist.get(p.id) ?? []
    return {
      id: p.id,
      name: p.name,
      caseCount: cases.length,
      thumbnails: cases.map((c) => c.image_url).filter((u): u is string => !!u),
    }
  })

  return { previews, savedIncidentIds }
}
