import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/unsubscribe/case-alerts?status=missing-token', req.url))
  }

  const db = supabase()
  const { error } = await db
    .from('subscriber_profiles')
    .update({ email_alerts_enabled: false })
    .eq('alert_unsubscribe_token', token)

  if (error) {
    return NextResponse.redirect(new URL('/unsubscribe/case-alerts?status=error', req.url))
  }

  return NextResponse.redirect(new URL('/unsubscribe/case-alerts?status=done', req.url))
}
