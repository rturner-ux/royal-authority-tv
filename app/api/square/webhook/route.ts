import { NextRequest, NextResponse } from 'next/server'
import { WebhooksHelper } from 'square'
import { supabase } from '@/lib/supabase/server'
import { squareClient, mapSquareStatus } from '@/lib/square/client'

// Pulls a subscription id out of whichever event shape Square sent us
// (subscription.* events nest it under data.object.subscription, invoice.*
// events nest it under data.object.invoice) rather than hard-coding one
// shape per event type -- then re-fetches the subscription directly so the
// DB always reflects Square's canonical current state, not a guess parsed
// from the event payload.
function extractSubscriptionId(payload: unknown): string | null {
  const object = (payload as { data?: { object?: Record<string, unknown> } })?.data?.object
  if (!object) return null

  const subscription = object.subscription as { id?: string } | undefined
  if (subscription?.id) return subscription.id

  const invoice = object.invoice as { subscriptionId?: string } | undefined
  if (invoice?.subscriptionId) return invoice.subscriptionId

  return null
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-square-hmacsha256-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const notificationUrl = `${req.nextUrl.origin}${req.nextUrl.pathname}`

  const valid = await WebhooksHelper.verifySignature({
    requestBody: rawBody,
    signatureHeader: signature,
    signatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
    notificationUrl,
  })

  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const subscriptionId = extractSubscriptionId(payload)

  if (!subscriptionId) {
    // Not a subscription/invoice event we care about -- ack and move on.
    return NextResponse.json({ received: true })
  }

  const square = squareClient()
  const db = supabase()

  try {
    const result = await square.subscriptions.get({ subscriptionId })
    const subscription = result.subscription
    if (!subscription) {
      return NextResponse.json({ received: true })
    }

    const { error } = await db
      .from('subscribers')
      .update({
        status: mapSquareStatus(subscription.status),
        current_period_end: subscription.chargedThroughDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq('square_subscription_id', subscriptionId)

    if (error) {
      console.error('Webhook failed to update subscriber:', error)
    }
  } catch (err) {
    console.error('Webhook subscription lookup failed:', err)
  }

  return NextResponse.json({ received: true })
}
