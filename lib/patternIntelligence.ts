import 'server-only'
import type { IncidentCategory } from './types'
import type { IncidentWithOccurredAt, VictimProfile } from './cases'

// Coarse fallback bucket, used only when no specific method keyword is
// detected in a case's description (e.g. missing-person cases before
// recovery, or a case where the method genuinely isn't reported yet).
// Deliberately excludes plain "missing_person" (the routine runaway-report
// category dominating the automated ingestion feed) and "blue_alert"
// (suspects who attacked officers, not potential victims).
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

// Specific method signal pulled from free-text description -- this is what
// lets two cases with different IncidentCategory values (e.g. a
// death_investigation ruled undetermined and a murder with a confirmed
// cause) still match on the thing that actually matters for a pattern: how
// the person died. Keyword-based rather than an ML classifier -- cheap,
// auditable, and good enough for surfacing candidates a human then reviews.
const METHOD_KEYWORDS: Record<string, string[]> = {
  hanging: ['hanging', 'hanged', 'hung from', 'noose'],
  gunshot: ['gunshot', 'shot to death', 'shot in the', 'shooting death', 'fatally shot', 'gunfire'],
  stabbing: ['stabbed', 'stabbing', 'stab wound'],
  strangulation: ['strangled', 'strangulation', 'asphyxiat'],
  drowning: ['drowned', 'drowning'],
  blunt_force: ['blunt force', 'beaten to death', 'bludgeon'],
  vehicular: ['struck by a vehicle', 'hit and run', 'vehicular'],
  fire: ['burned to death', 'set on fire', 'arson'],
  poisoning: ['overdose', 'poisoned', 'poisoning'],
  police_custody: ['in police custody', 'restrained by', 'tased', 'knelt on his', 'knelt on her'],
}

function detectMethods(text: string | null): Set<string> {
  const methods = new Set<string>()
  if (!text) return methods
  const lower = text.toLowerCase()
  for (const [method, keywords] of Object.entries(METHOD_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) methods.add(method)
  }
  return methods
}

function sharedMethods(a: string | null, b: string | null): string[] {
  const ma = detectMethods(a)
  const mb = detectMethods(b)
  return [...ma].filter((m) => mb.has(m))
}

const EARTH_RADIUS_MILES = 3958.8

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
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
  reasons: string[]
}

// ---- Disputed-ruling clusters: unchanged, simple geo+time overlap ----
// A different lens than similarity-based clustering: cases where a family
// member or independent account contradicts the official version of events
// (`hasDisputedRuling`), regardless of category, that also share geography
// and timing. Kept as a tight, simple AND-gate (not the scored model below)
// since `hasDisputedRuling` is already a strong signal on its own and
// doesn't need method/demographic weighting to justify surfacing it.
const DISPUTED_MAX_DISTANCE_MILES = 30
const DISPUTED_MAX_MONTHS_APART = 9
const MAX_CLUSTER_SIZE = 6

export function findDisputedRulingClusters(incidents: IncidentWithOccurredAt[]): CaseCluster[] {
  const eligible = incidents.filter((i) => i.hasDisputedRuling && i.lat && i.lng && i.occurred_at)
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
      const distance = haversineMiles(a.lat, a.lng, b.lat, b.lng)
      if (distance > DISPUTED_MAX_DISTANCE_MILES) continue
      const months = monthsBetween(a.occurred_at, b.occurred_at)
      if (months > DISPUTED_MAX_MONTHS_APART) continue
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
      bucket: 'disputed_ruling',
      cases: cases.sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()),
      maxDistanceMiles: Math.round(maxDistance),
      spanMonths: Math.round(maxSpan),
      reasons: ['Disputed official ruling'],
    })
  }

  return clusters.sort((a, b) => b.cases.length - a.cases.length)
}

// ---- Similarity-scored clustering: time + distance + method/demographics ----
// Replaces the old rigid "same category bucket AND within 30mi AND within
// 9 months" AND-gate, which missed real patterns spanning longer than 9
// months apart and lumped very different case types (a bar shooting, a
// hanging) into one "homicide" bucket while treating a hanging in one
// category and an undetermined death by hanging in another as unrelated.
// Every pairwise link now needs a real similarity anchor -- a shared
// method or, failing that, a shared coarse category -- distance and time
// alone are never enough. Demographics only ever add to a score that
// already has a method/category anchor, never substitute for one.
const MAX_DISTANCE_MILES = 60
const MAX_MONTHS_APART = 24
const SCORE_THRESHOLD = 6

function distanceScore(miles: number): number {
  if (miles <= 5) return 3
  if (miles <= 15) return 2
  if (miles <= 30) return 1.5
  if (miles <= MAX_DISTANCE_MILES) return 1
  return 0
}

function timeScore(months: number): number {
  if (months <= 1) return 3
  if (months <= 6) return 2.5
  if (months <= 12) return 1.5
  if (months <= MAX_MONTHS_APART) return 0.5
  return 0
}

function demographicReasons(a: VictimProfile, b: VictimProfile): string[] {
  const reasons: string[] = []
  if (a.age != null && b.age != null && Math.abs(a.age - b.age) <= 5) {
    reasons.push('Similar victim age')
  }
  if (a.race && b.race && a.race === b.race) {
    reasons.push(`Same victim race (${a.race})`)
  }
  if (a.sex && b.sex && a.sex === b.sex) {
    reasons.push(`Same victim sex (${a.sex})`)
  }
  return reasons
}

function pairMatch(a: IncidentWithOccurredAt, b: IncidentWithOccurredAt): { score: number; reasons: string[] } | null {
  if (!a.lat || !a.lng || !b.lat || !b.lng || !a.occurred_at || !b.occurred_at) return null

  const distance = haversineMiles(a.lat, a.lng, b.lat, b.lng)
  if (distance > MAX_DISTANCE_MILES) return null
  const months = monthsBetween(a.occurred_at, b.occurred_at)
  if (months > MAX_MONTHS_APART) return null

  let score = distanceScore(distance) + timeScore(months)
  const reasons: string[] = []

  const methods = sharedMethods(a.description, b.description)
  if (methods.length > 0) {
    score += 3
    reasons.push(`Same method: ${methods.join(', ')}`)
  } else {
    const bucketA = CATEGORY_BUCKETS[a.category]
    if (bucketA && bucketA === CATEGORY_BUCKETS[b.category]) {
      score += 1
      reasons.push(`Same category: ${bucketA}`)
    } else {
      // No method or even coarse category overlap -- distance/time alone
      // is coincidence, not a pattern.
      return null
    }
  }

  const demoReasons = demographicReasons(a.victim, b.victim)
  if (demoReasons.length > 0) {
    score += demoReasons.length
    reasons.push(...demoReasons)
  }

  return { score, reasons }
}

export function findCaseClusters(incidents: IncidentWithOccurredAt[]): CaseCluster[] {
  const eligible = incidents.filter((i) => i.lat && i.lng && i.occurred_at)
  const n = eligible.length
  const parent = Array.from({ length: n }, (_, i) => i)
  const reasonsByPairKey = new Map<string, string[]>()

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
      const match = pairMatch(eligible[i], eligible[j])
      if (!match || match.score < SCORE_THRESHOLD) continue
      union(i, j)
      reasonsByPairKey.set(`${i}:${j}`, match.reasons)
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
    if (indices.length < 2 || indices.length > MAX_CLUSTER_SIZE) continue
    const cases = indices.map((i) => eligible[i])

    let maxDistance = 0
    let maxSpan = 0
    const reasonSet = new Set<string>()
    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        maxDistance = Math.max(maxDistance, haversineMiles(cases[i].lat, cases[i].lng, cases[j].lat, cases[j].lng))
        maxSpan = Math.max(maxSpan, monthsBetween(cases[i].occurred_at, cases[j].occurred_at))
        const key = indices[i] < indices[j] ? `${indices[i]}:${indices[j]}` : `${indices[j]}:${indices[i]}`
        for (const r of reasonsByPairKey.get(key) ?? []) reasonSet.add(r)
      }
    }

    // Category-derived bucket label, for display grouping/coloring only --
    // no longer a matching constraint, so a cluster can legitimately mix
    // categories when method/demographics are what actually tied it together.
    const bucketCounts = new Map<string, number>()
    for (const c of cases) {
      const b = CATEGORY_BUCKETS[c.category] ?? 'other'
      bucketCounts.set(b, (bucketCounts.get(b) ?? 0) + 1)
    }
    const bucket = [...bucketCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]

    clusters.push({
      bucket,
      cases: cases.sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()),
      maxDistanceMiles: Math.round(maxDistance),
      spanMonths: Math.round(maxSpan),
      reasons: [...reasonSet],
    })
  }

  return clusters.sort((a, b) => b.cases.length - a.cases.length)
}

// ---- Long-running state trends: same method, same state, any time span ----
// Deliberately separate from the tight, time-bounded clusters above. A real
// pattern like repeated hanging deaths in one state can unfold over a
// decade -- forcing that into a "cluster" (which implies close-together
// timing) would be misleading either way: too tight a window hides it
// entirely, too wide a window makes "cluster" meaningless for anything.
// This is a different, honestly-labeled signal: not "these happened
// together," but "this keeps happening here."
export type StateMethodTrend = {
  method: string
  state: string
  cases: IncidentWithOccurredAt[]
  spanYears: number
}

export function findStateMethodTrends(incidents: IncidentWithOccurredAt[]): StateMethodTrend[] {
  const groups = new Map<string, IncidentWithOccurredAt[]>()
  for (const incident of incidents) {
    if (!incident.state || !incident.occurred_at) continue
    for (const method of detectMethods(incident.description)) {
      const key = `${method}:${incident.state}`
      const list = groups.get(key) ?? []
      list.push(incident)
      groups.set(key, list)
    }
  }

  const trends: StateMethodTrend[] = []
  for (const [key, cases] of groups) {
    if (cases.length < 2) continue
    const [method, state] = key.split(':')
    const sorted = [...cases].sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime())
    const spanYears = monthsBetween(sorted[0].occurred_at, sorted[sorted.length - 1].occurred_at) / 12
    trends.push({ method, state, cases: sorted, spanYears: Math.round(spanYears * 10) / 10 })
  }

  return trends.sort((a, b) => b.cases.length - a.cases.length)
}
