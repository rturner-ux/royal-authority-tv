export type MusicGenre = 'mystery' | 'suspense' | 'dark_ambient' | 'investigation'

export type Track = {
  slug: string
  title: string
  genre: MusicGenre
}

export const MUSIC_GENRE_LABELS: Record<MusicGenre, string> = {
  mystery: 'Mystery',
  suspense: 'Suspense',
  dark_ambient: 'Dark Ambient',
  investigation: 'Investigation',
}

const TRACK_BASE = 'https://alkmgedjgmaibfpyszij.supabase.co/storage/v1/object/public/site-audio/tracks'

// All instrumental, all Kevin MacLeod (incompetech.com), licensed under
// CC BY 4.0 -- attribution rendered in the player itself, not just here.
// A small, fixed, hand-picked set, same "lightweight hardcoded registry"
// pattern as lib/collections.ts rather than a full DB table.
export const TRACKS: Track[] = [
  { slug: 'mysterioso-march', title: 'Mysterioso March', genre: 'mystery' },
  { slug: 'cryptic-sorrow', title: 'Cryptic Sorrow', genre: 'mystery' },
  { slug: 'constance', title: 'Constance', genre: 'mystery' },
  { slug: 'killing-time', title: 'Killing Time', genre: 'suspense' },
  { slug: 'deadly-roulette', title: 'Deadly Roulette', genre: 'suspense' },
  { slug: 'faceoff', title: 'Faceoff', genre: 'suspense' },
  { slug: 'darkest-child', title: 'Darkest Child', genre: 'dark_ambient' },
  { slug: 'long-note-one', title: 'Long Note One', genre: 'dark_ambient' },
  { slug: 'gathering-darkness', title: 'Gathering Darkness', genre: 'dark_ambient' },
  { slug: 'investigations', title: 'Investigations', genre: 'investigation' },
  { slug: 'hidden-agenda', title: 'Hidden Agenda', genre: 'investigation' },
  { slug: 'sneaky-adventure', title: 'Sneaky Adventure', genre: 'investigation' },
]

export function trackUrl(track: Track): string {
  return `${TRACK_BASE}/${track.slug}.mp3`
}
