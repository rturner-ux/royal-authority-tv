import 'server-only'
import { supabase } from './supabase/server'
import { ADMIN_USER_ID } from './welcomeMessage'
import { notifyAdmin } from './adminNotify'

const PRIZE_AMOUNT = 100

function isLastDayOfMonth(date: Date): boolean {
  const tomorrow = new Date(date)
  tomorrow.setDate(date.getDate() + 1)
  return tomorrow.getMonth() !== date.getMonth()
}

function firstOfMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

async function ensureFriendship(db: ReturnType<typeof supabase>, userId: string) {
  const { data: existing } = await db
    .from('friend_requests')
    .select('id, status')
    .or(`and(sender_id.eq.${ADMIN_USER_ID},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${ADMIN_USER_ID})`)
    .maybeSingle()

  if (!existing) {
    await db.from('friend_requests').insert({
      sender_id: ADMIN_USER_ID,
      recipient_id: userId,
      status: 'accepted',
      responded_at: new Date().toISOString(),
    })
  } else if (existing.status !== 'accepted') {
    await db.from('friend_requests').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('id', existing.id)
  }
}

// Only actually picks a winner on the last calendar day of the month, and
// only once -- `month` is unique in the DB, so a second call for a month
// that already has a winner is a no-op even if the cron fires more than
// once. Every active subscriber is eligible every month, including past
// winners -- no "can't win twice" exclusion, since none was asked for.
export async function runMonthlyGiveaway(now: Date = new Date()): Promise<{ ran: boolean; reason: string }> {
  if (!isLastDayOfMonth(now)) {
    return { ran: false, reason: 'Not the last day of the month' }
  }

  const db = supabase()
  const month = firstOfMonth(now)

  const { data: existingWinner } = await db.from('giveaway_winners').select('id').eq('month', month).maybeSingle()
  if (existingWinner) {
    return { ran: false, reason: 'Winner already selected for this month' }
  }

  const { data: activeSubs } = await db.from('subscribers').select('user_id').eq('status', 'active')
  const pool = (activeSubs ?? []).map((s) => s.user_id).filter((id) => id !== ADMIN_USER_ID)

  if (pool.length === 0) {
    return { ran: false, reason: 'No eligible members' }
  }

  const winnerId = pool[Math.floor(Math.random() * pool.length)]

  const { data: profile } = await db.from('subscriber_profiles').select('callsign').eq('user_id', winnerId).maybeSingle()
  const callsign = profile?.callsign ?? null

  const { error: insertError } = await db.from('giveaway_winners').insert({
    user_id: winnerId,
    callsign,
    month,
    prize_amount: PRIZE_AMOUNT,
  })
  // A unique-constraint failure here means another run just beat us to it
  // (race at the exact month boundary) -- treat as already-handled, not
  // an error, rather than double-messaging a winner.
  if (insertError) {
    return { ran: false, reason: 'Winner already selected for this month' }
  }

  await ensureFriendship(db, winnerId)
  await db.from('direct_messages').insert({
    sender_id: ADMIN_USER_ID,
    recipient_id: winnerId,
    body:
      `You're this month's winner of the $${PRIZE_AMOUNT} Amazon gift card giveaway! Congratulations. ` +
      "I'll be in touch here to get your gift card to you.\n\n- Royal",
  })

  await notifyAdmin(
    `${callsign || 'A member'} won this month's $${PRIZE_AMOUNT} Amazon gift card giveaway -- send their gift card.`,
    `/account/messages/${winnerId}`
  )

  return { ran: true, reason: 'Winner selected' }
}
