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
  'hanging-death-investigations': {
    slug: 'hanging-death-investigations',
    name: 'Hanging Death Investigations',
    description:
      'Black men and a Black college student found hanging from trees across the U.S. from 2015 to 2025, each officially ruled a suicide by local, state, or federal authorities. Several have drawn public disputes from family members, civil rights attorneys, or independent forensic pathologists, against the backdrop of America\'s history of lynching Black people from trees.',
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
