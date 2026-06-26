'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Link2, FileText, Code2, ChevronDown, Loader2 } from 'lucide-react'

const PROVIDERS = [
  { value: 'anthropic', label: 'Anthropic Claude', models: ['claude-opus-4-5', 'claude-sonnet-4-5'] },
  { value: 'openai', label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini'] },
  { value: 'google', label: 'Google Gemini', models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
  { value: 'ollama', label: 'Ollama (local)', models: ['llama3', 'mistral'] },
]

export default function NewReviewPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'text' | 'url'>('text')
  const [ticketText, setTicketText] = useState('')
  const [ticketUrl, setTicketUrl] = useState('')
  const [repoContext, setRepoContext] = useState('')
  const [provider, setProvider] = useState('anthropic')
  const [model, setModel] = useState('claude-opus-4-5')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedProvider = PROVIDERS.find((p) => p.value === provider)!

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketText: activeTab === 'text' ? ticketText : undefined,
          ticketUrl: activeTab === 'url' ? ticketUrl : undefined,
          repoContext: repoContext || undefined,
          aiProvider: provider,
          aiModel: model,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error?.message ?? 'Failed to create review')
      }

      const { reviewId } = await res.json()
      router.push(`/review/${reviewId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/5 px-6 py-4">
        <h1 className="text-xl font-bold">New Engineering Review</h1>
        <p className="text-sm text-[--text-secondary]">
          Paste your ticket and watch 10 analysis phases run live
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Input type tabs ── */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex gap-2">
              {(['text', 'url'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'gradient-brand text-white'
                      : 'text-[--text-secondary] hover:text-white hover:bg-[--surface-700]'
                  }`}
                >
                  {tab === 'text' ? <FileText className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                  {tab === 'text' ? 'Paste ticket text' : 'Ticket URL (Jira / ADO)'}
                </button>
              ))}
            </div>

            {activeTab === 'text' ? (
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                  Ticket description
                </label>
                <textarea
                  id="ticket-text"
                  value={ticketText}
                  onChange={(e) => setTicketText(e.target.value)}
                  placeholder="Paste your Jira ticket, ADO item, or describe the task in plain text…&#10;&#10;Example: Add rate limiting to the payments API. Currently the endpoint accepts unbounded requests which causes DB overload during traffic spikes. Need to implement token bucket algorithm with Redis, limit to 100 req/min per user."
                  rows={8}
                  className="w-full bg-[--surface-800] border border-[--surface-500] rounded-xl p-4 text-sm text-white placeholder-[--text-muted] resize-none focus:outline-none focus:border-[--brand-500] transition-colors font-mono"
                  required={activeTab === 'text'}
                />
                <p className="text-xs text-[--text-muted] mt-1">
                  {ticketText.length} characters · The more context, the better the analysis
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                  Ticket URL
                </label>
                <input
                  id="ticket-url"
                  type="url"
                  value={ticketUrl}
                  onChange={(e) => setTicketUrl(e.target.value)}
                  placeholder="https://your-org.atlassian.net/browse/ENG-1234"
                  className="w-full bg-[--surface-800] border border-[--surface-500] rounded-xl px-4 py-3 text-sm text-white placeholder-[--text-muted] focus:outline-none focus:border-[--brand-500] transition-colors"
                  required={activeTab === 'url'}
                />
                <p className="text-xs text-[--text-muted] mt-1">
                  Jira, Linear, GitHub Issues, or Azure DevOps links supported
                </p>
              </div>
            )}
          </div>

          {/* ── Repo context (optional) ── */}
          <div className="glass rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[--brand-400]" />
              <label className="text-sm font-medium">
                Repository context{' '}
                <span className="text-[--text-muted] font-normal">(optional but recommended)</span>
              </label>
            </div>
            <textarea
              id="repo-context"
              value={repoContext}
              onChange={(e) => setRepoContext(e.target.value)}
              placeholder="Paste relevant file paths, function signatures, schema snippets, or a git diff…&#10;&#10;Example:&#10;// src/api/payments/route.ts&#10;export async function POST(req: Request) {&#10;  // handles payment processing&#10;}"
              rows={5}
              className="w-full bg-[--surface-800] border border-[--surface-500] rounded-xl p-4 text-sm text-white placeholder-[--text-muted] resize-none focus:outline-none focus:border-[--brand-500] transition-colors font-mono"
            />
            <p className="text-xs text-[--text-muted]">
              Helps the analysis identify specific callers, migrations, and dependencies in your codebase
            </p>
          </div>

          {/* ── AI Provider ── */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[--brand-400]" />
              <label className="text-sm font-medium">AI Provider</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setProvider(p.value)
                    setModel(p.models[0]!)
                  }}
                  className={`px-4 py-3 rounded-xl text-sm text-left transition-all border ${
                    provider === p.value
                      ? 'border-[--brand-500] bg-[--brand-500]/10 text-white'
                      : 'border-[--surface-500] text-[--text-secondary] hover:border-[--surface-400] hover:text-white'
                  }`}
                >
                  <div className="font-medium">{p.label}</div>
                  <div className="text-xs text-[--text-muted] mt-0.5">{p.models[0]}</div>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs text-[--text-muted] mb-1.5">Model</label>
              <select
                id="model-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[--surface-800] border border-[--surface-500] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[--brand-500] appearance-none cursor-pointer"
              >
                {selectedProvider.models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            id="start-review-btn"
            type="submit"
            disabled={loading || (!ticketText && !ticketUrl)}
            className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Starting analysis…
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Run 10-phase analysis
              </>
            )}
          </button>

          <p className="text-center text-xs text-[--text-muted]">
            Analysis runs ~2–4 minutes depending on ticket complexity and provider
          </p>
        </form>
      </div>
    </main>
  )
}
