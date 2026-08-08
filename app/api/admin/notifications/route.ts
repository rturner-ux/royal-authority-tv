import { NextRequest, NextResponse } from 'next/server'
import { supabaseServerAuth } from '@/lib/supabase/serverAuth'
import { supabase } from '@/lib/supabase/server'

async function requireAdmin() {
  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()
  if (!user) return null

  const { data } = await authDb.from('subscriber_profiles').select('is_admin').eq('user_id', user.id).maybeSingle()
  return data?.is_admin ? user : null
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const db = supabase()
  const { data, error } = await db
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, notifications: data })
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { id, all } = await req.json()
  const db = supabase()

  if (all) {
    const { error } = await db.from('admin_notifications').update({ read_at: new Date().toISOString() }).is('read_at', null)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (!id) return NextResponse.json({ error: 'id or all required' }, { status: 400 })
  const { error } = await db.from('admin_notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
