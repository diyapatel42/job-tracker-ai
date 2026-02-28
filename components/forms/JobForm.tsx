'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface JobFormProps {
  userId: string
  onSave: () => void
}

export default function JobForm({ userId, onSave }: JobFormProps) {
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [parseStep, setParseStep] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'SAVED',
    url: '',
    salary: '',
    notes: '',
    experienceYears: '',
    field: ''
  })

  async function handleParse() {
    if (!pasteText.trim()) return
    setParsing(true)
    setParseStep('Reading job posting...')

    setTimeout(() => setParseStep('Extracting company & role...'), 1200)
    setTimeout(() => setParseStep('Analyzing requirements...'), 2500)
    setTimeout(() => setParseStep('Pulling salary & benefits...'), 3800)

    try {
      const res = await fetch('/api/jobs/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ text: pasteText })
      })
      const data = await res.json()
      setParseStep('Done! Fields populated.')
      setFormData(prev => ({
        ...prev,
        company: data.company || prev.company,
        role: data.role || prev.role,
        salary: data.salary || prev.salary,
        url: data.url || prev.url,
        notes: data.notes || prev.notes,
        experienceYears: data.experienceYears || prev.experienceYears,
        field: data.field || prev.field
      }))
      setTimeout(() => setParseStep(''), 2000)
    } catch (err) {
      setParseStep('Failed to extract. Try again.')
      setTimeout(() => setParseStep(''), 3000)
      console.error('Parse failed:', err)
    }

    setParsing(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify(formData)
    })

    setLoading(false)
    onSave()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Paste job posting</Label>
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={4}
            placeholder="Paste the entire job description here — AI will extract every detail..."
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleParse}
              disabled={parsing || !pasteText.trim()}
              className="group relative px-5 py-2.5 rounded-lg font-medium text-sm text-white overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-green-900/25 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #47662f 0%, #5a8a3a 50%, #47662f 100%)', backgroundSize: '200% 200%' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundPosition = '100% 100%' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundPosition = '0% 0%' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {parsing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Extracting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                    Extract with AI
                  </>
                )}
              </span>
            </button>
            {parseStep && (
              <span className="text-sm text-muted-foreground animate-pulse">{parseStep}</span>
            )}
          </div>
        </div>

        <Separator />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company *</Label>
              <Input name="company" value={formData.company} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Input name="role" value={formData.role} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select name="status" value={formData.status} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="SAVED">Saved</option>
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="OFFERED">Offered</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Salary</Label>
              <Input name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g. $80k-100k" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Experience</Label>
              <Input name="experienceYears" value={formData.experienceYears} onChange={handleChange} placeholder="e.g. 3+ years" />
            </div>
            <div className="space-y-2">
              <Label>Field</Label>
              <Input name="field" value={formData.field} onChange={handleChange} placeholder="e.g. Frontend" />
            </div>
            <div className="space-y-2">
              <Label>Job URL</Label>
              <Input name="url" value={formData.url} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Application'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
