import { NextResponse } from 'next/server'
import { supabaseServerAuth } from '@/lib/supabase/serverAuth'
import { supabase } from '@/lib/supabase/server'
import { squareClient } from '@/lib/square/client'

export async function POST() {
  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const db = supabase()
  const { data: subscriber } = await db
    .from('subscribers')
    .select('square_subscription_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!subscriber?.square_subscription_id) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
  }

  try {
    // Square schedules the cancellation for the end of the current billing
    // period rather than canceling immediately; the webhook updates our
    // `status` once Square actually flips it to CANCELED.
    await squareClient().subscriptions.cancel({
      subscriptionId: subscriber.square_subscription_id,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('cancel-subscription error:', err)
    return NextResponse.json({ error: 'Could not cancel subscription' }, { status: 500 })
  }
}
