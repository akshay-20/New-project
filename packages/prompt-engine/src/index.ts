import type { PhaseContext, PhaseResult } from '@engineering-copilot/types'
import * as phase1 from './phases/01-context'
import * as phase2 from './phases/02-dependency-graph'
import * as phase3 from './phases/03-callers'
import * as phase4 from './phases/04-db-migrations'
import * as phase5 from './phases/05-infra-kafka'
import * as phase6 from './phases/06-iam-permissions'
import * as phase7 from './phases/07-risk-register'
import * as phase8 from './phases/08-slo-impact'
import * as phase9 from './phases/09-rollback-strategy'
import * as phase10 from './phases/10-canary-plan'

/** All phases in execution order */
const PHASES = [phase1, phase2, phase3, phase4, phase5, phase6, phase7, phase8, phase9, phase10]

export type PhaseProgressCallback = (phase: PhaseResult, index: number, total: number) => void | Promise<void>

/**
 * Runs all 10 analysis phases sequentially.
 * Each phase receives the output of all previous phases as context.
 *
 * @param ctx - The phase context (ticket text, repo context, AI provider)
 * @param onPhaseComplete - Optional callback called after each phase completes
 */
export async function runAllPhases(
  ctx: PhaseContext,
  onPhaseComplete?: PhaseProgressCallback
): Promise<PhaseResult[]> {
  const results: PhaseResult[] = []

  for (const phase of PHASES) {
    const ctxWithHistory: PhaseContext = {
      ...ctx,
      previousPhases: results,
    }

    const result = await phase.runPhase(ctxWithHistory)
    results.push(result)

    if (onPhaseComplete) {
      await onPhaseComplete(result, result.phaseIndex, PHASES.length)
    }
  }

  return results
}

// Public API
export { getProvider, DEFAULT_MODELS } from './providers'
export { generateOptions } from './options-generator'
export { generateSections, SECTION_DEFINITIONS } from './sections-generator'
export type { PhaseContext, PhaseResult } from '@engineering-copilot/types'
