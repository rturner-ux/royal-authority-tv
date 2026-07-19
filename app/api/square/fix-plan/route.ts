import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { squareClient } from '@/lib/square/client'

// TEMPORARY: one-time fix to change the subscription plan variation's phase
// pricing from RELATIVE (which requires phases to be passed on every
// subscription create call) to a fixed STATIC $4.99/mo price. Delete this
// route once run successfully.
export async function POST() {
  const square = squareClient()
  try {
    const existing = await square.catalog.object.get({
      objectId: process.env.SQUARE_PLAN_VARIATION_ID!,
    })

    const obj = existing.object
    if (!obj || obj.type !== 'SUBSCRIPTION_PLAN_VARIATION' || !obj.subscriptionPlanVariationData) {
      return NextResponse.json({ error: 'Unexpected catalog object shape' }, { status: 500 })
    }

    const phase = obj.subscriptionPlanVariationData.phases?.[0]
    if (!phase) {
      return NextResponse.json({ error: 'No phase found on plan variation' }, { status: 500 })
    }

    // Square doesn't allow changing pricing on an existing plan variation, so
    // create a brand new one (same plan, static pricing) instead of upserting.
    const result = await square.catalog.object.upsert({
      idempotencyKey: randomUUID(),
      object: {
        type: 'SUBSCRIPTION_PLAN_VARIATION',
        id: '#new-royal-authority-plan-variation',
        presentAtAllLocations: obj.presentAtAllLocations,
        subscriptionPlanVariationData: {
          name: obj.subscriptionPlanVariationData.name,
          subscriptionPlanId: obj.subscriptionPlanVariationData.subscriptionPlanId,
          phases: [
            {
              cadence: phase.cadence,
              ordinal: phase.ordinal,
              pricing: {
                type: 'STATIC',
                priceMoney: {
                  amount: BigInt(499),
                  currency: 'USD',
                },
              },
            },
          ],
        },
      },
    })

    const safe = JSON.parse(
      JSON.stringify(result.catalogObject, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    )
    return NextResponse.json({ success: true, updated: safe })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
