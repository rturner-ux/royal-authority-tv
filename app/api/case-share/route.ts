import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { incidentId } = await req.json()
  if (!incidentId) return NextResponse.json({ error: 'Missing incidentId' }, { status: 400 })

  const db = supabase()
  const { data, error } = await db.rpc('increment_incident_share_count', { p_incident_id: incidentId })

  if (error) {
    console.error('case-share increment error:', error)
    return NextResponse.json({ error: 'Could not record share' }, { status: 500 })
  }

  return NextResponse.json({ success: true, shareCount: data as number })
}
