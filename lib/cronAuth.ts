import 'server-only'
import { NextRequest } from 'next/server'

export function isAuthorizedCronRequest(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  const given = req.headers.get('authorization')
  return Boolean(secret) && given === `Bearer ${secret}`
}
