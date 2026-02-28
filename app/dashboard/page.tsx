'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import JobForm from '@/components/forms/JobForm'
import JobCard from '@/components/ui/JobCard'
import StatsBar from '@/components/ui/StatsBar'

interface Job {
  id: string
  company: string
  role: string
  status: string
  url?: string
  salary?: string
  notes?: string
  appliedDate: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchJobs()
    }
  }, [session])

  async function fetchJobs() {
    const res = await fetch('/api/jobs', {
      headers: { 'x-user-id': (session?.user as any)?.id }
    })
    const data = await res.json()
    setJobs(data)
    setLoading(false)
  }

  async function deleteJob(id: string) {
    await fetch(`/api/jobs/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': (session?.user as any)?.id }
    })
    setJobs(jobs.filter(j => j.id !== id))
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': (session?.user as any)?.id
      },
      body: JSON.stringify({ status })
    })
    const updated = await res.json()
    setJobs(jobs.map(j => j.id === id ? updated : j))
  }

  if (status === 'loading' || loading) {
    return <p className="text-center mt-20 text-gray-500">Loading...</p>
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Applications</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700"
        >
          {showForm ? 'Cancel' : '+ Add Job'}
        </button>
      </div>

      {showForm && (
        <JobForm
          userId={(session?.user as any)?.id}
          onSave={() => {
            setShowForm(false)
            fetchJobs()
          }}
        />
      )}

      <StatsBar jobs={jobs} />

      {jobs.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">
          No applications yet. Add your first one.
        </p>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onDelete={deleteJob}
              onStatusChange={updateStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}
