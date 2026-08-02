import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { supabaseServerAuth } from '@/lib/supabase/serverAuth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to like videos' }, { status: 401 })

  const { videoId } = await req.json()
  if (!videoId) return NextResponse.json({ error: 'Missing videoId' }, { status: 400 })

  const db = supabase()
  const { data: video } = await db.from('incident_videos').select('like_count').eq('id', videoId).maybeSingle()
  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })

  const { data: existing } = await db
    .from('video_likes')
    .select('id')
    .eq('video_id', videoId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const { error: delErr } = await db.from('video_likes').delete().eq('id', existing.id)
    if (delErr) return NextResponse.json({ error: 'Could not unlike video' }, { status: 500 })
    const { error: updErr } = await db
      .from('incident_videos')
      .update({ like_count: Math.max(0, video.like_count - 1) })
      .eq('id', videoId)
    if (updErr) return NextResponse.json({ error: 'Could not update like count' }, { status: 500 })
    return NextResponse.json({ success: true, liked: false, likeCount: Math.max(0, video.like_count - 1) })
  }

  const { error: insErr } = await db.from('video_likes').insert({ video_id: videoId, user_id: user.id })
  if (insErr) return NextResponse.json({ error: 'Could not like video' }, { status: 500 })
  const { error: updErr } = await db
    .from('incident_videos')
    .update({ like_count: video.like_count + 1 })
    .eq('id', videoId)
  if (updErr) return NextResponse.json({ error: 'Could not update like count' }, { status: 500 })

  return NextResponse.json({ success: true, liked: true, likeCount: video.like_count + 1 })
}
