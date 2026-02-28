import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

function cleanJSON(text: string) {
  return text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
}

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
    return JSON.parse(cleanJSON(content.text))
  }
  throw new Error('Failed to parse response')
}

export async function analyzeResume(resume: string, jobDescription: string) {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a hiring manager. Compare this resume against the job description. Return ONLY valid JSON, no markdown, no backticks, no explanation. Use this exact format:
{"score":0,"strengths":["",""],"gaps":["",""],"suggestions":["",""],"verdict":""}
score is 0-100. strengths are things the candidate has that match. gaps are things the job wants that the candidate lacks. suggestions are specific things the candidate should add or learn. verdict is a 1-sentence honest summary.

Resume:
${resume}

Job Description:
${jobDescription}`
      }
    ]
  })

  const content = message.content[0]
  if (content.type === 'text') {
    return JSON.parse(cleanJSON(content.text))
  }
  throw new Error('Failed to parse response')
}
