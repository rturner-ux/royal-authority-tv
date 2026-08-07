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

  // Total counts replies too (matches a Facebook-style aggregate comment
  // count), but only top-level comments are paginated/sorted -- replies
  // always render nested under their parent, oldest first, regardless of
  // the top-level sort mode.
  const total = enriched.length
  const topLevel = enriched.filter((c) => !c.parent_comment_id)
  const repliesByParent = new Map<string, typeof enriched>()
  for (const c of enriched) {
    if (!c.parent_comment_id) continue
    const list = repliesByParent.get(c.parent_comment_id) ?? []
    list.push(c)
    repliesByParent.set(c.parent_comment_id, list)
  }
  for (const list of repliesByParent.values()) {
    list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  const sortedTopLevel = topLevel.sort((a, b) => {
    if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    // best: highest score first, tie-broken by newest
    return b.score - a.score || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const pageItems = sortedTopLevel
    .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    .map((c) => ({ ...c, replies: repliesByParent.get(c.id) ?? [] }))

  return NextResponse.json({
    success: true,
    comments: pageItems,
    total,
    hasMore: (page + 1) * PAGE_SIZE < sortedTopLevel.length,
  })
}

export async function POST(req: NextRequest) {
  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Sign in to comment' }, { status: 401 })

  const { incidentId, body, recaptchaToken, parentCommentId } = await req.json()

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

  // Replies are capped at one level -- a reply's parent must itself be a
  // top-level comment, not another reply.
  if (parentCommentId) {
    const { data: parent } = await db
      .from('case_comments')
      .select('incident_id, parent_comment_id')
      .eq('id', parentCommentId)
      .maybeSingle()
    if (!parent || parent.incident_id !== incidentId) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
    }
    if (parent.parent_comment_id) {
      return NextResponse.json({ error: 'Cannot reply to a reply' }, { status: 400 })
    }
  }

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
      parent_comment_id: parentCommentId || null,
    })
    .select()
    .single()

  if (error) {
    console.error('case-comments insert error:', error)
    return NextResponse.json({ error: 'Could not save your comment' }, { status: 500 })
  }

  return NextResponse.json({ success: true, comment: { ...data, score: 0, myVote: 0, replies: [] } })
}
