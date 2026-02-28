import { analyzeResume } from '@/lib/utils/ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { resume, jobDescription } = await req.json()

  if (!resume || !jobDescription) {
    return NextResponse.json({ error: 'Resume and job description required' }, { status: 400 })
  }

  try {
    const analysis = await analyzeResume(resume, jobDescription)
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 })
  }
}
