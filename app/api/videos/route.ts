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
    .select('*, incidents(title, slug)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Could not load videos' }, { status: 500 })

  let likedIds = new Set<string>()
  if (user) {
    const { data: likes } = await db.from('video_likes').select('video_id').eq('user_id', user.id)
    likedIds = new Set((likes ?? []).map((l) => l.video_id))
  }

  const enriched = (videos ?? []).map((v) => {
    const incident = Array.isArray(v.incidents) ? v.incidents[0] : v.incidents
    const { incidents: _incidents, ...rest } = v
    return { ...rest, incident, likedByMe: likedIds.has(v.id) }
  })

  return NextResponse.json({ success: true, videos: enriched })
}
