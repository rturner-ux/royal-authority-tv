import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

// Municipality/place boundaries (~31,900 features) are too many to self-host
// as a static file the way the county (3,221) and state (52) layers are, so
// they're served bbox-filtered from the us_municipalities table instead --
// same pattern as /api/alpr-cameras. Only meaningful once zoomed in past
// MIN_ZOOM: at low zoom the viewport bbox would span thousands of places,
// which is both a huge payload and visually unreadable as outlines.
export const dynamic = 'force-dynamic'

const MIN_ZOOM = 8

export async function GET(req: NextRequest) {
  const south = parseFloat(req.nextUrl.searchParams.get('south') || '')
  const west = parseFloat(req.nextUrl.searchParams.get('west') || '')
  const north = parseFloat(req.nextUrl.searchParams.get('north') || '')
  const east = parseFloat(req.nextUrl.searchParams.get('east') || '')
  const zoom = parseFloat(req.nextUrl.searchParams.get('zoom') || '0')

  if ([south, west, north, east].some((n) => Number.isNaN(n))) {
    return NextResponse.json({ error: 'Missing or invalid bbox params' }, { status: 400 })
  }

  if (zoom < MIN_ZOOM) {
    return NextResponse.json({ type: 'FeatureCollection', features: [] })
  }

  const db = supabase()

  try {
    const { data, error } = await db.rpc('municipality_boundaries', {
      p_south: south,
      p_west: west,
      p_north: north,
      p_east: east,
    })

    if (error) {
      console.error('Municipality boundaries query failed:', error.message)
      return NextResponse.json({ error: 'Query failed' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Municipality boundaries fetch error:', err)
    return NextResponse.json({ error: 'Could not query municipality data' }, { status: 500 })
  }
}
