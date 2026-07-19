import { NextResponse } from 'next/server'
import { squareClient } from '@/lib/square/client'

// TEMPORARY: diagnosing a live LOCATION_MISMATCH error. Delete this route
// once the correct location ID has been confirmed and fixed in Vercel env vars.
export async function GET() {
  const square = squareClient()
  try {
    const result = await square.locations.list()
    return NextResponse.json({
      environment: process.env.SQUARE_ENVIRONMENT || null,
      configuredLocationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || null,
      accessibleLocations: (result.locations || []).map((l) => ({
        id: l.id,
        name: l.name,
        status: l.status,
      })),
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
