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
      'Black men, a Black college student, and a Black woman found hanging from trees across the U.S. from 2015 to 2026, each officially ruled a suicide by local, state, or federal authorities. Several have drawn public disputes from family members, civil rights attorneys, or independent forensic pathologists, against the backdrop of America\'s history of lynching Black people from trees.',
  },
  'school-and-campus-shootings': {
    slug: 'school-and-campus-shootings',
    name: 'School and Campus Shootings',
    description:
      'Seven of the deadliest and most significant K-12 and university shootings in the U.S. since 2007, covering the law enforcement response, legal outcomes, and policy changes each one led to. Coverage centers on victims, responders, and accountability rather than the perpetrators.',
  },
  'parents-who-killed-their-children': {
    slug: 'parents-who-killed-their-children',
    name: 'Parents Who Killed Their Children',
    description:
      'Some of the most significant, well-documented U.S. cases in the past five years of a parent or parents killing their own children, covering the investigations and outcomes in each case, whether that meant a conviction or the perpetrator\'s own death.',
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
