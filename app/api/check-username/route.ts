import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const VALID_USERNAME = /^[a-zA-Z0-9_]{3,20}$/

// Public and unauthenticated by design -- called from the signup form
// before an account (and session) exists yet.
export async function GET(req: NextRequest) {
  const username = (req.nextUrl.searchParams.get('username') || '').trim()

  if (!VALID_USERNAME.test(username)) {
    return NextResponse.json({
      available: false,
      reason: '3-20 characters, letters, numbers, and underscores only.',
    })
  }

  const db = supabase()
  const { data } = await db
    .from('subscriber_profiles')
    .select('user_id')
    .ilike('callsign', username)
    .maybeSingle()

  return NextResponse.json({ available: !data })
}
