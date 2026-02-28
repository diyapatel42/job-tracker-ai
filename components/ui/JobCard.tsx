'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

const statusVariant: Record<string, string> = {
  SAVED: 'bg-secondary text-secondary-foreground',
  APPLIED: 'bg-blue-50 text-blue-700',
  INTERVIEWING: 'bg-amber-50 text-amber-700',
  OFFERED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700'
}

interface JobCardProps {
  job: Job
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}

export default function JobCard({ job, onDelete, onStatusChange }: JobCardProps) {
  const applied = new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const linkEl = job.url ? <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground underline transition-colors">View posting</a> : null

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h3 className="font-medium">{job.company}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusVariant[job.status]}`}>{job.status.toLowerCase()}</span>
            </div>
            <p className="text-sm text-muted-foreground">{job.role}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {job.salary && <span>{job.salary}</span>}
              {job.field && <span>{job.field}</span>}
              {job.experienceYears && <span>{job.experienceYears}</span>}
              <span>{applied}</span>
            </div>
            {job.notes && <p className="text-xs text-muted-foreground mt-1">{job.notes}</p>}
          </div>
          <div className="flex items-center gap-2">
            {linkEl}
            <select value={job.status} onChange={(e) => onStatusChange(job.id, e.target.value)} className="text-xs h-8 rounded-md border border-input bg-transparent px-2 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="SAVED">Saved</option>
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="OFFERED">Offered</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(job.id)}>Delete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
