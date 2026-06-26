import type { PhaseContext, PhaseResult } from '@engineering-copilot/types'
import { streamText } from 'ai'
import { getProvider } from '../providers'

export const PHASE_INDEX = 10
export const PHASE_KEY = 'canary-plan' as const
export const PHASE_LABEL = 'Canary Rollout Plan'

/**
 * Phase 10: Canary Rollout Plan
 *
 * Designs a safe, staged rollout strategy. Defines traffic split percentages,
 * success metrics, soak time, and kill-switch conditions.
 */
export async function runPhase(ctx: PhaseContext): Promise<PhaseResult> {
  const startedAt = new Date()

  const systemPrompt = `You are a staff SRE designing a canary deployment strategy.
Be specific about traffic percentages, soak times, and automated promotion/rollback criteria.
Reference progressive delivery best practices (Flagger, Argo Rollouts, etc. if applicable).`

  const userPrompt = `## Task Description
${ctx.ticketText}
${ctx.repoContext ? `\n## Repository Context\n${ctx.repoContext}` : ''}

## Phase 10: Canary Rollout Plan

### 10.1 Rollout Strategy Recommendation
Which rollout strategy is most appropriate for this change?
- [ ] Blue/Green
- [ ] Canary (gradual traffic split)
- [ ] Feature flag (dark launch)
- [ ] Ring deployment (internal → beta → GA)
- [ ] Immediate (no canary needed — why?)

### 10.2 Traffic Split Schedule
| Stage | Traffic % | Soak Time | Go/No-Go Gate |
|-------|-----------|-----------|---------------|
| Canary | 1% | 30 min | Error rate < 0.1%, p99 < baseline + 20% |
| Stage 2 | 10% | 2 hours | Same gates |
| Stage 3 | 50% | 4 hours | Same gates + manual sign-off |
| Full | 100% | 24 hours | SLO burn rate < 1x |

### 10.3 Canary Success Metrics
Metrics that must hold at each stage before promoting:
- Error rate: must stay below ___ %
- p99 latency: must stay within ___ ms of baseline
- Throughput: must not drop below ___ req/min
- Business metric (if applicable): ___

### 10.4 Kill-Switch Conditions (Auto-Rollback)
Conditions that trigger automatic rollback:
- Error rate exceeds: ___ % for ___ consecutive minutes
- p99 exceeds: ___ ms for ___ consecutive minutes
- Alert fires: [alert name]

### 10.5 Tooling & Implementation
Which tool manages the canary?
- Platform: [Argo Rollouts / Flagger / LaunchDarkly / nginx split / ALB weighted routing / manual]
- Config file or UI location
- Who is the release manager for this rollout?

### 10.6 Communication Plan
| Stage | Notify | Channel | Message |
|-------|--------|---------|---------|
| Start | #releases | Slack | "Canary started: [version] at 1%" |
| 10% | #releases | Slack | "Canary healthy at 10%, promoting" |
| 100% | #releases + #team | Slack | "Fully rolled out ✅" |
| Rollback | #incidents | PagerDuty | Incident created |`

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
