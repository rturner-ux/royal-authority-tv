import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { supabaseServerAuth } from '@/lib/supabase/serverAuth'
import { verifyRecaptcha } from '@/lib/recaptcha'

const MAX_BODY_LENGTH = 2000
const PAGE_SIZE = 20

type SortMode = 'best' | 'newest' | 'oldest'

// Real, account-backed case discussion -- replaces the old client-only
// "Discussion" mockup that never persisted anything and didn't require
// login. Comments start pending (same house rule as person_comments: public
// commentary about real, sometimes-active cases needs a human look before
// it's visible), but a poster always sees their own pending comment in
// their own response so the page doesn't feel like it silently ate it.
export async function GET(req: NextRequest) {
  const incidentId = req.nextUrl.searchParams.get('incidentId')
  const sort = (req.nextUrl.searchParams.get('sort') as SortMode) || 'best'
  const page = Math.max(0, parseInt(req.nextUrl.searchParams.get('page') || '0', 10) || 0)

  if (!incidentId) return NextResponse.json({ error: 'Missing incidentId' }, { status: 400 })

  const db = supabase()
  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()

  const { data: comments, error } = await db
    .from('case_comments')
    .select('*')
    .eq('incident_id', incidentId)
    .in('status', user ? ['approved', 'pending'] : ['approved'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('case-comments fetch error:', error)
    return NextResponse.json({ error: 'Could not load comments' }, { status: 500 })
  }

  // A signed-in user should see their OWN pending comments (so posting
  // doesn't feel like it vanished) but never anyone else's.
  const visible = (comments ?? []).filter((c) => c.status === 'approved' || c.user_id === user?.id)

  const commentIds = visible.map((c) => c.id)
  const { data: votes } = commentIds.length
    ? await db.from('case_comment_votes').select('comment_id, user_id, direction').in('comment_id', commentIds)
    : { data: [] }

  const scoreByComment = new Map<string, number>()
  const myVoteByComment = new Map<string, number>()
  for (const v of votes ?? []) {
    scoreByComment.set(v.comment_id, (scoreByComment.get(v.comment_id) ?? 0) + v.direction)
    if (user && v.user_id === user.id) myVoteByComment.set(v.comment_id, v.direction)
  }

  const enriched = visible.map((c) => ({
    ...c,
    score: scoreByComment.get(c.id) ?? 0,
    myVote: myVoteByComment.get(c.id) ?? 0,
  }))

  const sorted = enriched.sort((a, b) => {
    if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    // best: highest score first, tie-broken by newest
    return b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const total = sorted.length
  const pageItems = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return NextResponse.json({ success: true, comments: pageItems, total, hasMore: (page + 1) * PAGE_SIZE < total })
}

export async function POST(req: NextRequest) {
  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Sign in to comment' }, { status: 401 })

  const { incidentId, body, recaptchaToken } = await req.json()

  if (!incidentId || typeof body !== 'string' || !body.trim()) {
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

  const { data: profile } = await authDb
    .from('subscriber_profiles')
    .select('callsign')
    .eq('user_id', user.id)
    .maybeSingle()

  const displayName = profile?.callsign?.trim() || 'Investigator'

  const { data, error } = await db
    .from('case_comments')
    .insert({
      incident_id: incidentId,
      user_id: user.id,
      display_name: displayName,
      body: body.trim(),
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('case-comments insert error:', error)
    return NextResponse.json({ error: 'Could not save your comment' }, { status: 500 })
  }

  return NextResponse.json({ success: true, comment: { ...data, score: 0, myVote: 0 } })
}
