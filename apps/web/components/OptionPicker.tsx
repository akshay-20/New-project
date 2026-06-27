'use client'

import { useState } from 'react'
import { CheckCircle, ArrowRight, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import type { ImplementationOption } from '@engineering-copilot/types'

interface OptionPickerProps {
  options: ImplementationOption[]
  onSelect: (optionIndex: number) => Promise<void>
}

const EFFORT_COLOR = { low: 'text-green-400', medium: 'text-amber-400', high: 'text-red-400' }
const RISK_COLOR = { low: 'text-green-400', medium: 'text-amber-400', high: 'text-red-400' }
const EFFORT_LABEL = { low: 'Low effort', medium: 'Medium effort', high: 'High effort' }
const RISK_LABEL = { low: 'Low risk', medium: 'Medium risk', high: 'High risk' }

export function OptionPicker({ options, onSelect }: OptionPickerProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [confirming, setConfirming] = useState(false)

  async function handleApprove() {
    if (!selected) return
    setConfirming(true)
    await onSelect(selected)
  }

  return (
    <div className="space-y-5">
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold mb-2">Choose an implementation approach</h2>
        <p className="text-[--text-secondary]">
          Review all options carefully. Code generation unlocks after you approve one.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {options.map((opt) => (
          <div
            key={opt.optionIndex}
            id={`option-card-${opt.optionIndex}`}
            onClick={() => setSelected(opt.optionIndex)}
            className={`option-card glass rounded-2xl p-5 cursor-pointer border ${
              selected === opt.optionIndex
                ? 'selected border-[--brand-500]'
                : 'border-[--surface-500]'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {opt.optionIndex}
              </div>
              {selected === opt.optionIndex && (
                <CheckCircle className="w-5 h-5 text-[--brand-400]" />
              )}
            </div>

            <h3 className="font-semibold text-base mb-2">{opt.title}</h3>
            <p className="text-sm text-[--text-secondary] mb-4 leading-relaxed">{opt.summary}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-xs font-medium flex items-center gap-1 ${EFFORT_COLOR[opt.tradeoffs.effort]}`}>
                <Clock className="w-3 h-3" />
                {EFFORT_LABEL[opt.tradeoffs.effort]}
                {opt.tradeoffs.estimatedDays && ` · ~${opt.tradeoffs.estimatedDays}d`}
              </span>
              <span className={`text-xs font-medium flex items-center gap-1 ${RISK_COLOR[opt.tradeoffs.risk]}`}>
                <AlertTriangle className="w-3 h-3" />
                {RISK_LABEL[opt.tradeoffs.risk]}
              </span>
            </div>

            <div className="space-y-3">
              {opt.tradeoffs.pros.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-400 mb-1">✓ Pros</p>
                  <ul className="space-y-0.5">
                    {opt.tradeoffs.pros.map((pro, i) => (
                      <li key={i} className="text-xs text-[--text-secondary]">{pro}</li>
                    ))}
                  </ul>
                </div>
              )}
              {opt.tradeoffs.cons.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-400 mb-1">✗ Cons</p>
                  <ul className="space-y-0.5">
                    {opt.tradeoffs.cons.map((con, i) => (
                      <li key={i} className="text-xs text-[--text-secondary]">{con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="flex justify-center pt-4 animate-fade-up">
          <button
            id="approve-option-btn"
            onClick={handleApprove}
            disabled={confirming}
            className="btn-primary flex items-center gap-2 px-8 py-3 text-base"
          >
            {confirming ? (
              'Unlocking code generation…'
            ) : (
              <>
                Approve Option {selected} — generate 28-section review
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
