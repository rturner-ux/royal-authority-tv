import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { getSubscriberStatus } from '@/lib/subscription'
import { getCasePartnershipForUser } from '@/lib/casePartners'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { id } = await params
  const partnership = await getCasePartnershipForUser(id, user.id)
  if (!partnership) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (partnership.status !== 'accepted') {
    return NextResponse.json({ error: 'Partnership is not active' }, { status: 403 })
  }

  const db = supabase()
  const { data: notes, error } = await db
    .from('case_partner_notes')
    .select('*')
    .eq('case_partner_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('case partner notes fetch error:', error)
    return NextResponse.json({ error: 'Could not load notes' }, { status: 500 })
  }

  return NextResponse.json({ success: true, notes })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { id } = await params
  const partnership = await getCasePartnershipForUser(id, user.id)
  if (!partnership) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (partnership.status !== 'accepted') {
    return NextResponse.json({ error: 'Partnership is not active' }, { status: 403 })
  }

  const { body } = await req.json()
  const trimmed = typeof body === 'string' ? body.trim() : ''
  if (!trimmed) return NextResponse.json({ error: 'Note cannot be empty' }, { status: 400 })
  if (trimmed.length > 2000) return NextResponse.json({ error: 'Note is too long' }, { status: 400 })

  const db = supabase()
  const { data, error } = await db
    .from('case_partner_notes')
    .insert({ case_partner_id: id, author_id: user.id, body: trimmed })
    .select()
    .single()

  if (error) {
    console.error('case partner note insert error:', error)
    return NextResponse.json({ error: 'Could not add note' }, { status: 500 })
  }

  return NextResponse.json({ success: true, note: data })
}
