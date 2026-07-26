import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { supabaseServerAuth } from '@/lib/supabase/serverAuth'

export async function POST(req: NextRequest) {
  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Sign in to vote' }, { status: 401 })

  const { commentId, direction } = await req.json()
  if (!commentId || (direction !== 1 && direction !== -1 && direction !== 0)) {
    return NextResponse.json({ error: 'Invalid vote' }, { status: 400 })
  }

  const db = supabase()

  if (direction === 0) {
    // Clicking an already-active vote again clears it, rather than being
    // stuck toggling between up and down with no way to just remove it.
    const { error } = await db.from('case_comment_votes').delete().eq('comment_id', commentId).eq('user_id', user.id)
    if (error) return NextResponse.json({ error: 'Could not update vote' }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  const { error } = await db
    .from('case_comment_votes')
    .upsert({ comment_id: commentId, user_id: user.id, direction }, { onConflict: 'comment_id,user_id' })

  if (error) {
    console.error('case-comments vote error:', error)
    return NextResponse.json({ error: 'Could not update vote' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
