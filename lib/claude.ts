import 'server-only'

// Shared Claude API client with prompt caching -- same pattern as
// royal-authority-map's lib/claude.ts.
export async function callClaude({
  system,
  userMessage,
  maxTokens = 2048,
  temperature = 0.4,
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
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      temperature,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  const data = await response.json()
  if (!response.ok || !data.content?.[0]?.text) {
    throw new Error(data?.error?.message || 'Claude API failed')
  }
  return data.content[0].text
}
