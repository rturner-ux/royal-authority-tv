import 'server-only'
import { supabase } from './supabase/server'
import type { LiveStream } from './types'

// Selects specific columns rather than '*' -- mux_stream_key is a write
// credential for the admin's encoder and must never reach this public app.
export async function getCurrentLiveStream(): Promise<LiveStream | null> {
  const db = supabase()
  const { data } = await db
    .from('live_streams')
    .select('id, title, status, mux_playback_id, started_at')
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data ?? null
}
