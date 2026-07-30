import 'server-only'
import { callClaudeVision } from './claude'

const SYSTEM = `You are looking at a photo a visitor uploaded to a true-crime case tracking site, trying to identify which case or person it might relate to. You cannot verify identity from a face alone, so focus on what can actually be read or reliably observed in the image.

Ground rules:
- Transcribe any text visible in the image exactly as written: names, captions, mugshot placards, memorial text, news chyrons, watermarks, dates. This is the most reliable signal for identifying who the photo shows.
- Do not guess or invent a name if none is visible. If no text names a person, say so.
- Give a brief, neutral, factual visual description (approximate age range, setting, what kind of photo it looks like, e.g. mugshot, selfie, memorial flyer, news screenshot). Do not speculate about the person's identity, guilt, or the circumstances of any crime.
- NO em dashes or en dashes anywhere in the output.

## Output format

Return ONLY a JSON object, nothing else, no markdown code fences:
{
  "extractedNames": ["any full names or partial names visible as text in the image, exactly as written"],
  "description": "1-2 sentence neutral visual description"
}`

function cleanJson(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
}

export type PictureScanResult = {
  extractedNames: string[]
  description: string
}

export async function scanPicture(
  imageBase64: string,
  imageMediaType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<PictureScanResult> {
  const text = await callClaudeVision({
    system: SYSTEM,
    userMessage: 'Analyze this image now.',
    imageBase64,
    imageMediaType,
    maxTokens: 512,
  })

  let parsed: { extractedNames?: unknown; description?: string }
  try {
    parsed = JSON.parse(cleanJson(text))
  } catch (err) {
    console.error('PICTURE SCAN JSON PARSE ERROR, raw text was:', text)
    throw err
  }

  return {
    extractedNames: Array.isArray(parsed.extractedNames) ? parsed.extractedNames.map((n) => String(n)) : [],
    description: String(parsed.description || ''),
  }
}
