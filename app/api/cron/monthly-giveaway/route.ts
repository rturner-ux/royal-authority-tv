import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedCronRequest } from '@/lib/cronAuth'
import { runMonthlyGiveaway } from '@/lib/giveaway'

export const dynamic = 'force-dynamic'

// Fires daily (see vercel.json) -- runMonthlyGiveaway() itself checks
// whether today is actually the last day of the month and whether a
// winner has already been picked, so most days this is a fast no-op.
export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runMonthlyGiveaway()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('monthly-giveaway cron error:', err)
    return NextResponse.json({ success: false, message: 'Giveaway run failed' }, { status: 500 })
  }
}
