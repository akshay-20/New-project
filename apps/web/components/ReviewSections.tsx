'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Edit3, Check, X, GitCompare } from 'lucide-react'
import type { ReviewSection } from '@engineering-copilot/types'

interface ReviewSectionsProps {
  sections: ReviewSection[]
  onSectionEdit: (sectionIndex: number, userContent: string) => Promise<void>
}

export function ReviewSections({ sections, onSectionEdit }: ReviewSectionsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [savingIndex, setSavingIndex] = useState<number | null>(null)

  function startEdit(section: ReviewSection) {
    setEditingIndex(section.sectionIndex)
    setEditContent(section.userContent ?? section.aiContent)
  }

  async function saveEdit(section: ReviewSection) {
    setSavingIndex(section.sectionIndex)
    await onSectionEdit(section.sectionIndex, editContent)
    setSavingIndex(null)
    setEditingIndex(null)
  }

  function cancelEdit() {
    setEditingIndex(null)
    setEditContent('')
  }

  const editedCount = sections.filter((s) => s.editedByUser).length

  return (
    <div className="space-y-4">
      {editedCount > 0 && (
        <div className="glass rounded-xl px-5 py-3 flex items-center gap-2 text-sm text-amber-400">
          <GitCompare className="w-4 h-4" />
          {editedCount} section{editedCount > 1 ? 's' : ''} edited by you
        </div>
      )}

      {sections.map((section) => {
        const isEditing = editingIndex === section.sectionIndex
        const displayContent = section.userContent ?? section.aiContent

        return (
          <div
            key={section.sectionKey}
            id={`section-${section.sectionIndex}`}
            className={`glass rounded-2xl overflow-hidden ${section.editedByUser ? 'section-edited' : ''}`}
          >
            {/* Section header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[--text-muted] bg-[--surface-700] px-2 py-0.5 rounded">
                  {String(section.sectionIndex).padStart(2, '0')}
                </span>
                <h3 className="font-semibold text-sm">{section.sectionTitle}</h3>
                {section.editedByUser && (
                  <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    edited
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      id={`section-${section.sectionIndex}-cancel`}
                      onClick={cancelEdit}
                      className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                    <button
                      id={`section-${section.sectionIndex}-save`}
                      onClick={() => saveEdit(section)}
                      disabled={savingIndex === section.sectionIndex}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      {savingIndex === section.sectionIndex ? 'Saving…' : 'Save'}
                    </button>
                  </>
                ) : (
                  <button
                    id={`section-${section.sectionIndex}-edit`}
                    onClick={() => startEdit(section)}
                    className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>
            </div>

            {/* Section content */}
            <div className="px-6 py-5">
              {isEditing ? (
                <textarea
                  id={`section-${section.sectionIndex}-textarea`}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={12}
                  className="w-full bg-[--surface-800] border border-[--brand-500]/50 rounded-xl p-4 text-sm text-white font-mono resize-none focus:outline-none focus:border-[--brand-500] transition-colors"
                />
              ) : (
                <div className="section-content prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {displayContent}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
