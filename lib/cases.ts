import 'server-only'
import { supabase } from './supabase/server'
import type { Incident, IncidentUpdate, IncidentPerson, IncidentTranscriptRow, InterviewQA } from './types'

async function attachQA(db: ReturnType<typeof supabase>, people: IncidentPerson[]): Promise<IncidentPerson[]> {
  if (people.length === 0) return people

  const { data: qa } = await db
    .from('interview_qa')
    .select('*')
    .in('person_id', people.map((p) => p.id))
    .order('sequence', { ascending: true })

  const byPerson = new Map<string, InterviewQA[]>()
  for (const item of (qa ?? []) as InterviewQA[]) {
    const list = byPerson.get(item.person_id) ?? []
    list.push(item)
    byPerson.set(item.person_id, list)
  }

  return people.map((person) => ({ ...person, qa: byPerson.get(person.id) ?? [] }))
}

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

export async function getSiteStats(): Promise<{
  totalCases: number
  featuredCases: number
  transcriptRows: number
}> {
  const db = supabase()
  const [totalCases, featuredCases, transcriptRows] = await Promise.all([
    db.from('incidents').select('*', { count: 'exact', head: true }).eq('is_hidden', false),
    db.from('incidents').select('*', { count: 'exact', head: true }).eq('is_hidden', false).eq('is_featured', true),
    db.from('incident_transcripts').select('*', { count: 'exact', head: true }),
  ])

  return {
    totalCases: totalCases.count ?? 0,
    featuredCases: featuredCases.count ?? 0,
    transcriptRows: transcriptRows.count ?? 0,
  }
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
    people: await attachQA(db, (people ?? []) as IncidentPerson[]),
    transcript: (transcript ?? []) as IncidentTranscriptRow[],
  }
}
