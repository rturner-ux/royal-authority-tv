import 'server-only'
import { supabase } from './supabase/server'
import { generateQuizQuestions } from './quizPrompts'
import type { IncidentQuizQuestion, IncidentUpdate, IncidentPerson } from './types'

// Lazily generates and caches a 10-question pool per case the first time
// anyone requests it, so the ~90 existing cases (and every new one) get a
// quiz without needing a backfill cron. Later requests just read the
// cached rows -- the API route picks a random 5 of the 10 per attempt, so
// retrying doesn't show the identical quiz every time.
export async function getOrCreateQuizQuestions(
  incidentId: string,
  input: {
    title: string
    description: string | null
    updates: Pick<IncidentUpdate, 'claim_type' | 'body' | 'event_date' | 'source_url'>[]
    people: Pick<IncidentPerson, 'name' | 'role' | 'summary'>[]
  }
): Promise<IncidentQuizQuestion[]> {
  const db = supabase()

  const { data: existing, error: existingError } = await db
    .from('incident_quiz_questions')
    .select('*')
    .eq('incident_id', incidentId)
    .order('sequence', { ascending: true })

  if (existingError) throw existingError
  if (existing && existing.length > 0) return existing as IncidentQuizQuestion[]

  const drafts = await generateQuizQuestions(input)
  if (drafts.length === 0) return []

  const rows = drafts.map((d, i) => ({
    incident_id: incidentId,
    question: d.question,
    options: d.options,
    correct_index: d.correctIndex,
    source_excerpt: d.sourceExcerpt,
    source_url: d.sourceUrl,
    sequence: i,
  }))

  const { data: inserted, error: insertError } = await db
    .from('incident_quiz_questions')
    .insert(rows)
    .select('*')

  // A concurrent request may have inserted first -- re-read rather than
  // erroring, so the visitor still gets a quiz.
  if (insertError) {
    const { data: refetched, error: refetchError } = await db
      .from('incident_quiz_questions')
      .select('*')
      .eq('incident_id', incidentId)
      .order('sequence', { ascending: true })
    if (refetchError) throw insertError
    return (refetched ?? []) as IncidentQuizQuestion[]
  }

  return (inserted ?? []) as IncidentQuizQuestion[]
}
