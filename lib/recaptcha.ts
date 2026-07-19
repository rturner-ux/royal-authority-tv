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
    return data.success && (data.score ?? 1) >= 0.5
  } catch {
    return true // Non-fatal -- allow through if verification itself fails
  }
}
