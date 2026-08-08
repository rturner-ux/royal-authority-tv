import { NextRequest, NextResponse } from 'next/server'
import { supabaseServerAuth } from '@/lib/supabase/serverAuth'
import { supabase } from '@/lib/supabase/server'
import { ALL_MODERATOR_PERMISSIONS } from '@/lib/moderatorPermissions'

async function requireAdmin() {
  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()
  if (!user) return null

  const { data } = await authDb.from('subscriber_profiles').select('is_admin').eq('user_id', user.id).maybeSingle()
  return data?.is_admin ? user : null
}

// Every member with a callsign, optionally filtered by search -- the same
// pool the directory draws from, since you can only promote someone you
// can actually find and identify.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const q = req.nextUrl.searchParams.get('q')?.trim()
  const db = supabase()
  let query = db
    .from('subscriber_profiles')
    .select('user_id, callsign, avatar_url, is_verified, is_admin, is_moderator, moderator_permissions')
    .not('callsign', 'is', null)
    .order('callsign', { ascending: true })
    .limit(50)

  if (q) query = query.ilike('callsign', `%${q}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, members: data })
}

// Toggle moderator status for a member. Turning it off clears their
// permissions too, so re-promoting someone later starts from a clean
// slate instead of silently restoring whatever they had before. Admin
// status itself is not grantable here -- deliberately left as a
// direct-database action only.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { userId, isModerator } = await req.json()
  if (!userId || typeof isModerator !== 'boolean') {
    return NextResponse.json({ error: 'Missing userId or isModerator' }, { status: 400 })
  }

  const db = supabase()
  const { error } = await db
    .from('subscriber_profiles')
    .update({ is_moderator: isModerator, ...(isModerator ? {} : { moderator_permissions: [] }) })
    .eq('user_id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// Sets the exact permission list for a moderator (replaces, not merges --
// the client always sends the full checked set).
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const { userId, permissions } = await req.json()
  if (!userId || !Array.isArray(permissions)) {
    return NextResponse.json({ error: 'Missing userId or permissions' }, { status: 400 })
  }
  const valid = permissions.filter((p) => (ALL_MODERATOR_PERMISSIONS as string[]).includes(p))

  const db = supabase()
  const { error } = await db.from('subscriber_profiles').update({ moderator_permissions: valid }).eq('user_id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
