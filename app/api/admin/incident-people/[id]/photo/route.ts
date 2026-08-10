import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/adminAuth'
import { uploadToCasePhotos, PhotoValidationError } from '@/lib/adminPhotoUpload'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { id } = await params
  const formData = await req.formData()
  const file = formData.get('photo')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No photo uploaded' }, { status: 400 })
  }

  const db = supabase()
  const { data: person, error: lookupError } = await db
    .from('incident_people')
    .select('id, incident_id, incidents(slug)')
    .eq('id', id)
    .maybeSingle()
  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 })
  if (!person) return NextResponse.json({ error: 'Person not found' }, { status: 404 })

  const incident = Array.isArray(person.incidents) ? person.incidents[0] : person.incidents
  const slug = incident?.slug || person.incident_id

  try {
    const url = await uploadToCasePhotos(file, `${slug}/person-${id}`)

    const { error: updateError } = await db.from('incident_people').update({ photo_url: url }).eq('id', id)
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    return NextResponse.json({ success: true, url })
  } catch (err) {
    if (err instanceof PhotoValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    console.error('Person photo upload failed:', err)
    return NextResponse.json({ error: 'Could not upload photo' }, { status: 500 })
  }
}
