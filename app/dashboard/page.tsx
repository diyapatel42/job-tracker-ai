'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  experienceYears?: string
  field?: string
  appliedDate: string
}

type SortOption = 'newest' | 'oldest' | 'company' | 'status'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [filterStatus, setFilterStatus] = useState('ALL')

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

  async function updateStatus(id: string, newStatus: string) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': (session?.user as any)?.id
      },
      body: JSON.stringify({ status: newStatus })
    })
    const updated = await res.json()
    setJobs(jobs.map(j => j.id === id ? updated : j))
  }

  const filteredJobs = useMemo(() => {
    let result = [...jobs]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(j =>
        j.company.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q) ||
        (j.field && j.field.toLowerCase().includes(q)) ||
        (j.notes && j.notes.toLowerCase().includes(q))
      )
    }

    if (filterStatus !== 'ALL') {
      result = result.filter(j => j.status === filterStatus)
    }

    switch (sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime())
        break
      case 'company':
        result.sort((a, b) => a.company.localeCompare(b.company))
        break
      case 'status':
        const order = ['INTERVIEWING', 'OFFERED', 'APPLIED', 'SAVED', 'REJECTED']
        result.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))
        break
    }

    return result
  }, [jobs, search, sort, filterStatus])

  if (status === 'loading' || loading) {
    return <p className="text-center mt-20 text-muted-foreground">Loading...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">{jobs.length} total</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Application'}
        </Button>
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

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search company, role, field..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="ALL">All statuses</option>
          <option value="SAVED">Saved</option>
          <option value="APPLIED">Applied</option>
          <option value="INTERVIEWING">Interviewing</option>
          <option value="OFFERED">Offered</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="company">Company A-Z</option>
          <option value="status">Priority</option>
        </select>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">{search || filterStatus !== 'ALL' ? 'No matching applications.' : 'No applications yet.'}</p>
          <p className="text-sm text-muted-foreground mt-1">{search || filterStatus !== 'ALL' ? 'Try a different search or filter.' : 'Add your first one to get started.'}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} onDelete={deleteJob} onStatusChange={updateStatus} />
          ))}
        </div>
      )}
    </div>
  )
}
