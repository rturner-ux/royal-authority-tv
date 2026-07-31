import 'server-only'
import { supabase } from './supabase/server'
import type { Incident, IncidentUpdate, IncidentPerson, IncidentTranscriptRow, IncidentCourtRecord, IncidentPhoto, IncidentVideo, InterviewQA, PersonConnectedCase, PersonComment, IncidentCourtCase, IncidentCharge, IncidentBondSetting, IncidentFinancialRecord, CaseConnectionNode, CaseConnectionEdge } from './types'

async function attachQAAndCases(db: ReturnType<typeof supabase>, people: IncidentPerson[]): Promise<IncidentPerson[]> {
  if (people.length === 0) return people

  const personIds = people.map((p) => p.id)
  const [{ data: qa }, { data: connectedCases }, { data: comments }] = await Promise.all([
    db.from('interview_qa').select('*').in('person_id', personIds).order('sequence', { ascending: true }),
    db.from('person_connected_cases').select('*').in('person_id', personIds).order('sequence', { ascending: true }),
    db
      .from('person_comments')
      .select('*')
      .in('person_id', personIds)
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),
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

  const commentsByPerson = new Map<string, PersonComment[]>()
  for (const item of (comments ?? []) as PersonComment[]) {
    const list = commentsByPerson.get(item.person_id) ?? []
    list.push(item)
    commentsByPerson.set(item.person_id, list)
  }

  return people.map((person) => ({
    ...person,
    qa: qaByPerson.get(person.id) ?? [],
    connectedCases: casesByPerson.get(person.id) ?? [],
    comments: commentsByPerson.get(person.id) ?? [],
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

// Every case with a dedicated case-file page, not just is_featured ones --
// this is what the "Case Files" index page actually needs. Featured cases
// were the only ones shown there for a while, which meant a fully built-out
// case (photos, people, sourced updates, all of it) was invisible on the
// site's own case index unless someone separately remembered to flip
// is_featured, silently hiding real work.
export async function getAllCaseFiles(): Promise<Incident[]> {
  const db = supabase()
  const { data, error } = await db
    .from('incidents')
    .select('*')
    .eq('is_hidden', false)
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
    .limit(10)

  if (error) throw error
  return (data ?? []) as Incident[]
}

// Picks a random case for the homepage hero spotlight -- pulls from every
// visible, linkable case in the database (not just featured/trending), so
// the same handful of cases don't dominate every page load.
export async function getRandomSpotlightCase(): Promise<Incident | null> {
  const db = supabase()
  const { data, error } = await db
    .from('incidents')
    .select('*')
    .eq('is_hidden', false)
    .not('slug', 'is', null)

  if (error) throw error
  if (!data || data.length === 0) return null
  return data[Math.floor(Math.random() * data.length)] as Incident
}

export type IncidentWithOccurredAt = Incident & { occurred_at: string; hasDisputedRuling: boolean }

const DISPUTED_CLAIM_TYPES = new Set(['disputed_allegation', 'family_claim'])

// `published_at` is when a case was added to this site, not when the
// underlying event happened -- a 1976 case entered this week and a 2018 case
// entered the same week would otherwise look like they "span 0 months," which
// is meaningless for pattern correlation. This attaches the earliest dated
// incident_update (the actual reported event date) as `occurred_at`, falling
// back to published_at only for the rare case with no dated updates at all.
// Also flags `hasDisputedRuling` -- true when a case has at least one update
// where the family or an independent account (`family_claim`,
// `disputed_allegation`) pushes back against the official version of events,
// which is what lets Pattern Intelligence surface a "Disputed Ruling"
// cluster: multiple such cases sharing geography, not just one in isolation.
// Deliberately includes cases without a slug (most automated-ingestion cases
// never get one) since pattern intelligence correlates against the full map,
// not just cases with a dedicated case-file page.
export async function getAllVisibleCasesForPatternIntelligence(): Promise<IncidentWithOccurredAt[]> {
  const db = supabase()
  const [{ data: incidents, error: incidentsError }, { data: updates, error: updatesError }] = await Promise.all([
    db.from('incidents').select('*').eq('is_hidden', false),
    db.from('incident_updates').select('incident_id, event_date, claim_type'),
  ])

  if (incidentsError) throw incidentsError
  if (updatesError) throw updatesError

  const earliestByIncident = new Map<string, string>()
  const disputedIncidentIds = new Set<string>()
  for (const u of updates ?? []) {
    if (u.event_date) {
      const existing = earliestByIncident.get(u.incident_id)
      if (!existing || u.event_date < existing) earliestByIncident.set(u.incident_id, u.event_date)
    }
    if (DISPUTED_CLAIM_TYPES.has(u.claim_type)) disputedIncidentIds.add(u.incident_id)
  }

  return ((incidents ?? []) as Incident[]).map((incident) => ({
    ...incident,
    occurred_at: earliestByIncident.get(incident.id) ?? incident.published_at,
    hasDisputedRuling: disputedIncidentIds.has(incident.id),
  }))
}

// Purely a social-proof count, no names surfaced -- deliberately the
// lightest version of "who else is interested in this case": counts
// distinct subscribers who have this case saved in any of their private
// playlists, without exposing which subscribers or their playlists.
export async function getCaseTrackingCount(incidentId: string): Promise<number> {
  const db = supabase()
  const { data, error } = await db
    .from('playlist_cases')
    .select('subscriber_playlists!inner(user_id)')
    .eq('incident_id', incidentId)

  if (error) throw error

  const userIds = new Set(
    (data ?? [])
      .map((row) => {
        const sp = Array.isArray(row.subscriber_playlists) ? row.subscriber_playlists[0] : row.subscriber_playlists
        return (sp as { user_id: string } | null)?.user_id
      })
      .filter((id): id is string => !!id)
  )

  return userIds.size
}

export async function getCaseConnections(incidentId: string): Promise<{
  nodes: CaseConnectionNode[]
  edges: CaseConnectionEdge[]
}> {
  const db = supabase()
  const [{ data: nodes, error: nodesError }, { data: edges, error: edgesError }] = await Promise.all([
    db.from('case_connection_nodes').select('*').eq('incident_id', incidentId).order('sequence', { ascending: true }),
    db.from('case_connection_edges').select('*').eq('incident_id', incidentId),
  ])

  if (nodesError) throw nodesError
  if (edgesError) throw edgesError

  return {
    nodes: (nodes ?? []) as CaseConnectionNode[],
    edges: (edges ?? []) as CaseConnectionEdge[],
  }
}

export async function getCasesByCollection(collectionSlug: string): Promise<Incident[]> {
  const db = supabase()
  const { data, error } = await db
    .from('incidents')
    .select('*')
    .eq('collection_slug', collectionSlug)
    .eq('is_hidden', false)
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
  courtRecords: IncidentCourtRecord[]
  photos: IncidentPhoto[]
  videos: IncidentVideo[]
  relatedIncident: Pick<Incident, 'slug' | 'title' | 'category' | 'image_url'> | null
  courtCase: IncidentCourtCase | null
  charges: IncidentCharge[]
  bondSettings: IncidentBondSetting[]
  financialRecords: IncidentFinancialRecord[]
} | null> {
  const db = supabase()
  const { data: incident, error } = await db
    .from('incidents')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  if (!incident || incident.is_hidden) return null

  const [
    { data: updates },
    { data: people },
    { data: transcript },
    { data: courtRecords },
    { data: photos },
    { data: videos },
    relatedResult,
    { data: courtCase },
    { data: charges },
    { data: bondSettings },
    { data: financialRecords },
  ] = await Promise.all([
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
    db.from('incident_videos').select('*').eq('incident_id', incident.id).order('sequence', { ascending: true }),
    incident.related_incident_id
      ? db
          .from('incidents')
          .select('slug, title, category, image_url')
          .eq('id', incident.related_incident_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    db.from('incident_court_case').select('*').eq('incident_id', incident.id).maybeSingle(),
    db.from('incident_charges').select('*').eq('incident_id', incident.id).order('sequence', { ascending: true }),
    db.from('incident_bond_settings').select('*').eq('incident_id', incident.id).order('sequence', { ascending: true }),
    db.from('incident_financial_records').select('*').eq('incident_id', incident.id).order('sequence', { ascending: true }),
  ])

  return {
    incident: incident as Incident,
    updates: (updates ?? []) as IncidentUpdate[],
    people: await attachQAAndCases(db, (people ?? []) as IncidentPerson[]),
    transcript: (transcript ?? []) as IncidentTranscriptRow[],
    courtRecords: (courtRecords ?? []) as IncidentCourtRecord[],
    photos: (photos ?? []) as IncidentPhoto[],
    videos: (videos ?? []) as IncidentVideo[],
    relatedIncident: relatedResult.data,
    courtCase: (courtCase ?? null) as IncidentCourtCase | null,
    charges: (charges ?? []) as IncidentCharge[],
    bondSettings: (bondSettings ?? []) as IncidentBondSetting[],
    financialRecords: (financialRecords ?? []) as IncidentFinancialRecord[],
  }
}
