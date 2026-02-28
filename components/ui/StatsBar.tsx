interface Job {
  id: string
  status: string
}

interface StatsBarProps {
  jobs: Job[]
}

export default function StatsBar({ jobs }: StatsBarProps) {
  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'APPLIED').length,
    interviewing: jobs.filter(j => j.status === 'INTERVIEWING').length,
    offered: jobs.filter(j => j.status === 'OFFERED').length,
    rejected: jobs.filter(j => j.status === 'REJECTED').length
  }

  return (
    <div className="grid grid-cols-5 gap-3">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="border border-gray-200 rounded p-3 text-center">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-500 capitalize">{key}</p>
        </div>
      ))}
    </div>
  )
}
