import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/adminAuth'
import { uploadToCasePhotos, PhotoValidationError } from '@/lib/adminPhotoUpload'

const ALLOWED_FIELDS = new Set(['image_url', 'poster_url', 'scene_image_url'])

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { id } = await params
  const formData = await req.formData()
  const file = formData.get('photo')
  const field = formData.get('field')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No photo uploaded' }, { status: 400 })
  }
  if (typeof field !== 'string' || !ALLOWED_FIELDS.has(field)) {
    return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
  }

  const db = supabase()
  const { data: incident, error: lookupError } = await db.from('incidents').select('slug').eq('id', id).maybeSingle()
  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 })
  if (!incident) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  try {
    const url = await uploadToCasePhotos(file, `${incident.slug || id}/${field}`)

    const { error: updateError } = await db.from('incidents').update({ [field]: url }).eq('id', id)
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    return NextResponse.json({ success: true, url })
  } catch (err) {
    if (err instanceof PhotoValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    console.error('Case photo upload failed:', err)
    return NextResponse.json({ error: 'Could not upload photo' }, { status: 500 })
  }
}
