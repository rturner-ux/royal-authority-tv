import { NextResponse } from 'next/server'
import { squareClient } from '@/lib/square/client'

// TEMPORARY: diagnosing a live CONFLICTING_PARAMETERS error on subscription
// creation. Delete this route once the plan variation config is confirmed fixed.
export async function GET() {
  const square = squareClient()
  try {
    const result = await square.catalog.object.get({
      objectId: process.env.SQUARE_PLAN_VARIATION_ID!,
      includeRelatedObjects: true,
    })
    const safe = JSON.parse(
      JSON.stringify(
        {
          planVariationId: process.env.SQUARE_PLAN_VARIATION_ID || null,
          object: result.object,
          relatedObjects: result.relatedObjects,
        },
        (_key, value) => (typeof value === 'bigint' ? value.toString() : value)
      )
    )
    return NextResponse.json(safe)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
