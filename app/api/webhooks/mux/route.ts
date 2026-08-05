import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase/server'

// Verifies Mux's "Mux-Signature" header: `t=<unix ts>,v1=<hex hmac>` where
// the hmac is sha256(secret, `${t}.${rawBody}`). No official Mux SDK is
// installed for this (the site only needs @mux/mux-player-react for
// playback), so this mirrors what that SDK does internally rather than
// pulling in the whole package for one check.
function isValidMuxSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false

  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]))
  const timestamp = parts.t
  const providedSignature = parts.v1
  if (!timestamp || !providedSignature) return false

  // Reject anything older than 5 minutes to guard against replay.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false

  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')

  const a = Buffer.from(expected)
  const b = Buffer.from(providedSignature)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// Lets a single, permanent Mux live stream (created once, reused for every
// broadcast) drive the site's "live" status automatically -- OBS/a phone
// encoder just needs to push to the saved stream key, no manual DB edit or
// Mux dashboard visit per session.
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('mux-signature')

  if (!isValidMuxSignature(rawBody, signature, process.env.MUX_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody) as { type?: string; data?: { id?: string } }
  const muxStreamId = event.data?.id
  if (!muxStreamId) return NextResponse.json({ received: true })

  const db = supabase()

  if (event.type === 'video.live_stream.active') {
    const { error } = await db
      .from('live_streams')
      .update({ status: 'active', started_at: new Date().toISOString(), ended_at: null })
      .eq('mux_stream_id', muxStreamId)
    if (error) console.error('Mux webhook failed to mark stream active:', error)
  } else if (event.type === 'video.live_stream.idle') {
    const { error } = await db
      .from('live_streams')
      .update({ status: 'idle', ended_at: new Date().toISOString() })
      .eq('mux_stream_id', muxStreamId)
    if (error) console.error('Mux webhook failed to mark stream idle:', error)
  }

  return NextResponse.json({ received: true })
}
