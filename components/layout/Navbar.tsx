'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="flex items-center justify-between p-4 border-b border-gray-200">
      <Link href="/" className="text-xl font-bold">
        JobTracker AI
      </Link>
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <span className="text-sm text-gray-500">{session.user?.email}</span>
            <button
              onClick={() => signOut()}
              className="px-3 py-1 text-sm bg-gray-900 text-white rounded hover:bg-gray-700"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="hover:underline">
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-3 py-1 bg-gray-900 text-white rounded hover:bg-gray-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
