import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Distinct from lib/supabase/server.ts's service-role client: this one
// carries the visitor's own session (via cookies), so `auth.uid()` and RLS
// policies scoped to `authenticated` actually apply.
export async function supabaseServerAuth() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // Called from a Server Component that can't set cookies -- the
            // middleware below is what actually refreshes the session.
          }
        },
      },
    }
  )
}
