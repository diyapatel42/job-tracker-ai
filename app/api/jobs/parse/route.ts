import { parseJobPosting } from '@/lib/utils/ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { text } = await req.json()

  if (!text) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 })
  }

  try {
    const parsed = await parseJobPosting(text)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('FULL ERROR:', error)
    return NextResponse.json({ error: 'Failed to parse job posting' }, { status: 500 })
  }
}
