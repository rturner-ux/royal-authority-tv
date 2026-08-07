import 'server-only'
import type { IncidentCategory } from './types'
import type { IncidentWithOccurredAt } from './cases'

// Groups categories into broad pattern buckets -- a missing-person case and a
// later murder case can plausibly be part of the same underlying pattern,
// but a drowning has a different investigative profile than a homicide, so
// they're only compared against others in the same bucket. Deliberately
// excludes plain "missing_person" (the routine runaway-report category that
// dominates the automated ingestion feed) and "blue_alert" (about suspects
// who attacked officers, not potential victims) -- including either flooded
// this with a single dense-metro cluster of dozens of unrelated routine
// cases that provided zero real signal.
const CATEGORY_BUCKETS: Partial<Record<IncidentCategory, string>> = {
  murder: 'homicide',
  criminal_investigation: 'homicide',
  sex_trafficking: 'homicide',
  death_investigation: 'homicide',
  endangered_missing_person: 'missing',
  amber_alert: 'missing',
  silver_alert: 'missing',
  camo_alert: 'missing',
  drowning_report: 'drowning',
}

const MAX_DISTANCE_MILES = 30
const MAX_MONTHS_APART = 9
const MAX_CLUSTER_SIZE = 6
const EARTH_RADIUS_MILES = 3958.8

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_MILES * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function monthsBetween(a: string, b: string): number {
  const diffMs = Math.abs(new Date(a).getTime() - new Date(b).getTime())
  return diffMs / (1000 * 60 * 60 * 24 * 30.44)
}

export type CaseCluster = {
  bucket: string
  cases: IncidentWithOccurredAt[]
  maxDistanceMiles: number
  spanMonths: number
}

// Shared clustering core: groups cases by mutual proximity (distance + time)
// among whatever `eligible` set and `sameGroup` comparator the caller passes
// in. `findCaseClusters` uses this for same-category clustering;
// `findDisputedRulingClusters` reuses it for a cross-category overlay.
function clusterByProximity(
  eligible: IncidentWithOccurredAt[],
  sameGroup: (a: IncidentWithOccurredAt, b: IncidentWithOccurredAt) => boolean,
  bucketFor: (cases: IncidentWithOccurredAt[]) => string
): CaseCluster[] {
  const n = eligible.length
  const parent = Array.from({ length: n }, (_, i) => i)
  function find(x: number): number {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  function union(a: number, b: number) {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent[ra] = rb
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = eligible[i]
      const b = eligible[j]
      if (!sameGroup(a, b)) continue
      const distance = haversineMiles(a.lat, a.lng, b.lat, b.lng)
      if (distance > MAX_DISTANCE_MILES) continue
      const months = monthsBetween(a.occurred_at, b.occurred_at)
      if (months > MAX_MONTHS_APART) continue
      union(i, j)
    }
  }

  const groups = new Map<number, number[]>()
  for (let i = 0; i < n; i++) {
    const root = find(i)
    const list = groups.get(root) ?? []
    list.push(i)
    groups.set(root, list)
  }

  const clusters: CaseCluster[] = []
  for (const indices of groups.values()) {
    // A cluster this large in a dense metro area is population density, not
    // a meaningful pattern -- suppress rather than show a noisy wall of
    // unrelated cases.
    if (indices.length < 2 || indices.length > MAX_CLUSTER_SIZE) continue
    const cases = indices.map((i) => eligible[i])

    let maxDistance = 0
    let maxSpan = 0
    for (let i = 0; i < cases.length; i++) {
      for (let j = i + 1; j < cases.length; j++) {
        maxDistance = Math.max(maxDistance, haversineMiles(cases[i].lat, cases[i].lng, cases[j].lat, cases[j].lng))
        maxSpan = Math.max(maxSpan, monthsBetween(cases[i].occurred_at, cases[j].occurred_at))
      }
    }

    clusters.push({
      bucket: bucketFor(cases),
      cases: cases.sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()),
      maxDistanceMiles: Math.round(maxDistance),
      spanMonths: Math.round(maxSpan),
    })
  }

  return clusters.sort((a, b) => b.cases.length - a.cases.length)
}

// Pure geographic/temporal/category correlation -- deliberately does not
// name or accuse any individual, and does not claim cases are actually
// connected. Two unrelated cases can share these traits by coincidence; this
// only surfaces the overlap for a subscriber to weigh themselves.
//
// Timing is based on `occurred_at` (the actual reported event date), not
// `published_at` (when the case was added to this site) -- otherwise a
// decades-old case and a brand-new one entered the same week would look like
// they happened days apart.
export function findCaseClusters(incidents: IncidentWithOccurredAt[]): CaseCluster[] {
  const eligible = incidents.filter((i) => CATEGORY_BUCKETS[i.category] && i.lat && i.lng && i.occurred_at)
  return clusterByProximity(
    eligible,
    (a, b) => CATEGORY_BUCKETS[a.category] === CATEGORY_BUCKETS[b.category],
    (cases) => CATEGORY_BUCKETS[cases[0].category]!
  )
}

// A different lens than category-based clustering: cases where a family
// member or independent account contradicts the official version of events
// (`hasDisputedRuling`), regardless of category, that also share geography
// and timing. This is deliberately cross-category -- a disputed drowning
// ruling and a disputed hanging ruling three miles apart is exactly the kind
// of pattern this is meant to surface, not something same-bucket clustering
// would ever catch since drowning and homicide are different buckets there.
// Still makes no claim of an actual connection -- see the page-level
// disclaimer for why disputed rulings can cluster by pure coincidence too.
export function findDisputedRulingClusters(incidents: IncidentWithOccurredAt[]): CaseCluster[] {
  const eligible = incidents.filter((i) => i.hasDisputedRuling && i.lat && i.lng && i.occurred_at)
  return clusterByProximity(
    eligible,
    () => true,
    () => 'disputed_ruling'
  )
}

export type StateConcentration = { state: string; count: number }
export type CollectionCluster = CaseCluster & {
  collectionSlug: string
  dominantState: StateConcentration | null
}

// A third, stronger lens than geo/time coincidence: cases an editor has
// deliberately grouped into the same named collection (e.g. Hanging Death
// Investigations) ARE a confirmed pattern by definition, so this
// deliberately ignores MAX_DISTANCE_MILES/MAX_MONTHS_APART/MAX_CLUSTER_SIZE
// -- those exist to filter out coincidental overlap, which doesn't apply
// here. Also flags when a single state accounts for an outsized share of
// the cluster, since that's a distinct, additionally notable signal on
// top of the pattern itself (e.g. a nationwide pattern concentrated in one
// state).
export function findCollectionClusters(incidents: IncidentWithOccurredAt[]): CollectionCluster[] {
  const byCollection = new Map<string, IncidentWithOccurredAt[]>()
  for (const incident of incidents) {
    if (!incident.collection_slug) continue
    const list = byCollection.get(incident.collection_slug) ?? []
    list.push(incident)
    byCollection.set(incident.collection_slug, list)
  }

  const clusters: CollectionCluster[] = []
  for (const [slug, cases] of byCollection) {
    if (cases.length < 2) continue
    const sorted = [...cases].sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime())

    let maxDistance = 0
    let maxSpan = 0
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (sorted[i].lat && sorted[i].lng && sorted[j].lat && sorted[j].lng) {
          maxDistance = Math.max(maxDistance, haversineMiles(sorted[i].lat, sorted[i].lng, sorted[j].lat, sorted[j].lng))
        }
        maxSpan = Math.max(maxSpan, monthsBetween(sorted[i].occurred_at, sorted[j].occurred_at))
      }
    }

    const stateCounts = new Map<string, number>()
    for (const c of sorted) {
      if (!c.state) continue
      stateCounts.set(c.state, (stateCounts.get(c.state) ?? 0) + 1)
    }
    let dominantState: StateConcentration | null = null
    for (const [state, count] of stateCounts) {
      if (count >= 2 && (!dominantState || count > dominantState.count)) {
        dominantState = { state, count }
      }
    }

    clusters.push({
      bucket: `collection:${slug}`,
      collectionSlug: slug,
      cases: sorted,
      maxDistanceMiles: Math.round(maxDistance),
      spanMonths: Math.round(maxSpan),
      dominantState,
    })
  }

  return clusters.sort((a, b) => b.cases.length - a.cases.length)
}
