'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PhaseStream } from '../../../components/PhaseStream'
import { OptionPicker } from '../../../components/OptionPicker'
import { ReviewSections } from '../../../components/ReviewSections'
import { ExportMenu } from '../../../components/ExportMenu'
import { ArrowLeft, RefreshCw, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { Review } from '@engineering-copilot/types'

interface ReviewDetailClientProps {
  review: any // Prisma type from server
}

const STATUS_BADGE: Record<string, { label: string; color: string; icon: any }> = {
  ANALYZING: { label: 'Analyzing…', color: 'text-blue-400', icon: Loader2 },
  AWAITING_APPROVAL: { label: 'Choose an option', color: 'text-amber-400', icon: Clock },
  GENERATING: { label: 'Generating review…', color: 'text-purple-400', icon: Loader2 },
  COMPLETE: { label: 'Complete', color: 'text-green-400', icon: CheckCircle },
  FAILED: { label: 'Failed', color: 'text-red-400', icon: AlertCircle },
}

export function ReviewDetailClient({ review: initialReview }: ReviewDetailClientProps) {
  const [review, setReview] = useState(initialReview)
  const [polling, setPolling] = useState(false)
  const router = useRouter()

  // Poll for updates while analysis is running
  const shouldPoll = ['ANALYZING', 'GENERATING'].includes(review.status)

  const fetchLatest = useCallback(async () => {
    const res = await fetch(`/api/review/${review.id}`)
    if (res.ok) {
      const data = await res.json()
      setReview(data)
    }
  }, [review.id])

  useEffect(() => {
    if (!shouldPoll) return
    const interval = setInterval(fetchLatest, 3000) // poll every 3s
    return () => clearInterval(interval)
  }, [shouldPoll, fetchLatest])

  async function handleOptionSelect(optionIndex: number) {
    await fetch('/api/review/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: review.id, selectedOption: optionIndex }),
    })
    await fetchLatest()
  }

  async function handleSectionEdit(sectionIndex: number, userContent: string) {
    await fetch(`/api/review/${review.id}/section`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionIndex, userContent }),
    })
    await fetchLatest()
  }

  const badge = STATUS_BADGE[review.status] ?? { label: 'Unknown', color: 'text-gray-400', icon: AlertCircle }
  const BadgeIcon = badge.icon

  // Determine which UI panel to show
  const showPhases = review.phases.length > 0
  const showOptions = review.status === 'AWAITING_APPROVAL' && review.options.length > 0
  const showSections = review.sections.length > 0

  return (
    <main className="min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-[--text-secondary] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-semibold line-clamp-1 max-w-md">{review.title}</h1>
            <div className={`flex items-center gap-1.5 text-xs ${badge.color}`}>
              <BadgeIcon className={`w-3 h-3 ${['ANALYZING','GENERATING'].includes(review.status) ? 'animate-spin' : ''}`} />
              {badge.label}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {shouldPoll && (
            <button
              onClick={fetchLatest}
              className="btn-ghost flex items-center gap-1.5 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
          {review.status === 'COMPLETE' && (
            <ExportMenu reviewId={review.id} />
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">

        {/* ── Phase analysis ── */}
        {showPhases && (
          <section>
            <h2 className="text-lg font-semibold mb-4">
              10-Phase Analysis
              {review.status === 'ANALYZING' && (
                <span className="text-sm font-normal text-[--text-secondary] ml-2">
                  · {review.phases.filter((p: any) => p.status === 'COMPLETE').length}/10 complete
                </span>
              )}
            </h2>
            <PhaseStream
              phases={review.phases}
              currentStatus={review.status}
            />
          </section>
        )}

        {/* ── Option picker (gates code generation) ── */}
        {showOptions && (
          <section>
            <OptionPicker
              options={review.options}
              onSelect={handleOptionSelect}
            />
          </section>
        )}

        {/* ── 28-section review ── */}
        {showSections && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Engineering Review
                <span className="text-sm font-normal text-[--text-secondary] ml-2">
                  · {review.sections.length}/28 sections
                  {review.status === 'GENERATING' && ' · generating…'}
                </span>
              </h2>
              {review.status === 'COMPLETE' && (
                <ExportMenu reviewId={review.id} />
              )}
            </div>
            <ReviewSections
              sections={review.sections}
              onSectionEdit={handleSectionEdit}
            />
          </section>
        )}

        {/* ── Empty state while phases haven't started ── */}
        {!showPhases && review.status === 'ANALYZING' && (
          <div className="text-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-[--brand-400] mx-auto mb-4" />
            <p className="text-[--text-secondary]">Starting analysis engine…</p>
          </div>
        )}
      </div>
    </main>
  )
}
