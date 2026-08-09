import { NextRequest, NextResponse } from 'next/server'

// Proxies the public Overpass API (OpenStreetMap's query service) for
// nodes tagged surveillance:type=ALPR -- the same tag DeFlock's own map
// (maps.deflock.org) reads from, since DeFlock is a crowdsourcing front
// end for this OSM data rather than a separate database. Server-side so
// we can cap query size and avoid CORS issues calling Overpass directly
// from the browser.
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// A real metro-area query against a dense tag like this can legitimately
// take Overpass a while to compute -- Vercel's default function timeout
// (10s) was cutting the request off well before Overpass ever responded,
// surfacing as a 502 even though the exact same query succeeds when
// called directly. Give it real headroom, capped just under the
// in-query [timeout:25] passed to Overpass itself below.
export const maxDuration = 30

// Above this bbox area (deg^2), an Overpass query for a tag this dense
// nationally would be slow and return more points than a map can usefully
// render -- callers should zoom in instead. ~1.5deg^2 is roughly a large
// metro region.
const MAX_BBOX_AREA = 1.5

export async function GET(req: NextRequest) {
  const south = parseFloat(req.nextUrl.searchParams.get('south') || '')
  const west = parseFloat(req.nextUrl.searchParams.get('west') || '')
  const north = parseFloat(req.nextUrl.searchParams.get('north') || '')
  const east = parseFloat(req.nextUrl.searchParams.get('east') || '')

  if ([south, west, north, east].some((n) => Number.isNaN(n))) {
    return NextResponse.json({ error: 'Missing or invalid bbox params' }, { status: 400 })
  }

  const area = Math.abs(north - south) * Math.abs(east - west)
  if (area > MAX_BBOX_AREA) {
    return NextResponse.json({ success: true, cameras: [], tooLarge: true })
  }

  const query = `[out:json][timeout:25];node["surveillance:type"="ALPR"](${south},${west},${north},${east});out body;`

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      // Overpass is a shared community resource -- cache results for a
      // while so repeated pans over the same area don't hammer it.
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Overpass query failed' }, { status: 502 })
    }

    const data = await res.json()
    const cameras = (data.elements || []).map((el: { id: number; lat: number; lon: number; tags?: Record<string, string> }) => ({
      id: el.id,
      lat: el.lat,
      lng: el.lon,
      manufacturer: el.tags?.manufacturer || null,
      direction: el.tags?.direction || null,
    }))

    return NextResponse.json({ success: true, cameras })
  } catch (err) {
    console.error('ALPR camera fetch error:', err)
    return NextResponse.json({ error: 'Could not reach Overpass API' }, { status: 502 })
  }
}
