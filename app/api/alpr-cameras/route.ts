import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

// Serves from the alpr_cameras table (synced daily from data.dontgetflocked.com
// by /api/cron/sync-alpr-cameras) instead of querying Overpass live -- faster,
// richer per-camera fields, and not subject to Overpass's shared rate limits.
export const dynamic = 'force-dynamic'

// At or above this zoom, callers get full per-camera detail (operator,
// manufacturer, zone, etc.) for interactive, individually-poppable markers.
// Below it, callers get raw lat/lng only for every camera in view, rendered
// as small fixed-size dots -- matching DeFlock's own point-cloud look
// instead of synthetic count-sized cluster blobs.
const RAW_POINT_ZOOM = 11
const DETAIL_LIMIT = 8000

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
        .limit(DETAIL_LIMIT)

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

      return NextResponse.json({ success: true, detailed: true, cameras })
    }

    const { data, error } = await db.rpc('alpr_camera_points', {
      p_south: south,
      p_west: west,
      p_north: north,
      p_east: east,
    })

    if (error) {
      console.error('ALPR light points query failed:', error.message)
      return NextResponse.json({ error: 'Query failed' }, { status: 500 })
    }

    // [lat, lng] tuples, not {lat, lng} objects -- halves payload size at
    // this row count by not repeating key names ~127k times.
    const points = (data as [number, number][] | null) || []
    return NextResponse.json({ success: true, detailed: false, points })
  } catch (err) {
    console.error('ALPR camera fetch error:', err)
    return NextResponse.json({ error: 'Could not query camera data' }, { status: 500 })
  }
}
