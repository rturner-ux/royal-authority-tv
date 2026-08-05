import 'server-only'
import { supabase } from './supabase/server'
import type { CasePartner } from './types'

export async function getCasePartnershipForUser(id: string, userId: string): Promise<CasePartner | null> {
  const db = supabase()
  const { data } = await db.from('case_partners').select('*').eq('id', id).maybeSingle()
  if (!data) return null
  if (data.initiator_id !== userId && data.partner_id !== userId) return null
  return data as CasePartner
}
