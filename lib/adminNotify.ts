import 'server-only'
import { supabase } from './supabase/server'

// A lightweight, generic alert feed for the admin -- kept separate from
// case_notifications (tied to a specific incident) since this covers
// site-operations events instead.
export async function notifyAdmin(message: string, link?: string): Promise<void> {
  const db = supabase()
  await db.from('admin_notifications').insert({ message, link: link ?? null })
}
