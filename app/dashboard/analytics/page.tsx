'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import SankeyChart from '@/components/ui/SankeyChart'

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

const STATUS_ORDER = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFERED', 'REJECTED']
const STATUS_COLORS: Record<string, string> = {
  SAVED: '#a3a3a3',
  APPLIED: '#3b82f6',
  INTERVIEWING: '#f59e0b',
  OFFERED: '#22c55e',
  REJECTED: '#ef4444'
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
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

  const funnelData = useMemo(() => {
    return STATUS_ORDER.map(s => ({
      name: s.charAt(0) + s.slice(1).toLowerCase(),
      count: jobs.filter(j => j.status === s).length,
      fill: STATUS_COLORS[s]
    }))
  }, [jobs])

  const pieData = useMemo(() => {
    return STATUS_ORDER.map(s => ({
      name: s.charAt(0) + s.slice(1).toLowerCase(),
      value: jobs.filter(j => j.status === s).length
    })).filter(d => d.value > 0)
  }, [jobs])

  const timelineData = useMemo(() => {
    const grouped: Record<string, number> = {}
    jobs.forEach(j => {
      const date = new Date(j.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      grouped[date] = (grouped[date] || 0) + 1
    })
    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [jobs])

  const responseRate = useMemo(() => {
    if (jobs.length === 0) return 0
    const responded = jobs.filter(j => j.status !== 'SAVED' && j.status !== 'APPLIED').length
    return Math.round((responded / jobs.length) * 100)
  }, [jobs])

  const interviewRate = useMemo(() => {
    const applied = jobs.filter(j => j.status !== 'SAVED').length
    if (applied === 0) return 0
    const interviews = jobs.filter(j => j.status === 'INTERVIEWING' || j.status === 'OFFERED').length
    return Math.round((interviews / applied) * 100)
  }, [jobs])

  function exportToExcel() {
    const data = jobs.map(j => ({
      Company: j.company,
      Role: j.role,
      Status: j.status,
      Salary: j.salary || '',
      Field: j.field || '',
      Experience: j.experienceYears || '',
      URL: j.url || '',
      Notes: j.notes || '',
      'Date Added': new Date(j.appliedDate).toLocaleDateString()
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Applications')

    ws['!cols'] = [
      { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 12 }, { wch: 40 }, { wch: 40 }, { wch: 12 }
    ]

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([buf], { type: 'application/octet-stream' })
    saveAs(blob, `job-applications-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (status === 'loading' || loading) {
    return <p className="text-center mt-20 text-muted-foreground">Loading...</p>
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No data yet.</p>
        <p className="text-sm text-muted-foreground mt-1">Add some applications to see your analytics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Your job search at a glance</p>
        </div>
        <Button variant="outline" onClick={exportToExcel}>Export to Excel</Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-semibold tracking-tight">{jobs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Apps</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-semibold tracking-tight">{responseRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Response Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-semibold tracking-tight">{interviewRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Interview Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-semibold tracking-tight">{jobs.filter(j => j.status === 'OFFERED').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Offers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium mb-4">Application Flow</p>
          <SankeyChart jobs={jobs} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-4">Application Funnel</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={funnelData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-4">Status Breakdown</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" paddingAngle={2}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name.toUpperCase()]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {pieData.map((entry, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name.toUpperCase()] }} />
                  <span className="text-xs text-muted-foreground">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium mb-4">Applications Over Time</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(90 10% 85%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="hsl(97 37% 29%)" fill="hsl(97 37% 29%)" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
