import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const exists = await prisma.user.findUnique({ where: { email } })

  if (exists) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { email, password: hashed, name }
  })

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
}
```

**Add to your `.env`:**
```
NEXTAUTH_SECRET=generate-a-random-string-here
NEXTAUTH_URL=http://localhost:3000
