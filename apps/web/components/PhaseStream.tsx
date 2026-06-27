'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CheckCircle, Loader2, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { PhaseResult } from '@engineering-copilot/types'

interface PhaseStreamProps {
  phases: PhaseResult[]
  currentStatus: string
}

const STATUS_ICON = {
  PENDING: Clock,
  STREAMING: Loader2,
  COMPLETE: CheckCircle,
  FAILED: AlertCircle,
}

const STATUS_COLOR = {
  PENDING: 'text-[--text-muted]',
  STREAMING: 'text-[--brand-400]',
  COMPLETE: 'text-green-400',
  FAILED: 'text-red-400',
}

export function PhaseStream({ phases, currentStatus }: PhaseStreamProps) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the streaming phase
  useEffect(() => {
    const streaming = phases.findIndex((p) => p.status === 'STREAMING')
    if (streaming !== -1) setExpanded(streaming + 1)
  }, [phases])

  const activePhase = phases.find((p) => p.status === 'STREAMING')

  return (
    <div className="space-y-2">
      {phases.map((phase, i) => {
        const Icon = STATUS_ICON[phase.status]
        const color = STATUS_COLOR[phase.status]
        const isExpanded = expanded === phase.phaseIndex

        return (
          <div
            key={phase.phaseKey}
            className={`phase-card glass rounded-xl overflow-hidden transition-all ${phase.status.toLowerCase()}`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <button
              id={`phase-${phase.phaseIndex}-toggle`}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/5 transition-colors"
              onClick={() => setExpanded(isExpanded ? null : phase.phaseIndex)}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${color} ${phase.status === 'STREAMING' ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium flex-1">
                <span className="text-[--text-muted] mr-2">{String(phase.phaseIndex).padStart(2, '0')}.</span>
                {phase.phaseLabel}
              </span>
              {phase.completedAt && (
                <span className="text-xs text-[--text-muted]">
                  {Math.round((new Date(phase.completedAt).getTime() - new Date(phase.startedAt!).getTime()) / 1000)}s
                </span>
              )}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-[--text-muted]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[--text-muted]" />
              )}
            </button>

            {isExpanded && phase.content && (
              <div className="px-5 pb-5 pt-0 border-t border-white/5">
                <div className={`section-content prose prose-invert prose-sm max-w-none mt-4 ${phase.status === 'STREAMING' ? 'cursor-blink' : ''}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {phase.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
