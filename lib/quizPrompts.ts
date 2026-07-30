import 'server-only'
import { callClaude } from './claude'
import type { IncidentUpdate, IncidentPerson } from './types'

const SHARED_RULES = `
Ground rules, non-negotiable:
- Every question and its correct answer must be verifiable strictly from the case log and people given to you. Never invent a fact, name, date, or detail.
- Anyone charged with a crime is a suspect/defendant, not guilty -- phrase questions and answers accordingly, never asserting guilt as settled fact.
- Do not write a question whose correct answer depends on a disputed_allegation or unconfirmed_report claim type unless the question itself is explicitly about what a specific party claims (e.g. "What did the family allege?"), not about what actually happened.
- No sensationalism, no trivia about violence for shock value. Favor questions about verified timeline, people, locations, and outcomes.
- NO em dashes or en dashes anywhere in the output. Use a comma, period, or "and" instead.
`.trim()

export type QuizQuestionDraft = {
  question: string
  options: string[]
  correctIndex: number
  sourceExcerpt: string | null
  sourceUrl: string | null
}

type QuizInput = {
  title: string
  description: string | null
  updates: Pick<IncidentUpdate, 'claim_type' | 'body' | 'event_date' | 'source_url'>[]
  people: Pick<IncidentPerson, 'name' | 'role' | 'summary'>[]
}

function formatLog(updates: QuizInput['updates']): string {
  return updates
    .map(
      (u, i) =>
        `[entry ${i}] [${u.claim_type}]${u.event_date ? ` (${u.event_date})` : ''} ${u.body}${u.source_url ? ` (source_url: ${u.source_url})` : ' (source_url: none)'}`
    )
    .join('\n')
}

function formatPeople(people: QuizInput['people']): string {
  if (people.length === 0) return '(no profiled people on this case)'
  return people.map((p) => `${p.role}: ${p.name}${p.summary ? ` -- ${p.summary}` : ''}`).join('\n')
}

const SYSTEM = `You are writing a "Test Your Knowledge" quiz for a true-crime case tracking site, testing readers on facts from a specific verified case file. You are given the case's claim-typed Case Log (each entry numbered, with its source_url if one exists) and any profiled people.

${SHARED_RULES}

## Output format

Return ONLY a JSON array of exactly 5 objects, nothing else, no markdown code fences, no commentary. Each object must have exactly these fields:

{
  "question": "the quiz question",
  "options": ["option A", "option B", "option C", "option D"],
  "correctIndex": 0,
  "sourceExcerpt": "a short quote or close paraphrase (under 200 characters) from the specific case log entry that proves the answer",
  "sourceUrl": "the exact source_url string of that case log entry, copied exactly as given, or null if that entry has no source_url"
}

Vary the question types across the 5: mix up dates, locations, people's roles, and what happened, so it doesn't feel repetitive. Make the 3 wrong options plausible but clearly wrong to someone who read the case, not absurd. Never make two options both defensibly correct.

Your entire reply must be valid, parseable JSON. If any question, option, or excerpt needs to include a direct quote, use single quotation marks around it (') instead of double quotation marks ("), since double quotes inside a JSON string value break parsing. Never use an unescaped double quote character anywhere inside a string value.`

function cleanJson(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
}

export async function generateQuizQuestions(input: QuizInput): Promise<QuizQuestionDraft[]> {
  const userMessage = `Case: ${input.title}

${input.description ? `Background: ${input.description}\n\n` : ''}People on this case:
${formatPeople(input.people)}

Chronological case log:
${formatLog(input.updates)}

Write the 5-question quiz now.`

  const text = await callClaude({
    system: SYSTEM,
    userMessage,
    // Extended thinking eats into this budget before the actual JSON text
    // is written, and longer/heavier cases (more updates, longer quotes)
    // need more room -- 2048 was cutting the response off mid-JSON on
    // cases with a lot of content.
    maxTokens: 4096,
    temperature: 0.5,
  })

  let parsed: unknown
  try {
    parsed = JSON.parse(cleanJson(text))
  } catch (err) {
    console.error('QUIZ JSON PARSE ERROR, raw text was:', text)
    throw err
  }
  if (!Array.isArray(parsed)) throw new Error('Quiz generation did not return an array')

  return parsed.map((q) => ({
    question: String(q.question || ''),
    options: Array.isArray(q.options) ? q.options.map((o: unknown) => String(o)) : [],
    correctIndex: Number.isInteger(q.correctIndex) ? q.correctIndex : 0,
    sourceExcerpt: q.sourceExcerpt ? String(q.sourceExcerpt) : null,
    sourceUrl: q.sourceUrl ? String(q.sourceUrl) : null,
  }))
}
