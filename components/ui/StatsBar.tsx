import { Card, CardContent } from '@/components/ui/card'

interface Job {
  id: string
  status: string
}

interface StatsBarProps {
  jobs: Job[]
}

export default function StatsBar({ jobs }: StatsBarProps) {
  const stats = [
    { label: 'Total', value: jobs.length },
    { label: 'Applied', value: jobs.filter(j => j.status === 'APPLIED').length },
    { label: 'Interviewing', value: jobs.filter(j => j.status === 'INTERVIEWING').length },
    { label: 'Offered', value: jobs.filter(j => j.status === 'OFFERED').length },
    { label: 'Rejected', value: jobs.filter(j => j.status === 'REJECTED').length }
  ]

  return (
    <div className="grid grid-cols-5 gap-3">
      {stats.map(stat => (
        <Card key={stat.label}>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
