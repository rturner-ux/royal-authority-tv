import 'server-only'
import { supabase } from './supabase/server'

export async function getTotalClicks(): Promise<number> {
  const db = supabase()
  const { data } = await db.from('site_click_counter').select('total_clicks').eq('id', 1).maybeSingle()
  return data?.total_clicks ?? 0
}
