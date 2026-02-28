'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
        return
      }

      const data = await res.json()
      setAnalysis(data)
    } catch (err) {
      setError('Something went wrong. Try again.')
      console.error('Analysis failed:', err)
    }

    setLoading(false)
  }

  function getScoreColor(score: number) {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6">
      <h1 className="text-2xl font-bold">Resume Analyzer</h1>
      <p className="text-sm text-gray-500">Paste your resume and a job description to see how well you match.</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Your Resume</label>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={12}
            placeholder="Paste your resume text here..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={12}
            placeholder="Paste the job description here..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !resume.trim() || !jobDescription.trim()}
        className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Analyze Match'}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {analysis && (
        <div className="border border-gray-200 rounded p-6 space-y-4">
          <div className="flex items-center gap-4">
            <span className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}</span>
            <span className="text-gray-500 text-sm">/ 100 match score</span>
          </div>

          <p className="text-sm font-medium">{analysis.verdict}</p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-green-700 mb-2">Strengths</h3>
              {(analysis.strengths || []).map((s, i) => (
                <p key={i} className="text-sm text-gray-600 mb-1">+ {s}</p>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-700 mb-2">Gaps</h3>
              {(analysis.gaps || []).map((g, i) => (
                <p key={i} className="text-sm text-gray-600 mb-1">- {g}</p>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-700 mb-2">Suggestions</h3>
              {(analysis.suggestions || []).map((s, i) => (
                <p key={i} className="text-sm text-gray-600 mb-1">→ {s}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
