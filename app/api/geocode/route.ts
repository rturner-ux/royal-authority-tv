import { NextRequest, NextResponse } from 'next/server'

// Proxies OpenStreetMap's Nominatim geocoder so the ALPR map search bar can
// resolve a zip/city/address to coordinates. Server-side for the same reason
// as the Overpass proxy: Nominatim's usage policy requires an identifying
// User-Agent, which Next.js's fetch doesn't send by default.
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  const params = new URLSearchParams({ q, format: 'json', limit: '1' })

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'User-Agent': 'RoyalAuthorityTV/1.0 (+https://royalauthorityofficial.com)',
      },
      next: { revalidate: 86400 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 })
    }

    const results = await res.json()
    const top = results[0]
    if (!top) {
      return NextResponse.json({ success: true, result: null })
    }

    return NextResponse.json({
      success: true,
      result: {
        lat: parseFloat(top.lat),
        lng: parseFloat(top.lon),
        label: top.display_name as string,
      },
    })
  } catch (err) {
    console.error('Geocode fetch error:', err)
    return NextResponse.json({ error: 'Could not reach geocoder' }, { status: 502 })
  }
}
