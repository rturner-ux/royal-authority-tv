import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'

// Search across our own vetted case/person data only -- this is how a
// subscriber finds something to pin, rather than typing in an arbitrary
// name (that's the separate, text-only "suspect note" path).
export async function GET(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ success: true, cases: [], people: [] })
  }

  const db = supabase()

  const [{ data: cases }, { data: people }] = await Promise.all([
    db.from('incidents').select('id, title, slug, category, image_url').eq('is_hidden', false).ilike('title', `%${q}%`).limit(8),
    db.from('incident_people').select('id, name, role, photo_url, incident_id').ilike('name', `%${q}%`).limit(8),
  ])

  return NextResponse.json({ success: true, cases: cases ?? [], people: people ?? [] })
}
