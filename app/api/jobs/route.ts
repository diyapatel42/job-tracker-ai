import { prisma } from '@/lib/db/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const jobs = await prisma.job.findMany({
    where: { userId },
    orderBy: { updatedDate: 'desc' }
  })

  return NextResponse.json(jobs)
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { company, role, status, url, salary, notes } = body

  if (!company || !role) {
    return NextResponse.json({ error: 'Company and role are required' }, { status: 400 })
  }

  const job = await prisma.job.create({
    data: {
      company,
      role,
      status: status || 'SAVED',
      url,
      salary,
      notes,
      userId
    }
  })

  return NextResponse.json(job, { status: 201 })
}
