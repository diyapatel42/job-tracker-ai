'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface Analysis {
  score: number
  strengths: string[]
  gaps: string[]
  suggestions: string[]
  verdict: string
}

export default function AnalyzePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [resume, setResume] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  async function handleAnalyze() {
    if (!resume.trim() || !jobDescription.trim()) return
    setLoading(true)
    setAnalysis(null)
    setError('')
    setLoadingStep('Reading your resume...')

    setTimeout(() => setLoadingStep('Comparing against job requirements...'), 1500)
    setTimeout(() => setLoadingStep('Identifying strengths & gaps...'), 3000)
    setTimeout(() => setLoadingStep('Generating suggestions...'), 4500)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': (session?.user as any)?.id
        },
        body: JSON.stringify({ resume, jobDescription })
      })

      if (!res.ok) {
        setError('Analysis failed. Check your API credits.')
        setLoading(false)
        setLoadingStep('')
        return
      }

      const data = await res.json()
      setAnalysis(data)
      setLoadingStep('')
    } catch (err) {
      setError('Something went wrong. Try again.')
      setLoadingStep('')
    }

    setLoading(false)
  }

  function getScoreColor(score: number) {
    if (score >= 75) return 'text-emerald-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-red-600'
  }

  function getScoreBg(score: number) {
    if (score >= 75) return 'bg-emerald-50 border-emerald-200'
    if (score >= 50) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resume Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-1">See how well your resume matches a job description.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Your Resume</Label>
          <Textarea value={resume} onChange={(e) => setResume(e.target.value)} rows={14} placeholder="Paste your resume text here..." />
        </div>
        <div className="space-y-2">
          <Label>Job Description</Label>
          <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={14} placeholder="Paste the job description here..." />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleAnalyze}
          disabled={loading || !resume.trim() || !jobDescription.trim()}
          className="group relative px-5 py-2.5 rounded-lg font-medium text-sm text-white overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-green-900/25 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #47662f 0%, #5a8a3a 50%, #47662f 100%)', backgroundSize: '200% 200%' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundPosition = '100% 100%' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundPosition = '0% 0%' }}
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                Analyze Match
              </>
            )}
          </span>
        </button>
        {loadingStep && (
          <span className="text-sm text-muted-foreground animate-pulse">{loadingStep}</span>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {loading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-muted animate-spin" style={{ borderTopColor: '#47662f' }}></div>
              </div>
              <p className="text-sm font-medium">{loadingStep}</p>
              <p className="text-xs text-muted-foreground">This usually takes 5-10 seconds</p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="space-y-4">
          <Card className={`border ${getScoreBg(analysis.score)}`}>
            <CardContent className="py-6">
              <div className="flex items-baseline gap-3">
                <span className={`text-5xl font-semibold tracking-tight ${getScoreColor(analysis.score)}`}>{analysis.score}</span>
                <span className="text-sm text-muted-foreground">/ 100 match score</span>
              </div>
              <p className="text-sm font-medium mt-2">{analysis.verdict}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-emerald-700 mb-3">Strengths</p>
                {(analysis.strengths || []).map((s, i) => (
                  <p key={i} className="text-sm text-muted-foreground mb-1.5">+ {s}</p>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-red-700 mb-3">Gaps</p>
                {(analysis.gaps || []).map((g, i) => (
                  <p key={i} className="text-sm text-muted-foreground mb-1.5">- {g}</p>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm font-medium text-blue-700 mb-3">Suggestions</p>
                {(analysis.suggestions || []).map((s, i) => (
                  <p key={i} className="text-sm text-muted-foreground mb-1.5">→ {s}</p>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
