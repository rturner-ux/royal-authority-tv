import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase/server'

// Verifies Cloudflare's "Webhook-Signature" header: `time=<ts>,sig1=<hex>`
// where the hmac is sha256(secret, `${time}.${rawBody}`) -- same
// construction as the Mux webhook, hand-rolled for the same reason (no
// Cloudflare SDK installed here, this repo only needs playback).
function isValidCloudflareSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false

  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]))
  const timestamp = parts.time
  const providedSignature = parts.sig1
  if (!timestamp || !providedSignature) return false

  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false

  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')

  const a = Buffer.from(expected)
  const b = Buffer.from(providedSignature)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// Unlike Mux's per-session stream id, a Cloudflare Live Input's id is the
// SAME value across every broadcast (it's a permanent, reused input) -- so
// this must target the most recent live_streams row for that input, not
// blanket-update every historical row that ever used it.
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('webhook-signature')

  if (!isValidCloudflareSignature(rawBody, signature, process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody) as { event_type?: string; input_id?: string }
  const inputId = event.input_id
  if (!inputId) return NextResponse.json({ received: true })

  const db = supabase()

  const { data: row } = await db
    .from('live_streams')
    .select('id')
    .eq('cf_live_input_uid', inputId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!row) return NextResponse.json({ received: true })

  if (event.event_type === 'live_input.connected') {
    const { error } = await db
      .from('live_streams')
      .update({ status: 'active', started_at: new Date().toISOString(), ended_at: null })
      .eq('id', row.id)
    if (error) console.error('Cloudflare webhook failed to mark stream active:', error)
  } else if (event.event_type === 'live_input.disconnected') {
    const { error } = await db
      .from('live_streams')
      .update({ status: 'idle', ended_at: new Date().toISOString() })
      .eq('id', row.id)
    if (error) console.error('Cloudflare webhook failed to mark stream idle:', error)
  }

  return NextResponse.json({ received: true })
}
