import { NextRequest, NextResponse } from 'next/server'
import { getSubscriberStatus } from '@/lib/subscription'
import { supabaseServerAuth } from '@/lib/supabase/serverAuth'
import { getCaseBySlug } from '@/lib/cases'
import { generateToolkitContent } from '@/lib/toolkitPrompts'

export async function POST(req: NextRequest) {
  const { user, isActive } = await getSubscriberStatus()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!isActive) return NextResponse.json({ error: 'Subscription required' }, { status: 403 })

  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const result = await getCaseBySlug(slug)
  if (!result) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  const db = await supabaseServerAuth()
  const { data: profile } = await db
    .from('subscriber_profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  const role = profile?.role ?? null

  try {
    const content = await generateToolkitContent(role, {
      title: result.incident.title,
      description: result.incident.description,
      updates: result.updates,
      people: result.people,
    })
    return NextResponse.json({ role, content })
  } catch (err) {
    console.error('Toolkit generation failed:', err)
    return NextResponse.json({ error: 'Could not generate content right now' }, { status: 500 })
  }
}
