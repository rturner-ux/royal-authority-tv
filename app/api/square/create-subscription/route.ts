import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { supabaseServerAuth } from '@/lib/supabase/serverAuth'
import { supabase } from '@/lib/supabase/server'
import { squareClient, mapSquareStatus } from '@/lib/square/client'
import { verifyRecaptcha } from '@/lib/recaptcha'

export async function POST(req: NextRequest) {
  const authDb = await supabaseServerAuth()
  const {
    data: { user },
  } = await authDb.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { sourceId, verificationToken, recaptchaToken } = await req.json()
  if (!sourceId) {
    return NextResponse.json({ error: 'Missing card token' }, { status: 400 })
  }

  const human = await verifyRecaptcha(recaptchaToken || '')
  if (!human) {
    return NextResponse.json({ error: 'Security check failed. Please refresh and try again.' }, { status: 400 })
  }

  const square = squareClient()
  const db = supabase()

  try {
    // Reuse an existing Square customer for this user if we already have one
    // (e.g. a prior subscription attempt), otherwise create a fresh one.
    const { data: existing } = await db
      .from('subscribers')
      .select('square_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = existing?.square_customer_id

    if (!customerId) {
      const customerResult = await square.customers.create({
        idempotencyKey: randomUUID(),
        emailAddress: user.email,
        referenceId: user.id,
      })
      customerId = customerResult.customer?.id
    }

    if (!customerId) {
      throw new Error('Square did not return a customer id')
    }

    const cardResult = await square.cards.create({
      idempotencyKey: randomUUID(),
      sourceId,
      verificationToken,
      card: { customerId },
    })

    const cardId = cardResult.card?.id
    if (!cardId) {
      throw new Error('Square did not return a card id')
    }

    const subscriptionResult = await square.subscriptions.create({
      idempotencyKey: randomUUID(),
      locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!,
      planVariationId: process.env.SQUARE_PLAN_VARIATION_ID!,
      customerId,
      cardId,
    })

    const subscription = subscriptionResult.subscription
    if (!subscription?.id) {
      throw new Error('Square did not return a subscription id')
    }

    const { error: upsertError } = await db.from('subscribers').upsert(
      {
        user_id: user.id,
        square_customer_id: customerId,
        square_subscription_id: subscription.id,
        status: mapSquareStatus(subscription.status),
        current_period_end: subscription.chargedThroughDate || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (upsertError) {
      console.error('Failed to persist subscriber row:', upsertError)
      return NextResponse.json({ error: 'Subscription created but failed to save status' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('create-subscription error:', err)
    // TEMPORARY: surface the real Square error while diagnosing a live
    // subscribe failure. Revert once root-caused.
    const squareDetail = (err as { errors?: { detail?: string; code?: string }[] })?.errors
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: 'Could not start your subscription', detail: squareDetail || message },
      { status: 500 }
    )
  }
}
