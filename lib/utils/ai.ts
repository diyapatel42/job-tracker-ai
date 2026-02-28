import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function parseJobPosting(text: string) {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Extract job details from this posting. Return ONLY valid JSON, no markdown, no backticks, no explanation. Use this exact format:
{"company":"","role":"","salary":"","url":"","notes":"","experienceYears":"","field":""}
If a field isn't found, use empty string. For notes, include a 1-line summary of key requirements.

Job posting:
${text}`
      }
    ]
  })

  const content = message.content[0]
  if (content.type === 'text') {
    return JSON.parse(content.text)
  }
  throw new Error('Failed to parse response')
}
