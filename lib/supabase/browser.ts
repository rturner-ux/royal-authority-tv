import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton -- every call used to spin up a brand new client (and, for
// Realtime, a brand new WebSocket). Components that create a channel with
// one supabaseBrowser() call and remove it with another (the normal
// mount/cleanup pattern) were creating and tearing down on two unrelated
// clients, leaking connections and letting live chat/presence channels
// silently stop receiving events after a while. One shared client fixes
// both the leak and the cleanup mismatch.
let client: SupabaseClient | undefined

export function supabaseBrowser() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
