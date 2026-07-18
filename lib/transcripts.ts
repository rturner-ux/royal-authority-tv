import 'server-only'
import { supabase } from './supabase/server'
import type { Incident } from './types'

export async function getCasesWithTranscripts(): Promise<Incident[]> {
  const db = supabase()
  const { data: rows } = await db.from('incident_transcripts').select('incident_id')
  const ids = [...new Set((rows ?? []).map((r) => r.incident_id))]
  if (ids.length === 0) return []

  const { data, error } = await db
    .from('incidents')
    .select('*')
    .in('id', ids)
    .eq('is_hidden', false)
    .not('slug', 'is', null)
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Incident[]
}
