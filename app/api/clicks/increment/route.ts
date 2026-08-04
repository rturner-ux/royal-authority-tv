import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Batched client-side (see SiteClickTracker), so this is called a few times
// a minute per visitor, not once per click. Public and unauthenticated by
// design -- anyone's clicks count -- so the count is clamped to a sane range
// per flush to keep a single spoofed request from skewing the total much.
const MAX_COUNT_PER_REQUEST = 100

export async function POST(req: NextRequest) {
  const { count } = await req.json().catch(() => ({ count: 0 }))
  const clicks = Math.min(MAX_COUNT_PER_REQUEST, Math.max(0, Math.floor(Number(count) || 0)))
  if (clicks === 0) return NextResponse.json({ success: true })

  const db = supabase()
  const { data: row } = await db.from('site_click_counter').select('total_clicks').eq('id', 1).maybeSingle()
  const current = row?.total_clicks ?? 0

  const { error } = await db
    .from('site_click_counter')
    .update({ total_clicks: current + clicks, updated_at: new Date().toISOString() })
    .eq('id', 1)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, totalClicks: current + clicks })
}
