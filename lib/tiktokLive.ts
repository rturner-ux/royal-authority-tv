import 'server-only'

const TIKTOK_USERNAME = 'royalauthoritytv'

// TikTok has no public API for checking an arbitrary account's live status,
// so this scrapes the public profile/live page instead -- inherently fragile
// (TikTok can change their markup/redirect behavior at any time without
// notice) and technically against their Terms of Service. Fails safe to
// `false` on any error/timeout/ambiguity rather than risk a stuck-on or
// incorrect LIVE badge. If this stops working after a TikTok site change,
// that's the tradeoff that was explicitly accepted over a manual toggle.
//
// Heuristic: TikTok redirects /@user/live back to /@user when the account
// isn't currently live, but keeps the response on a live-room URL when it
// is. Checking the final resolved URL is more resilient to TikTok's
// internal page markup changing than trying to string-match embedded JSON.
export async function isTikTokLive(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(`https://www.tiktok.com/@${TIKTOK_USERNAME}/live`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
      signal: controller.signal,
      next: { revalidate: 60 },
    })

    clearTimeout(timeout)

    if (!res.ok) return false

    return res.url.includes('/live')
  } catch (err) {
    console.error('isTikTokLive check failed:', err)
    return false
  }
}
