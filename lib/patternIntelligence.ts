import 'server-only'
import type { Incident, IncidentCategory } from './types'

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
  cases: Incident[]
  maxDistanceMiles: number
  spanMonths: number
}

// Pure geographic/temporal/category correlation -- deliberately does not
// name or accuse any individual, and does not claim cases are actually
// connected. Two unrelated cases can share these traits by coincidence; this
// only surfaces the overlap for a subscriber to weigh themselves.
export function findCaseClusters(incidents: Incident[]): CaseCluster[] {
  const eligible = incidents.filter((i) => CATEGORY_BUCKETS[i.category] && i.lat && i.lng && i.published_at)

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
      if (CATEGORY_BUCKETS[a.category] !== CATEGORY_BUCKETS[b.category]) continue
      const distance = haversineMiles(a.lat, a.lng, b.lat, b.lng)
      if (distance > MAX_DISTANCE_MILES) continue
      const months = monthsBetween(a.published_at, b.published_at)
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
        maxSpan = Math.max(maxSpan, monthsBetween(cases[i].published_at, cases[j].published_at))
      }
    }

    clusters.push({
      bucket: CATEGORY_BUCKETS[cases[0].category]!,
      cases: cases.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime()),
      maxDistanceMiles: Math.round(maxDistance),
      spanMonths: Math.round(maxSpan),
    })
  }

  return clusters.sort((a, b) => b.cases.length - a.cases.length)
}
