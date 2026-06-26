'use client'

import { useState } from 'react'
import { Download, FileText, FileCode2, Link, Loader2 } from 'lucide-react'

interface ExportMenuProps {
  reviewId: string
}

const FORMATS = [
  { id: 'MARKDOWN', label: 'Markdown (.md)', icon: FileCode2, description: 'Paste into GitHub, Notion, Confluence' },
  { id: 'PDF', label: 'PDF', icon: FileText, description: 'Download formatted PDF' },
  { id: 'JIRA_COMMENT', label: 'Jira Comment', icon: Link, description: 'Formatted for Jira rich text' },
  { id: 'ADO_COMMENT', label: 'Azure DevOps', icon: Link, description: 'Formatted for ADO wiki / PR' },
] as const

export function ExportMenu({ reviewId }: ExportMenuProps) {
  const [exporting, setExporting] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  async function handleExport(format: string) {
    setExporting(format)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, format }),
      })

      if (format === 'MARKDOWN') {
        const { content } = await res.json()
        const blob = new Blob([content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `engineering-review-${reviewId.slice(0, 8)}.md`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'PDF') {
        const { url } = await res.json()
        window.open(url, '_blank')
      } else {
        const { content } = await res.json()
        await navigator.clipboard.writeText(content)
        alert('Copied to clipboard!')
      }
    } finally {
      setExporting(null)
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        id="export-menu-btn"
        onClick={() => setOpen(!open)}
        className="btn-ghost flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 glass rounded-xl shadow-2xl border border-[--surface-500] overflow-hidden z-50 animate-fade-up">
          {FORMATS.map((fmt) => {
            const Icon = fmt.icon
            return (
              <button
                key={fmt.id}
                id={`export-${fmt.id.toLowerCase()}-btn`}
                onClick={() => handleExport(fmt.id)}
                disabled={exporting === fmt.id}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                {exporting === fmt.id ? (
                  <Loader2 className="w-4 h-4 mt-0.5 animate-spin text-[--brand-400]" />
                ) : (
                  <Icon className="w-4 h-4 mt-0.5 text-[--brand-400]" />
                )}
                <div>
                  <p className="text-sm font-medium">{fmt.label}</p>
                  <p className="text-xs text-[--text-muted]">{fmt.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
