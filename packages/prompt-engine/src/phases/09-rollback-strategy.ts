import type { PhaseContext, PhaseResult } from '@engineering-copilot/types'
import { streamText } from 'ai'
import { getProvider } from '../providers'

export const PHASE_INDEX = 9
export const PHASE_KEY = 'rollback-strategy' as const
export const PHASE_LABEL = 'Rollback Strategy'

/**
 * Phase 9: Rollback Strategy
 *
 * Produces a step-by-step rollback runbook for if this deployment fails in
 * production. Covers code, database, infrastructure, and event streams.
 */
export async function runPhase(ctx: PhaseContext): Promise<PhaseResult> {
  const startedAt = new Date()

  const systemPrompt = `You are a staff SRE writing a rollback runbook for a production deployment.
Write rollback steps as numbered commands/actions, not vague instructions.
Assume the on-call engineer has never seen this code before.`

  const userPrompt = `## Task Description
${ctx.ticketText}
${ctx.repoContext ? `\n## Repository Context\n${ctx.repoContext}` : ''}

## Phase 9: Rollback Strategy

### 9.1 Rollback Decision Criteria
What signals indicate an immediate rollback is required?
- Error rate threshold: ___ %
- Latency p99 threshold: ___ ms
- Business metric threshold (e.g., orders/min drops below ___): ___
- Time window to decide: ___ minutes after deploy

### 9.2 Is This Rollback Safe?
| Component | Rollback Safe? | Why / Why Not |
|-----------|---------------|---------------|
| Application code | ✅ Yes / ⚠️ Risky / 🔴 No | ... |
| Database migration | ...           | ... |
| Kafka schema change | ...          | ... |
| Feature flag | ...               | ... |

### 9.3 Rollback Runbook (Step-by-Step)
**Estimated rollback time: ___ minutes**

\`\`\`
Step 1: [WHO] Notify #incidents channel. Declare severity: SEV-[X].
Step 2: [DEPLOYER] Trigger rollback: <exact command or UI steps>
Step 3: [DB OWNER] If schema migration was applied: <exact steps>
Step 4: [KAFKA OWNER] If Kafka schema was changed: <exact steps>
Step 5: [ON-CALL] Verify rollback by checking: <metrics/dashboards>
Step 6: [LEAD] Confirm SLOs recovering. Close incident.
Step 7: [TEAM] Schedule post-mortem within 24h.
\`\`\`

### 9.4 Data Rollback
Is a data rollback required? (i.e., did we write data that needs to be reverted?)
- Estimated rows affected
- Can we reverse the writes? (UPDATE/DELETE vs. append-only)
- Point-in-time recovery option available?

### 9.5 Feature Flag Rollback
If using a feature flag: what is the flag name and how to disable it instantly?

### 9.6 Communication Template
\`\`\`
[INCIDENT UPDATE — T+X min]
Service: [name]
Impact: [what users see]
Status: Rolling back to [version/commit]
ETA to resolution: [X] minutes
Next update: [T+Y min]
\`\`\``

  const model = getProvider(ctx.aiProvider, ctx.aiModel)
  let content = ''

  const { textStream } = await streamText({
    model,
    system: systemPrompt,
    prompt: userPrompt,
    maxTokens: 2500,
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
