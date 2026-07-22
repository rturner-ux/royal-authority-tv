import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { verifyRecaptcha } from '@/lib/recaptcha'

const MAX_BODY_LENGTH = 2000
const MAX_NAME_LENGTH = 60

export async function POST(req: NextRequest) {
  const { personId, displayName, body, recaptchaToken } = await req.json()

  if (!personId || typeof body !== 'string' || !body.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (body.length > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: 'Comment is too long' }, { status: 400 })
  }

  const recaptchaOk = await verifyRecaptcha(recaptchaToken)
  if (!recaptchaOk) {
    return NextResponse.json({ error: 'Could not verify you are not a bot' }, { status: 400 })
  }

  const db = supabase()

  const { data: person, error: personError } = await db
    .from('incident_people')
    .select('id, incident_id, role')
    .eq('id', personId)
    .maybeSingle()

  if (personError || !person) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 })
  }
  if (person.role !== 'witness') {
    return NextResponse.json({ error: 'Comments are not open on this profile' }, { status: 403 })
  }

  const cleanName = typeof displayName === 'string' ? displayName.trim().slice(0, MAX_NAME_LENGTH) : ''

  const { error } = await db.from('person_comments').insert({
    person_id: person.id,
    incident_id: person.incident_id,
    display_name: cleanName || null,
    body: body.trim(),
    status: 'pending',
  })

  if (error) {
    console.error('person-comments insert error:', error)
    return NextResponse.json({ error: 'Could not save your comment' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
