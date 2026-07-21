export type InvestigatorRole = {
  key: string
  title: string
  tagline: string
  badge: string
}

export const INVESTIGATOR_ROLES: InvestigatorRole[] = [
  {
    key: 'detective',
    title: 'Detective',
    tagline: 'You work the case log line by line, tracing every claim back to its source.',
    badge: '/badges/detective.png',
  },
  {
    key: 'journalist',
    title: 'Journalist',
    tagline: 'You follow the story wherever the verified facts lead it.',
    badge: '/badges/journalist.png',
  },
  {
    key: 'lawyer',
    title: 'Lawyer',
    tagline: 'You weigh every claim by what would actually hold up.',
    badge: '/badges/lawyer.png',
  },
  {
    key: 'profiler',
    title: 'Profiler',
    tagline: 'You look for the pattern underneath the pattern.',
    badge: '/badges/profiler.png',
  },
  {
    key: 'field_agent',
    title: 'Field Agent',
    tagline: 'You track a case from the map pin to the ground truth.',
    badge: '/badges/agent.png',
  },
]

export function getRole(key: string | null | undefined): InvestigatorRole | null {
  if (!key) return null
  return INVESTIGATOR_ROLES.find((r) => r.key === key) ?? null
}
