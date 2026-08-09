import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

// Serves from the alpr_cameras table (synced daily from data.dontgetflocked.com
// by /api/cron/sync-alpr-cameras) instead of querying Overpass live -- faster,
// richer per-camera fields, and not subject to Overpass's shared rate limits.
export const dynamic = 'force-dynamic'

// Below this zoom, returning 100k+ individual rows would be both a huge
// payload and unrenderable as DOM markers. Above it, callers get raw,
// individually-poppable camera points.
const RAW_POINT_ZOOM = 11
const RAW_POINT_LIMIT = 8000

function clusterPrecision(zoom: number): number {
  const precision = 40 / Math.pow(2, zoom)
  return Math.min(4, Math.max(0.02, precision))
}

export async function GET(req: NextRequest) {
  const south = parseFloat(req.nextUrl.searchParams.get('south') || '')
  const west = parseFloat(req.nextUrl.searchParams.get('west') || '')
  const north = parseFloat(req.nextUrl.searchParams.get('north') || '')
  const east = parseFloat(req.nextUrl.searchParams.get('east') || '')
  const zoom = parseFloat(req.nextUrl.searchParams.get('zoom') || '9')

  if ([south, west, north, east].some((n) => Number.isNaN(n))) {
    return NextResponse.json({ error: 'Missing or invalid bbox params' }, { status: 400 })
  }

  const db = supabase()

  try {
    if (zoom >= RAW_POINT_ZOOM) {
      const { data, error } = await db
        .from('alpr_cameras')
        .select('osm_id, lat, lng, brand, operator, direction, zone, mount_type, osm_timestamp')
        .gte('lat', south)
        .lte('lat', north)
        .gte('lng', west)
        .lte('lng', east)
        .limit(RAW_POINT_LIMIT)

      if (error) {
        console.error('ALPR cameras query failed:', error.message)
        return NextResponse.json({ error: 'Query failed' }, { status: 500 })
      }

      const cameras = (data || []).map((row) => ({
        id: row.osm_id,
        lat: row.lat,
        lng: row.lng,
        manufacturer: row.brand,
        direction: row.direction != null ? String(row.direction) : null,
        operator: row.operator,
        zone: row.zone,
        mountType: row.mount_type,
        osmTimestamp: row.osm_timestamp,
      }))

      return NextResponse.json({ success: true, clustered: false, cameras })
    }

    const precision = clusterPrecision(zoom)
    const { data, error } = await db.rpc('alpr_camera_clusters', {
      p_south: south,
      p_west: west,
      p_north: north,
      p_east: east,
      p_precision: precision,
    })

    if (error) {
      console.error('ALPR cluster query failed:', error.message)
      return NextResponse.json({ error: 'Query failed' }, { status: 500 })
    }

    const points = (data || []).map((row: { lat: number; lng: number; camera_count: number }) => ({
      lat: row.lat,
      lng: row.lng,
      count: row.camera_count,
    }))

    return NextResponse.json({ success: true, clustered: true, points })
  } catch (err) {
    console.error('ALPR camera fetch error:', err)
    return NextResponse.json({ error: 'Could not query camera data' }, { status: 500 })
  }
}
