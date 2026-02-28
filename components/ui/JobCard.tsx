'use client'

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

const statusColors: Record<string, string> = {
  SAVED: 'bg-gray-100 text-gray-700',
  APPLIED: 'bg-blue-100 text-blue-700',
  INTERVIEWING: 'bg-yellow-100 text-yellow-700',
  OFFERED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700'
}

interface JobCardProps {
  job: Job
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}

export default function JobCard({ job, onDelete, onStatusChange }: JobCardProps) {
  const applied = new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const linkEl = job.url ? <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Link</a> : null

  return (
    <div className="border border-gray-200 rounded p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold">{job.company}</h3>
            <span className={`text-xs px-2 py-1 rounded ${statusColors[job.status]}`}>{job.status}</span>
          </div>
          <p className="text-sm text-gray-600">{job.role}</p>
          <div className="flex gap-3 text-xs text-gray-400">
            {job.salary && <span>{job.salary}</span>}
            {job.field && <span>{job.field}</span>}
            {job.experienceYears && <span>{job.experienceYears} exp</span>}
            <span>Added {applied}</span>
          </div>
          {job.notes && <p className="text-xs text-gray-400 mt-1">{job.notes}</p>}
        </div>
        <div className="flex items-center gap-2">
          {linkEl}
          <select value={job.status} onChange={(e) => onStatusChange(job.id, e.target.value)} className="text-sm border border-gray-300 rounded px-2 py-1">
            <option value="SAVED">Saved</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFERED">Offered</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button onClick={() => onDelete(job.id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
        </div>
      </div>
    </div>
  )
}
