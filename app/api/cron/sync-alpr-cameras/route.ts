import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedCronRequest } from '@/lib/cronAuth'
import { supabase } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

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
// Batches upsert in parallel (bounded) instead of one-at-a-time -- ~127k US
// rows is ~26 sequential round-trips, which came close enough to the old
// 60s function ceiling to get killed mid-sync on a slow run (confirmed:
// found a real production run that only completed 571 of ~127,904 rows
// before being cut off).
const BATCH_CONCURRENCY = 5
// If a run only manages to sync a small fraction of what it fetched
// (timeout, transient errors, etc.), the stale-row cleanup below must not
// run -- otherwise a partial sync silently deletes the rest of a good
// dataset instead of just leaving it one day stale. This is the fix for
// that exact failure mode, not just the timeout/concurrency change above.
//
// Scoped per source, not globally: the us fetch consistently 403s from
// Vercel's network while ca succeeds every time (a real, persistent
// upstream block, not a transient blip -- see the fetch retry loop below).
// A single global fraction across both sources would read as "100%
// success" from ca alone and prune every existing us row on every run,
// which is the exact same data-loss bug in a new shape. Each source's
// synced rows only ever get pruned against that source's own fetch
// result, so a persistently-failing source just goes stale, never deleted.
const MIN_SYNC_FRACTION = 0.9

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
  const perSource: Record<string, { fetched: number; synced: number; pruned: boolean }> = {}

  try {
    for (const { url, source } of SOURCES) {
      perSource[source] = { fetched: 0, synced: 0, pruned: false }
      // The large (34MB) US file was confirmed via production logs to get a
      // clean 403 from the upstream when fetched from Vercel's network,
      // while the small (168KB) CA file from the same host succeeds every
      // time -- almost certainly a Cloudflare WAF/bot-management rule keyed
      // on response size or request volume for that specific resource, not
      // a blanket IP block. Claiming a real browser's User-Agent while the
      // underlying request fingerprint (TLS/HTTP handshake) doesn't match
      // one made this worse, not better (confirmed: it started blocking
      // even the previously-fine CA file too) -- reverted to an honest,
      // identifying UA. A short retry-with-backoff is kept as a best-effort
      // mitigation for a transient/rolling rate-limit window, but the
      // MIN_SYNC_FRACTION guard below is the real safety net if this
      // upstream block persists.
      let res: Response | null = null
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 1500 * attempt))
        res = await fetch(`${url}?cb=${Date.now()}`, {
          headers: { 'User-Agent': 'RoyalAuthorityTV/1.0 (+https://royalauthorityofficial.com)' },
        })
        if (res.ok) break
        console.error(`ALPR sync: fetch ${source} dataset failed (attempt ${attempt + 1}/3)`, res.status)
      }
      if (!res || !res.ok) {
        console.error(`ALPR sync: giving up on ${source} dataset after retries`, res?.status)
        continue
      }

      const data = await res.json()
      const features: Feature[] = data.features || []
      perSource[source].fetched = features.length

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

      const batches: (typeof rows)[] = []
      for (let i = 0; i < rows.length; i += BATCH_SIZE) batches.push(rows.slice(i, i + BATCH_SIZE))

      for (let i = 0; i < batches.length; i += BATCH_CONCURRENCY) {
        const group = batches.slice(i, i + BATCH_CONCURRENCY)
        const results = await Promise.all(
          group.map((batch) => db.from('alpr_cameras').upsert(batch, { onConflict: 'osm_id' }))
        )
        results.forEach(({ error }, idx) => {
          if (error) {
            console.error(`ALPR sync: upsert batch failed (${source}, group offset ${i + idx})`, error.message)
          } else {
            perSource[source].synced += group[idx].length
          }
        })
      }

      // Anything for THIS source not touched by this run's upserts is no
      // longer in the upstream dataset -- prune it. Scoped to `source` so a
      // persistently-failing source (fetched: 0) never touches the other
      // source's existing rows, and only runs at all if this source's own
      // sync was close to complete.
      const { fetched, synced } = perSource[source]
      const syncedFraction = fetched > 0 ? synced / fetched : 0
      if (fetched > 0 && syncedFraction >= MIN_SYNC_FRACTION) {
        const { error: deleteError } = await db
          .from('alpr_cameras')
          .delete()
          .eq('source', source)
          .lt('synced_at', syncStartedAt)
        if (deleteError) {
          console.error(`ALPR sync: stale row cleanup failed (${source})`, deleteError.message)
        } else {
          perSource[source].pruned = true
        }
      } else {
        console.error(
          `ALPR sync: skipped stale-row cleanup for ${source} -- only synced ${synced}/${fetched} (${(syncedFraction * 100).toFixed(1)}%), below the ${MIN_SYNC_FRACTION * 100}% safety threshold`
        )
      }
    }

    return NextResponse.json({ success: true, perSource, syncStartedAt })
  } catch (err) {
    console.error('ALPR sync error:', err)
    return NextResponse.json({ success: false, message: 'Sync failed' }, { status: 500 })
  }
}
