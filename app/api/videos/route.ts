import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { supabaseServerAuth } from '@/lib/supabase/serverAuth'

export const dynamic = 'force-dynamic'

// Public list of every case's Video Library clips combined into one feed,
// with real per-video engagement counts and (for signed-in visitors)
// whether they've liked each one.
export async function GET() {
  const db = supabase()
  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()

  const { data: videos, error } = await db
    .from('incident_videos')
    .select('*, incidents(title, slug, category)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Could not load videos' }, { status: 500 })

  let likedIds = new Set<string>()
  let interests: string[] = []
  if (user) {
    const [{ data: likes }, { data: profile }] = await Promise.all([
      db.from('video_likes').select('video_id').eq('user_id', user.id),
      db.from('subscriber_profiles').select('interests').eq('user_id', user.id).maybeSingle(),
    ])
    likedIds = new Set((likes ?? []).map((l) => l.video_id))
    interests = profile?.interests ?? []
  }

  const enriched = (videos ?? []).map((v) => {
    const incident = Array.isArray(v.incidents) ? v.incidents[0] : v.incidents
    const { incidents: _incidents, ...rest } = v
    return { ...rest, incident, likedByMe: likedIds.has(v.id) }
  })

  // Rank interested-category videos first, but never hide anything -- this
  // is a lean toward stated interests, not a filter. created_at order
  // (already applied above) is preserved within each group.
  const ranked = interests.length
    ? [...enriched].sort((a, b) => {
        const aMatch = a.incident && interests.includes(a.incident.category) ? 0 : 1
        const bMatch = b.incident && interests.includes(b.incident.category) ? 0 : 1
        return aMatch - bMatch
      })
    : enriched

  return NextResponse.json({ success: true, videos: ranked })
}
