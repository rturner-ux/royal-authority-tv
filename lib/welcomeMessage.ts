import 'server-only'
import { supabase } from './supabase/server'

// The owner's own account (rturner@2eztek.com), also the "ROYAL" verified
// journalist account used elsewhere on the site.
export const ADMIN_USER_ID = 'f9792a46-9b72-4199-a338-e074d86421c7'

const WELCOME_BODY =
  "Welcome to Royal Authority TV! Thank you for subscribing. I'm really glad to have you here as " +
  "part of this community.\n\n" +
  "A few things you now have access to:\n" +
  "- Pattern Intelligence: cases clustered by timing, distance, and real similarity\n" +
  "- The Investigation Board and Playlists, to track and organize the cases you're following\n" +
  "- The Subscriber Directory, Friends, and Messages, to connect with other members\n" +
  "- Live chat during broadcasts\n" +
  "- AI Picture Scan and the full Transcript Archive\n" +
  "- Deeper case content across the board, plus early access to new cases\n\n" +
  "If you ever have questions, spot something worth digging into, or just want to talk about a " +
  "case, my inbox is open. Glad you're here.\n\n- Royal"

// Messages only render between accepted friends, so this creates that
// friendship first if it doesn't already exist, then sends the welcome DM.
// Safe to call more than once for the same user -- upsert on the
// friendship, and this only ever sends one welcome message per user
// (checked by the caller, not here, since "already welcomed" is a
// judgment call the caller is better positioned to make).
export async function sendWelcomeMessage(userId: string): Promise<void> {
  if (userId === ADMIN_USER_ID) return

  const db = supabase()

  const { data: existingFriendship } = await db
    .from('friend_requests')
    .select('id, status')
    .or(
      `and(sender_id.eq.${ADMIN_USER_ID},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${ADMIN_USER_ID})`
    )
    .maybeSingle()

  if (!existingFriendship) {
    await db.from('friend_requests').insert({
      sender_id: ADMIN_USER_ID,
      recipient_id: userId,
      status: 'accepted',
      responded_at: new Date().toISOString(),
    })
  } else if (existingFriendship.status !== 'accepted') {
    await db.from('friend_requests').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('id', existingFriendship.id)
  }

  await db.from('direct_messages').insert({
    sender_id: ADMIN_USER_ID,
    recipient_id: userId,
    body: WELCOME_BODY,
  })
}
