import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'
import { scanPicture } from '@/lib/pictureScanPrompts'

const MAX_BYTES = 8 * 1024 * 1024 // 8MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('photo')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No photo uploaded' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Please upload a JPEG, PNG, or WEBP image' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be under 8MB' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp'

    const scan = await scanPicture(base64, mediaType)

    let matches: Array<{ type: 'case' | 'person'; id: string; name: string; slug: string; category?: string; role?: string; photo_url: string | null }> = []

    if (scan.extractedNames.length > 0) {
      const db = supabase()
      const nameQueries = scan.extractedNames.slice(0, 3)

      const results = await Promise.all(
        nameQueries.map((name) =>
          Promise.all([
            db.from('incidents').select('id, title, slug, category, image_url').eq('is_hidden', false).ilike('title', `%${name}%`).limit(3),
            db
              .from('incident_people')
              .select('id, name, role, photo_url, incident_id, incidents!inner(slug, title)')
              .ilike('name', `%${name}%`)
              .limit(3),
          ])
        )
      )

      for (const [{ data: cases }, { data: people }] of results) {
        for (const c of cases ?? []) {
          matches.push({ type: 'case', id: c.id, name: c.title, slug: c.slug, category: c.category, photo_url: c.image_url })
        }
        for (const p of people ?? []) {
          const incident = Array.isArray(p.incidents) ? p.incidents[0] : p.incidents
          if (!incident) continue
          matches.push({ type: 'person', id: p.id, name: p.name, slug: incident.slug, role: p.role, photo_url: p.photo_url })
        }
      }

      // De-dupe by slug+name in case multiple extracted names hit the same case.
      const seen = new Set<string>()
      matches = matches.filter((m) => {
        const key = `${m.type}:${m.slug}:${m.name}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    return NextResponse.json({
      extractedNames: scan.extractedNames,
      description: scan.description,
      matches,
    })
  } catch (err) {
    console.error('Picture scan failed:', err)
    return NextResponse.json({ error: 'Could not analyze this image right now' }, { status: 500 })
  }
}
