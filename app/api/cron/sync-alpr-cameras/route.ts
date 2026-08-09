import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedCronRequest } from '@/lib/cronAuth'
import { supabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// data.dontgetflocked.com publishes the same pre-computed OSM ALPR dataset
// DeFlock's own production map (maps.deflock.org) reads from -- a daily
// Cloudflare-cached bulk export, not a live query. Syncing it into our own
// table gives us richer fields than a live Overpass query and removes any
// dependency on Overpass's shared rate limits for this feature.
const SOURCES: { url: string; source: 'us' | 'ca' }[] = [
  { url: 'https://data.dontgetflocked.com/cameras.geojson.gz', source: 'us' },
  { url: 'https://data.dontgetflocked.com/cameras-ca.geojson.gz', source: 'ca' },
]

const BATCH_SIZE = 5000

type Feature = {
  geometry: { coordinates: [number, number] }
  properties: {
    osmId: number
    osmType: string
    brand?: string
    operator?: string
    direction?: number
    directions?: number[]
    directionCardinal?: string
    surveillanceZone?: string
    mountType?: string
    ref?: string
    osmTimestamp?: string
    osmVersion?: number
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const db = supabase()
  const syncStartedAt = new Date().toISOString()
  let totalSynced = 0

  try {
    for (const { url, source } of SOURCES) {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'RoyalAuthorityTV/1.0 (+https://royalauthorityofficial.com)' },
      })
      if (!res.ok) {
        console.error(`ALPR sync: failed to fetch ${source} dataset`, res.status)
        continue
      }

      const data = await res.json()
      const features: Feature[] = data.features || []

      const rows = features.map((f) => ({
        osm_id: f.properties.osmId,
        osm_type: f.properties.osmType,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        source,
        brand: f.properties.brand || null,
        operator: f.properties.operator || null,
        direction: f.properties.direction ?? null,
        directions: f.properties.directions || null,
        direction_cardinal: f.properties.directionCardinal || null,
        zone: f.properties.surveillanceZone || null,
        mount_type: f.properties.mountType || null,
        ref: f.properties.ref || null,
        osm_timestamp: f.properties.osmTimestamp || null,
        osm_version: f.properties.osmVersion ?? null,
        synced_at: syncStartedAt,
      }))

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE)
        const { error } = await db.from('alpr_cameras').upsert(batch, { onConflict: 'osm_id' })
        if (error) {
          console.error(`ALPR sync: upsert batch failed (${source}, offset ${i})`, error.message)
        } else {
          totalSynced += batch.length
        }
      }
    }

    // Anything not touched by this run's upserts is no longer in the
    // upstream dataset (camera removed / reclassified) -- prune it.
    const { error: deleteError } = await db.from('alpr_cameras').delete().lt('synced_at', syncStartedAt)
    if (deleteError) {
      console.error('ALPR sync: stale row cleanup failed', deleteError.message)
    }

    return NextResponse.json({ success: true, totalSynced, syncStartedAt })
  } catch (err) {
    console.error('ALPR sync error:', err)
    return NextResponse.json({ success: false, message: 'Sync failed' }, { status: 500 })
  }
}
