'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <header>
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-base font-semibold tracking-tight">JobTracker AI</Link>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/dashboard/analyze" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Analyzer</Link> <Link href="/dashboard/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Analytics</Link>
              <span className="text-xs text-muted-foreground">{session.user?.email}</span>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
      <Separator />
    </header>
  )
}
