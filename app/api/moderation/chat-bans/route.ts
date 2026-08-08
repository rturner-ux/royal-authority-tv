import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { checkPermission } from '@/lib/moderatorPermissions'

export async function GET() {
  const { allowed } = await checkPermission('moderate_chat')
  if (!allowed) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const db = supabase()
  const { data, error } = await db
    .from('live_chat_bans')
    .select('user_id, display_name, banned_at, reason')
    .order('banned_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, bans: data })
}

export async function POST(req: NextRequest) {
  const { allowed, userId: moderatorId } = await checkPermission('moderate_chat')
  if (!allowed) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { userId, displayName, reason } = await req.json()
  if (!userId || !displayName) {
    return NextResponse.json({ error: 'Missing userId or displayName' }, { status: 400 })
  }

  const db = supabase()
  const { error } = await db.from('live_chat_bans').upsert({
    user_id: userId,
    display_name: displayName,
    banned_by: moderatorId,
    reason: reason || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { allowed } = await checkPermission('moderate_chat')
  if (!allowed) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const db = supabase()
  const { error } = await db.from('live_chat_bans').delete().eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
