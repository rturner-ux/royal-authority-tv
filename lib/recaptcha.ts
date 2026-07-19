import 'server-only'

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret || !token) return true // Skip if not configured

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`,
    })
    const data = await res.json()

    // reCAPTCHA v3 scores brand-new domains conservatively since Google has
    // no trust history yet -- this blocked a real paying subscriber on launch
    // week. Log the real score for visibility, but don't hard-block on it
    // until there's enough traffic history for the threshold to be
    // meaningful. Revisit once this site has an established score baseline.
    console.log('recaptcha result:', { success: data.success, score: data.score })
    return data.success !== false
  } catch {
    return true // Non-fatal -- allow through if verification itself fails
  }
}
