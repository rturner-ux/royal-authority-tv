import 'server-only'
import { supabase } from './supabase/server'
import type { Incident, IncidentUpdate, IncidentPerson, IncidentTranscriptRow } from './types'

export async function getFeaturedCases(): Promise<Incident[]> {
  const db = supabase()
  const { data, error } = await db
    .from('incidents')
    .select('*')
    .eq('is_hidden', false)
    .eq('is_featured', true)
    .not('slug', 'is', null)
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Incident[]
}

export async function getCaseBySlug(slug: string): Promise<{
  incident: Incident
  updates: IncidentUpdate[]
  people: IncidentPerson[]
  transcript: IncidentTranscriptRow[]
} | null> {
  const db = supabase()
  const { data: incident, error } = await db
    .from('incidents')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  if (!incident || incident.is_hidden) return null

  const [{ data: updates }, { data: people }, { data: transcript }] = await Promise.all([
    db
      .from('incident_updates')
      .select('*')
      .eq('incident_id', incident.id)
      .order('event_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true }),
    db.from('incident_people').select('*').eq('incident_id', incident.id).order('sequence', { ascending: true }),
    db.from('incident_transcripts').select('*').eq('incident_id', incident.id).order('sequence', { ascending: true }),
  ])

  return {
    incident: incident as Incident,
    updates: (updates ?? []) as IncidentUpdate[],
    people: (people ?? []) as IncidentPerson[],
    transcript: (transcript ?? []) as IncidentTranscriptRow[],
  }
}
