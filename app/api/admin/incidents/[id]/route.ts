import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/adminAuth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { id } = await params
  const db = supabase()

  const { data: incident, error: incidentError } = await db
    .from('incidents')
    .select('id, title, slug, category, image_url, poster_url, scene_image_url')
    .eq('id', id)
    .maybeSingle()
  if (incidentError) return NextResponse.json({ error: incidentError.message }, { status: 500 })
  if (!incident) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  const { data: people, error: peopleError } = await db
    .from('incident_people')
    .select('id, name, role, photo_url, sequence')
    .eq('incident_id', id)
    .order('sequence', { ascending: true })
  if (peopleError) return NextResponse.json({ error: peopleError.message }, { status: 500 })

  return NextResponse.json({ success: true, incident, people })
}
