'use client'

import { useState } from 'react'

interface JobFormProps {
  userId: string
  onSave: () => void
}

export default function JobForm({ userId, onSave }: JobFormProps) {
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
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
    } catch (err) {
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
    <div className="border border-gray-200 rounded p-4 space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Paste job posting (AI will extract details)</label>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          rows={4}
          placeholder="Paste the entire job description here..."
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          type="button"
          onClick={handleParse}
          disabled={parsing || !pasteText.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 text-sm"
        >
          {parsing ? 'AI is reading...' : 'Extract with AI'}
        </button>
      </div>

      <hr className="border-gray-200" />

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Company *</label>
            <input name="company" value={formData.company} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role *</label>
            <input name="role" value={formData.role} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="SAVED">Saved</option>
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="OFFERED">Offered</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Salary</label>
            <input name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g. $80k-100k" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Experience Required</label>
            <input name="experienceYears" value={formData.experienceYears} onChange={handleChange} placeholder="e.g. 3+ years" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Field</label>
            <input name="field" value={formData.field} onChange={handleChange} placeholder="e.g. Frontend, DevOps" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job URL</label>
            <input name="url" value={formData.url} onChange={handleChange} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Job'}
        </button>
      </form>
    </div>
  )
}
