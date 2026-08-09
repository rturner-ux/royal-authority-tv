import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

// Real driving directions from OSRM's public routing engine (same
// no-API-key OSM ecosystem as the Overpass/Nominatim proxies elsewhere in
// this app), scored against our own synced alpr_cameras table -- the
// "privacy route" is whichever real OSRM alternative passes the fewest
// known cameras, not a simulated or fabricated path.
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving'
const CAMERA_PROXIMITY_METERS = 150
const CAMERA_QUERY_LIMIT = 20000

type LngLat = [number, number]

type ScoredRoute = {
  geometry: LngLat[]
  distanceMeters: number
  durationSeconds: number
  cameraCount: number
}

// Equirectangular approximation -- accurate enough at driving-route scales
// and far cheaper than full great-circle math for thousands of comparisons.
function metersBetween(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000
  const x = ((bLng - aLng) * Math.PI) / 180 * Math.cos(((aLat + bLat) / 2 * Math.PI) / 180)
  const y = ((bLat - aLat) * Math.PI) / 180
  return Math.sqrt(x * x + y * y) * R
}

function distanceToSegmentMeters(pLat: number, pLng: number, aLat: number, aLng: number, bLat: number, bLng: number): number {
  // Project in a local flat approximation (meters), then clamp to the segment.
  const toXY = (lat: number, lng: number): [number, number] => [
    (lng - aLng) * Math.cos((aLat * Math.PI) / 180) * 111320,
    (lat - aLat) * 110540,
  ]
  const [px, py] = toXY(pLat, pLng)
  const [bx, by] = toXY(bLat, bLng)
  const segLenSq = bx * bx + by * by
  if (segLenSq === 0) return metersBetween(pLat, pLng, aLat, aLng)
  let t = (px * bx + py * by) / segLenSq
  t = Math.max(0, Math.min(1, t))
  const projX = t * bx
  const projY = t * by
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2)
}

async function scoreRoute(geometry: LngLat[], distanceMeters: number, durationSeconds: number): Promise<ScoredRoute> {
  const lats = geometry.map((c) => c[1])
  const lngs = geometry.map((c) => c[0])
  const south = Math.min(...lats)
  const north = Math.max(...lats)
  const west = Math.min(...lngs)
  const east = Math.max(...lngs)

  const db = supabase()
  const { data, error } = await db
    .from('alpr_cameras')
    .select('lat, lng')
    .gte('lat', south)
    .lte('lat', north)
    .gte('lng', west)
    .lte('lng', east)
    .limit(CAMERA_QUERY_LIMIT)

  if (error || !data) {
    return { geometry, distanceMeters, durationSeconds, cameraCount: 0 }
  }

  let cameraCount = 0
  for (const cam of data) {
    let minDist = Infinity
    for (let i = 0; i < geometry.length - 1; i++) {
      const [aLng, aLat] = geometry[i]
      const [bLng, bLat] = geometry[i + 1]
      const d = distanceToSegmentMeters(cam.lat, cam.lng, aLat, aLng, bLat, bLng)
      if (d < minDist) minDist = d
      if (minDist < CAMERA_PROXIMITY_METERS) break
    }
    if (minDist < CAMERA_PROXIMITY_METERS) cameraCount++
  }

  return { geometry, distanceMeters, durationSeconds, cameraCount }
}

export async function GET(req: NextRequest) {
  const originLat = parseFloat(req.nextUrl.searchParams.get('originLat') || '')
  const originLng = parseFloat(req.nextUrl.searchParams.get('originLng') || '')
  const destLat = parseFloat(req.nextUrl.searchParams.get('destLat') || '')
  const destLng = parseFloat(req.nextUrl.searchParams.get('destLng') || '')

  if ([originLat, originLng, destLat, destLng].some((n) => Number.isNaN(n))) {
    return NextResponse.json({ error: 'Missing or invalid coordinates' }, { status: 400 })
  }

  try {
    const osrmUrl = `${OSRM_URL}/${originLng},${originLat};${destLng},${destLat}?alternatives=true&overview=simplified&geometries=geojson&steps=false`
    const res = await fetch(osrmUrl, {
      headers: { 'User-Agent': 'RoyalAuthorityTV/1.0 (+https://royalauthorityofficial.com)' },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Routing service unavailable' }, { status: 502 })
    }

    const data = await res.json()
    if (data.code !== 'Ok' || !data.routes?.length) {
      return NextResponse.json({ error: 'No route found' }, { status: 404 })
    }

    const scored = await Promise.all(
      data.routes.map((r: { geometry: { coordinates: LngLat[] }; distance: number; duration: number }) =>
        scoreRoute(r.geometry.coordinates, r.distance, r.duration)
      )
    )

    const direct = scored[0]
    const privacy = scored.reduce((best, r) => (r.cameraCount < best.cameraCount ? r : best), scored[0])
    const foundBetterAlternative = privacy.cameraCount < direct.cameraCount

    return NextResponse.json({
      success: true,
      direct,
      privacy: foundBetterAlternative ? privacy : null,
    })
  } catch (err) {
    console.error('ALPR route error:', err)
    return NextResponse.json({ error: 'Could not compute route' }, { status: 500 })
  }
}
