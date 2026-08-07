import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { supabaseServerAuth } from '@/lib/supabase/serverAuth'
import type { CaseReactionEmoji, CaseReactionSummary } from '@/lib/types'

const EMOJIS: CaseReactionEmoji[] = ['support', 'sad', 'angry', 'shocked', 'prayers']

async function buildSummary(incidentId: string, userId: string | null): Promise<CaseReactionSummary> {
  const db = supabase()
  const { data } = await db.from('case_reactions').select('user_id, emoji').eq('incident_id', incidentId)

  const counts = { support: 0, sad: 0, angry: 0, shocked: 0, prayers: 0 } as Record<CaseReactionEmoji, number>
  let myReaction: CaseReactionEmoji | null = null
  for (const row of data ?? []) {
    counts[row.emoji as CaseReactionEmoji]++
    if (userId && row.user_id === userId) myReaction = row.emoji as CaseReactionEmoji
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return { counts, total, myReaction }
}

export async function GET(req: NextRequest) {
  const incidentId = req.nextUrl.searchParams.get('incidentId')
  if (!incidentId) return NextResponse.json({ error: 'Missing incidentId' }, { status: 400 })

  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()

  const summary = await buildSummary(incidentId, user?.id ?? null)
  return NextResponse.json({ success: true, ...summary })
}

export async function POST(req: NextRequest) {
  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to react' }, { status: 401 })

  const { incidentId, emoji } = await req.json()
  if (!incidentId) return NextResponse.json({ error: 'Missing incidentId' }, { status: 400 })
  if (emoji !== null && !EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 })
  }

  const db = supabase()

  if (emoji === null) {
    const { error } = await db.from('case_reactions').delete().eq('incident_id', incidentId).eq('user_id', user.id)
    if (error) return NextResponse.json({ error: 'Could not update reaction' }, { status: 500 })
  } else {
    const { error } = await db
      .from('case_reactions')
      .upsert({ incident_id: incidentId, user_id: user.id, emoji }, { onConflict: 'incident_id,user_id' })
    if (error) {
      console.error('case-reactions upsert error:', error)
      return NextResponse.json({ error: 'Could not update reaction' }, { status: 500 })
    }
  }

  const summary = await buildSummary(incidentId, user.id)
  return NextResponse.json({ success: true, ...summary })
}
