import { NextRequest, NextResponse } from 'next/server'
import { getCaseBySlug } from '@/lib/cases'
import { checkClaim } from '@/lib/factCheckPrompts'

export async function POST(req: NextRequest) {
  const { slug, claim } = await req.json()

  if (!slug || !claim) return NextResponse.json({ error: 'Missing slug or claim' }, { status: 400 })
  if (typeof claim !== 'string' || claim.trim().length === 0) {
    return NextResponse.json({ error: 'Claim must not be empty' }, { status: 400 })
  }
  if (claim.length > 1000) {
    return NextResponse.json({ error: 'Claim must be under 1000 characters' }, { status: 400 })
  }

  const result = await getCaseBySlug(slug)
  if (!result) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  try {
    const check = await checkClaim(result.incident.title, result.updates, claim.trim())
    return NextResponse.json(check)
  } catch (err) {
    console.error('Fact check failed:', err)
    return NextResponse.json({ error: 'Could not check this claim right now' }, { status: 500 })
  }
}
