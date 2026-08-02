import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { supabaseServerAuth } from '@/lib/supabase/serverAuth'

const MAX_BODY_LENGTH = 300
const HISTORY_SIZE = 50
const MIN_INTERVAL_MS = 2000

// Read is public (matches CaseComments), write requires sign-in. Unlike
// case_comments there's no pending-review queue -- chat is ephemeral and
// live, a moderation delay would defeat the point -- so this leans on a
// simple per-user rate limit instead of a review step.
export async function GET(req: NextRequest) {
  const streamId = req.nextUrl.searchParams.get('streamId')
  if (!streamId) return NextResponse.json({ error: 'Missing streamId' }, { status: 400 })

  const db = supabase()
  const { data, error } = await db
    .from('live_chat_messages')
    .select('*')
    .eq('live_stream_id', streamId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_SIZE)

  if (error) return NextResponse.json({ error: 'Could not load chat' }, { status: 500 })

  return NextResponse.json({ success: true, messages: (data ?? []).reverse() })
}

export async function POST(req: NextRequest) {
  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Sign in to chat' }, { status: 401 })

  const db = supabase()

  const { data: ban } = await db.from('live_chat_bans').select('user_id').eq('user_id', user.id).maybeSingle()
  if (ban) return NextResponse.json({ error: 'You have been removed from chat by a moderator' }, { status: 403 })

  const { streamId, body } = await req.json()
  if (!streamId || typeof body !== 'string' || !body.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (body.length > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
  }

  const { data: recent } = await db
    .from('live_chat_messages')
    .select('created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (recent && Date.now() - new Date(recent.created_at).getTime() < MIN_INTERVAL_MS) {
    return NextResponse.json({ error: 'You are sending messages too fast' }, { status: 429 })
  }

  const { data: profile } = await authDb
    .from('subscriber_profiles')
    .select('callsign')
    .eq('user_id', user.id)
    .maybeSingle()

  const displayName = profile?.callsign?.trim() || 'Investigator'

  const { data, error } = await db
    .from('live_chat_messages')
    .insert({
      live_stream_id: streamId,
      user_id: user.id,
      display_name: displayName,
      body: body.trim(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Could not send message' }, { status: 500 })

  return NextResponse.json({ success: true, message: data })
}
