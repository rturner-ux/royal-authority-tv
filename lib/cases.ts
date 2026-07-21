import 'server-only'
import { supabase } from './supabase/server'
import type { Incident, IncidentUpdate, IncidentPerson, IncidentTranscriptRow, IncidentCourtRecord, IncidentPhoto, InterviewQA, PersonConnectedCase } from './types'

async function attachQAAndCases(db: ReturnType<typeof supabase>, people: IncidentPerson[]): Promise<IncidentPerson[]> {
  if (people.length === 0) return people

  const personIds = people.map((p) => p.id)
  const [{ data: qa }, { data: connectedCases }] = await Promise.all([
    db.from('interview_qa').select('*').in('person_id', personIds).order('sequence', { ascending: true }),
    db.from('person_connected_cases').select('*').in('person_id', personIds).order('sequence', { ascending: true }),
  ])

  const qaByPerson = new Map<string, InterviewQA[]>()
  for (const item of (qa ?? []) as InterviewQA[]) {
    const list = qaByPerson.get(item.person_id) ?? []
    list.push(item)
    qaByPerson.set(item.person_id, list)
  }

  const casesByPerson = new Map<string, PersonConnectedCase[]>()
  for (const item of (connectedCases ?? []) as PersonConnectedCase[]) {
    const list = casesByPerson.get(item.person_id) ?? []
    list.push(item)
    casesByPerson.set(item.person_id, list)
  }

  return people.map((person) => ({
    ...person,
    qa: qaByPerson.get(person.id) ?? [],
    connectedCases: casesByPerson.get(person.id) ?? [],
  }))
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

export async function getTrendingCases(): Promise<Incident[]> {
  const db = supabase()
  const { data, error } = await db
    .from('incidents')
    .select('*')
    .eq('is_hidden', false)
    .eq('is_featured', true)
    .eq('is_trending', true)
    .not('slug', 'is', null)
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Incident[]
}

// Unlike getFeaturedCases/getTrendingCases, this deliberately includes cases
// without a slug (most automated-ingestion cases never get one) since the
// pattern intelligence tool correlates against the full map, not just cases
// with a dedicated case-file page.
export async function getAllVisibleCases(): Promise<Incident[]> {
  const db = supabase()
  const { data, error } = await db.from('incidents').select('*').eq('is_hidden', false)

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
  courtRecords: IncidentCourtRecord[]
  photos: IncidentPhoto[]
  relatedIncident: Pick<Incident, 'slug' | 'title' | 'category' | 'image_url'> | null
} | null> {
  const db = supabase()
  const { data: incident, error } = await db
    .from('incidents')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  if (!incident || incident.is_hidden) return null

  const [{ data: updates }, { data: people }, { data: transcript }, { data: courtRecords }, { data: photos }, relatedResult] = await Promise.all([
    db
      .from('incident_updates')
      .select('*')
      .eq('incident_id', incident.id)
      .order('event_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
    db.from('incident_people').select('*').eq('incident_id', incident.id).order('sequence', { ascending: true }),
    db.from('incident_transcripts').select('*').eq('incident_id', incident.id).order('sequence', { ascending: true }),
    db.from('incident_court_records').select('*').eq('incident_id', incident.id).order('sequence', { ascending: true }),
    db.from('incident_photos').select('*').eq('incident_id', incident.id).order('sequence', { ascending: true }),
    incident.related_incident_id
      ? db
          .from('incidents')
          .select('slug, title, category, image_url')
          .eq('id', incident.related_incident_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  return {
    incident: incident as Incident,
    updates: (updates ?? []) as IncidentUpdate[],
    people: await attachQAAndCases(db, (people ?? []) as IncidentPerson[]),
    transcript: (transcript ?? []) as IncidentTranscriptRow[],
    courtRecords: (courtRecords ?? []) as IncidentCourtRecord[],
    photos: (photos ?? []) as IncidentPhoto[],
    relatedIncident: relatedResult.data,
  }
}
