import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { checkPermission } from '@/lib/moderatorPermissions'

// Every pending comment across every case, newest first -- a moderator
// needs the queue, not a per-case view, since they won't know in advance
// which case a report or a pending comment belongs to.
export async function GET() {
  const { allowed } = await checkPermission('moderate_comments')
  if (!allowed) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const db = supabase()
  const { data, error } = await db
    .from('case_comments')
    .select('id, incident_id, display_name, body, created_at, parent_comment_id, incidents(title, slug)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const comments = (data ?? []).map((c) => ({
    ...c,
    incident: Array.isArray(c.incidents) ? c.incidents[0] : c.incidents,
  }))

  return NextResponse.json({ success: true, comments })
}

export async function PATCH(req: NextRequest) {
  const { allowed } = await checkPermission('moderate_comments')
  if (!allowed) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { commentId, action } = await req.json()
  if (!commentId || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json({ error: 'Missing commentId or invalid action' }, { status: 400 })
  }

  const db = supabase()
  const { error } = await db
    .from('case_comments')
    .update({ status: action === 'approve' ? 'approved' : 'rejected' })
    .eq('id', commentId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
