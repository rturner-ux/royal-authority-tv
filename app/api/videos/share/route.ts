import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { videoId } = await req.json()
  if (!videoId) return NextResponse.json({ error: 'Missing videoId' }, { status: 400 })

  const db = supabase()
  const { data: video } = await db.from('incident_videos').select('share_count').eq('id', videoId).maybeSingle()
  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })

  const { error } = await db
    .from('incident_videos')
    .update({ share_count: video.share_count + 1 })
    .eq('id', videoId)
  if (error) return NextResponse.json({ error: 'Could not record share' }, { status: 500 })

  return NextResponse.json({ success: true, shareCount: video.share_count + 1 })
}
