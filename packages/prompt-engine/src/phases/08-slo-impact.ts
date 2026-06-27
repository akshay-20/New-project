import type { PhaseContext, PhaseResult } from '@engineering-copilot/types'
import { streamText } from 'ai'
import { getProvider } from '../providers'

export const PHASE_INDEX = 8
export const PHASE_KEY = 'slo-impact' as const
export const PHASE_LABEL = 'SLO & Reliability Impact'

/**
 * Phase 8: SLO & Reliability Impact
 *
 * Assesses how this change affects Service Level Objectives, error budgets,
 * and overall service reliability. Recommends alerting and burn-rate rules.
 */
export async function runPhase(ctx: PhaseContext): Promise<PhaseResult> {
  const startedAt = new Date()

  const systemPrompt = `You are a staff SRE analyzing how a production change affects SLOs and error budgets.
Reference Google SRE book concepts (error budget, burn rate, SLI/SLO/SLA).
Be precise about which SLOs are at risk and by how much.`

  const userPrompt = `## Task Description
${ctx.ticketText}
${ctx.repoContext ? `\n## Repository Context\n${ctx.repoContext}` : ''}

## Phase 8: SLO & Reliability Impact

### 8.1 Affected SLOs
Which SLOs does this change put at risk?

| SLO Name | Current Target | Current Burn Rate | Risk Level | Why |
|----------|---------------|-------------------|------------|-----|
| ...      | 99.9%         | 0.1x              | Low/Med/High | ... |

### 8.2 Error Budget Impact
- Current error budget remaining (if known, else estimate)
- How much error budget could this change consume?
- Is the error budget sufficient to safely deploy this change?
- If budget is low: recommend delaying until next budget window?

### 8.3 Critical User Journeys at Risk
Which user-facing flows are affected?
- Journey name
- Current p50/p95/p99 latency (if in context, else note "unknown")
- Expected latency change from this deployment

### 8.4 Availability & Failure Modes
What new failure modes does this change introduce?
What is the expected availability impact of each failure mode?

### 8.5 Alerting Recommendations
New alerts needed:
- Alert name, metric, threshold, severity, paging policy

Existing alerts that may need tuning (false positives during rollout):

### 8.6 SLO Review Gate
Should SLO review be required as a release gate? (Y/N and why)
Recommend a reliability check 24h and 72h post-deploy.`

  const model = getProvider(ctx.aiProvider, ctx.aiModel)
  let content = ''

  const { textStream } = await streamText({
    model,
    system: systemPrompt,
    prompt: userPrompt,
    maxTokens: 2000,
    temperature: 0.2,
  })

  for await (const chunk of textStream) {
    content += chunk
  }

  return {
    phaseIndex: PHASE_INDEX,
    phaseKey: PHASE_KEY,
    phaseLabel: PHASE_LABEL,
    content,
    status: 'COMPLETE',
    startedAt,
    completedAt: new Date(),
  }
}
