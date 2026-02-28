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
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are a job posting parser. Extract as much useful detail as possible from this job posting. Return ONLY valid JSON, no markdown, no backticks, no explanation.

Rules for each field:
- company: The company name only
- role: The exact job title as written
- salary: The salary, pay range, or compensation details if mentioned. Include currency, bonuses, equity if listed. Otherwise empty string.
- url: Any application URL or company careers page if mentioned, otherwise empty string
- experienceYears: How many years of experience required (e.g. "3+ years", "5-7 years", "Entry level", "Senior"). Extract from requirements section.
- field: The specific tech field (e.g. "Full Stack", "Frontend", "Backend", "DevOps", "Data Engineering", "Cloud", "Mobile", "ML/AI", "Security", "QA")
- notes: Pack as much useful info as possible into this field. Include ALL of the following if available, separated by " | ":
  1. Required tech stack and tools (e.g. React, Node.js, PostgreSQL, AWS)
  2. Required skills (e.g. CI/CD, microservices, REST APIs)
  3. Nice-to-have skills
  4. Team size or who you report to
  5. Remote/hybrid/onsite and location
  6. Benefits mentioned (health, 401k, PTO, etc)
  7. Education requirements
  8. Industry or domain (e.g. fintech, healthcare, e-commerce)
  9. Interview process if mentioned
  10. Start date or urgency if mentioned
  11. Visa sponsorship if mentioned
  12. Any other standout details

Example notes: "Required: React, TypeScript, Node.js, PostgreSQL, AWS | Nice-to-have: GraphQL, Redis, Docker | Remote-first, US timezone | Series B fintech startup, 20 person eng team | Reports to VP Engineering | Unlimited PTO, equity, health/dental | No visa sponsorship"

Use this exact JSON format:
{"company":"","role":"","salary":"","url":"","experienceYears":"","field":"","notes":""}

If a field is not found in the posting, use empty string. For notes, extract EVERYTHING useful even if the posting is short.

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
