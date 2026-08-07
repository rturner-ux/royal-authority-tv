import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Called at most once per visitor session by SiteClickTracker. The cookie
// check here is a backstop -- the client already skips the request
// entirely when opted out -- in case that check is ever bypassed.
export async function POST(req: NextRequest) {
  if (req.cookies.get('ra_notrack')) return NextResponse.json({ success: true })

  const db = supabase()
  const { data: row } = await db.from('site_click_counter').select('total_clicks').eq('id', 1).maybeSingle()
  const current = row?.total_clicks ?? 0

  const { error } = await db
    .from('site_click_counter')
    .update({ total_clicks: current + 1, updated_at: new Date().toISOString() })
    .eq('id', 1)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, totalClicks: current + 1 })
}
