import 'server-only'
import { supabaseServerAuth } from './supabase/serverAuth'
import type { User } from '@supabase/supabase-js'

export type SubscriberStatus = {
  user: User | null
  isActive: boolean
}

// Single place that decides "is this viewer an active subscriber" -- every
// gated page/route should go through this rather than querying `subscribers`
// directly, so the definition of "active" only lives in one spot.
//
// Called from the existing public case-file page, so this must never throw:
// before Supabase Auth env vars are configured (or on any transient error),
// fail open to "not a subscriber" rather than breaking a page that worked
// fine before subscriptions existed.
export async function getSubscriberStatus(): Promise<SubscriberStatus> {
  try {
    const db = await supabaseServerAuth()
    const {
      data: { user },
    } = await db.auth.getUser()

    if (!user) return { user: null, isActive: false }

    const { data } = await db
      .from('subscribers')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()

    return { user, isActive: data?.status === 'active' }
  } catch (err) {
    console.error('getSubscriberStatus failed:', err)
    return { user: null, isActive: false }
  }
}
