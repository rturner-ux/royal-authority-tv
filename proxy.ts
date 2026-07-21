import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Blocks the default user-agent strings of common scraping libraries and
// tools. This stops casual/automated scraping scripts that don't bother
// spoofing a browser UA -- it does nothing against a determined scraper
// that sets a normal browser user-agent, since that's indistinguishable
// from a real visitor at this layer. Real search engine bots (Googlebot,
// Bingbot, etc.) are intentionally left alone -- see app/robots.ts for how
// crawling is actually managed.
const BLOCKED_UA_PATTERNS = [
  /curl\//i,
  /wget/i,
  /python-requests/i,
  /python-urllib/i,
  /scrapy/i,
  /httpie/i,
  /node-fetch/i,
  /^axios/i,
  /go-http-client/i,
  /libwww-perl/i,
  /^java\//i,
  /^php/i,
  /okhttp/i,
  /apache-httpclient/i,
  /^$/, // no user-agent at all
]

// Standard @supabase/ssr refresh pattern: reads/writes the auth cookie on
// every request so sessions don't silently expire between page loads.
export async function proxy(request: NextRequest) {
  const ua = request.headers.get('user-agent') || ''
  if (BLOCKED_UA_PATTERNS.some((p) => p.test(ua))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Runs on almost every route (see matcher below). Before the anon key is
  // configured in Vercel, fail open rather than breaking the entire site.
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)',
  ],
}
