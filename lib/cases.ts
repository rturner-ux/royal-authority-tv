import 'server-only'
import { unstable_cache } from 'next/cache'
import { supabase } from './supabase/server'
import type { Incident, IncidentUpdate, IncidentPerson, IncidentTranscriptRow, IncidentCourtRecord, IncidentPhoto, IncidentVideo, InterviewQA, PersonConnectedCase, PersonComment, IncidentCourtCase, IncidentCharge, IncidentBondSetting, IncidentFinancialRecord, CaseConnectionNode, CaseConnectionEdge } from './types'

// Supabase's fetch calls are uncached by default, which forces any route
// touching them to render dynamically -- including opengraph-image.tsx,
// where that means every scrape (Facebook's included) re-runs the full
// image render from scratch. This is scoped to only the handful of fields
// the share card needs, cached separately from getCaseBySlug so the main
// case page's data (share/view counts, etc.) stays fully live.
export const getCaseOgData = unstable_cache(
  async (slug: string): Promise<Pick<Incident, 'title' | 'category' | 'status' | 'location_label' | 'image_url'> | null> => {
    const db = supabase()
    const { data } = await db
      .from('incidents')
      .select('title, category, status, location_label, image_url')
      .eq('slug', slug)
      .maybeSingle()
    return data
  },
  ['case-og-data'],
  { revalidate: 3600 }
)

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
export async function getIncidentIdBySlug(slug: string): Promise<string | null> {
  const db = supabase()
  const { data } = await db.from('incidents').select('id').eq('slug', slug).maybeSingle()
  return data?.id ?? null
}

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

// Picks a random set of cases for the homepage hero slideshow -- pulls from
// every visible, linkable case with a real photo (not just featured/
// trending), so the same handful of cases don't dominate every page load.
export async function getRandomSpotlightCases(count: number): Promise<Incident[]> {
  const db = supabase()
  const { data, error } = await db
    .from('incidents')
    .select('*')
    .eq('is_hidden', false)
    .not('slug', 'is', null)
    .not('image_url', 'is', null)

  if (error) throw error
  if (!data || data.length === 0) return []

  // Fisher-Yates shuffle, then take the first `count`.
  const shuffled = [...data]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count) as Incident[]
}

export type VictimProfile = { age: number | null; race: string | null; sex: string | null }

export type IncidentWithOccurredAt = Incident & {
  occurred_at: string
  hasDisputedRuling: boolean
  victim: VictimProfile
}

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
  const [
    { data: incidents, error: incidentsError },
    { data: updates, error: updatesError },
    { data: victims, error: victimsError },
  ] = await Promise.all([
    db.from('incidents').select('*').eq('is_hidden', false),
    db.from('incident_updates').select('incident_id, event_date, claim_type'),
    db.from('incident_people').select('incident_id, age, race, sex, sequence').eq('role', 'victim').order('sequence', { ascending: true }),
  ])

  if (incidentsError) throw incidentsError
  if (updatesError) throw updatesError
  if (victimsError) throw victimsError

  const earliestByIncident = new Map<string, string>()
  const disputedIncidentIds = new Set<string>()
  for (const u of updates ?? []) {
    if (u.event_date) {
      const existing = earliestByIncident.get(u.incident_id)
      if (!existing || u.event_date < existing) earliestByIncident.set(u.incident_id, u.event_date)
    }
    if (DISPUTED_CLAIM_TYPES.has(u.claim_type)) disputedIncidentIds.add(u.incident_id)
  }

  // First (lowest-sequence) victim row per incident stands in for "the
  // victim" -- multi-victim cases are rare enough in this data that this
  // is a reasonable simplification rather than trying to match every
  // victim pairing across two multi-victim cases.
  const victimByIncident = new Map<string, VictimProfile>()
  for (const v of victims ?? []) {
    if (!victimByIncident.has(v.incident_id)) {
      victimByIncident.set(v.incident_id, { age: v.age, race: v.race, sex: v.sex })
    }
  }

  return ((incidents ?? []) as Incident[]).map((incident) => ({
    ...incident,
    occurred_at: earliestByIncident.get(incident.id) ?? incident.published_at,
    victim: victimByIncident.get(incident.id) ?? { age: null, race: null, sex: null },
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

export async function getCaseCommentCount(incidentId: string): Promise<number> {
  const db = supabase()
  const { count } = await db
    .from('case_comments')
    .select('id', { count: 'exact', head: true })
    .eq('incident_id', incidentId)
    .eq('status', 'approved')
  return count ?? 0
}

// Fire-and-forget from the case page on every load -- a simple hit
// counter, not deduplicated per visitor (matches what most sites mean by
// a public "views" count). Atomic via the DB function, no read-then-write race.
export async function incrementCaseViewCount(incidentId: string): Promise<void> {
  const db = supabase()
  const { error } = await db.rpc('increment_incident_view_count', { p_incident_id: incidentId })
  if (error) console.error('incrementCaseViewCount error:', error)
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
