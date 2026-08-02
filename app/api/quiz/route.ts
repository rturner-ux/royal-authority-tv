import { NextRequest, NextResponse } from 'next/server'
import { getCaseBySlug } from '@/lib/cases'
import { getOrCreateQuizQuestions } from '@/lib/quiz'

export async function POST(req: NextRequest) {
  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const result = await getCaseBySlug(slug)
  if (!result) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

  try {
    const pool = await getOrCreateQuizQuestions(result.incident.id, {
      title: result.incident.title,
      description: result.incident.description,
      updates: result.updates,
      people: result.people,
    })

    if (pool.length === 0) {
      return NextResponse.json({ error: 'Not enough case information to build a quiz yet' }, { status: 422 })
    }

    // Random 5 of the (up to 10) cached pool, reshuffled every request, so
    // retaking the quiz doesn't show the identical set every time.
    const questions = [...pool].sort(() => Math.random() - 0.5).slice(0, 5)

    return NextResponse.json({ questions })
  } catch (err) {
    console.error('Quiz generation failed:', err)
    return NextResponse.json({ error: 'Could not generate the quiz right now' }, { status: 500 })
  }
}
