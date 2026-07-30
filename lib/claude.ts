import 'server-only'

// Shared Claude API client with prompt caching -- same pattern as
// royal-authority-map's lib/claude.ts.
export async function callClaude({
  system,
  userMessage,
  maxTokens = 2048,
}: {
  system: string
  userMessage: string
  maxTokens?: number
  temperature?: number
}): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'prompt-caching-2024-07-31',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: maxTokens,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  return extractText(await response.json(), response.status, response.ok)
}

function extractText(data: any, status: number, ok: boolean): string {
  // Extended thinking responses put the reasoning in content[0] (type
  // "thinking") and the actual answer in a later block (type "text") --
  // find it by type rather than assuming index 0.
  const textBlock = data.content?.find((block: { type: string; text?: string }) => block.type === 'text')
  if (!ok || !textBlock?.text) {
    console.error('CLAUDE API RAW ERROR:', status, JSON.stringify(data))
    throw new Error(data?.error?.message || `Claude API failed (${status})`)
  }
  return textBlock.text
}

// Vision variant -- sends a base64-encoded image alongside the text prompt.
// Used for the AI Picture Scan feature; separate from callClaude since most
// callers never need to send an image and the payload shape differs.
export async function callClaudeVision({
  system,
  userMessage,
  imageBase64,
  imageMediaType,
  maxTokens = 1024,
}: {
  system: string
  userMessage: string
  imageBase64: string
  imageMediaType: 'image/jpeg' | 'image/png' | 'image/webp'
  maxTokens?: number
}): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: maxTokens,
      system: [{ type: 'text', text: system }],
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: imageMediaType, data: imageBase64 } },
            { type: 'text', text: userMessage },
          ],
        },
      ],
    }),
  })

  const data = await response.json()
  return extractText(data, response.status, response.ok)
}
