export type Collection = {
  slug: string
  name: string
  description: string
}

// A lightweight, hardcoded registry -- one row per collection is enough
// for now. Add a new entry here whenever a new collection_slug is used
// on an incident.
export const COLLECTIONS: Record<string, Collection> = {
  'music-industry-deaths': {
    slug: 'music-industry-deaths',
    name: 'High-Profile Music Industry Cases',
    description:
      'Rappers and other music industry figures killed in high-profile cases, with verified sourcing on each investigation and prosecution as it develops.',
  },
}

export function getCollection(slug: string): Collection | null {
  return COLLECTIONS[slug] ?? null
}

export function citySlug(city: string, state: string): string {
  return `${city}-${state}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function genreSlug(genre: string): string {
  return genre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
