import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/adminAuth'

// Lightweight case picker list -- same ilike title-search pattern already
// used in /api/picture-scan against incidents.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ success: true, incidents: [] })

  const db = supabase()
  const { data, error } = await db
    .from('incidents')
    .select('id, title, slug, category, image_url')
    .ilike('title', `%${q}%`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, incidents: data })
}
