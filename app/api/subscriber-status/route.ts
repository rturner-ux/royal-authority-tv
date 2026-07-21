import { NextResponse } from 'next/server'
import { getSubscriberStatus } from '@/lib/subscription'
import { supabaseServerAuth } from '@/lib/supabase/serverAuth'

// Lightweight endpoint just for client components (like Navbar) that need to
// know subscriber status but can't call the server-only getSubscriberStatus
// directly -- e.g. pages that are themselves "use client" and render Navbar
// in their own JSX, which rules out Navbar being an async Server Component.
export async function GET() {
  const { user, isActive } = await getSubscriberStatus()

  let role: string | null = null
  let callsign: string | null = null

  if (user && isActive) {
    const db = await supabaseServerAuth()
    const { data } = await db
      .from('subscriber_profiles')
      .select('role, callsign')
      .eq('user_id', user.id)
      .maybeSingle()
    role = data?.role ?? null
    callsign = data?.callsign ?? null
  }

  return NextResponse.json({ isActive, role, callsign })
}
