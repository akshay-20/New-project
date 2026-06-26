import type { PhaseContext, PhaseResult } from '@engineering-copilot/types'
import { streamText } from 'ai'
import { getProvider } from '../providers'

export const PHASE_INDEX = 7
export const PHASE_KEY = 'risk-register' as const
export const PHASE_LABEL = 'Risk Register'

/**
 * Phase 7: Risk Register
 *
 * Enumerates all technical, operational, and delivery risks by severity.
 * Each risk gets a mitigation strategy and an owner suggestion.
 */
export async function runPhase(ctx: PhaseContext): Promise<PhaseResult> {
  const startedAt = new Date()

  const systemPrompt = `You are a staff engineer building a risk register for a production change.
Classify risks by severity: P0 (showstopper), P1 (high), P2 (medium), P3 (low).
Every risk must have a concrete mitigation, not just "add monitoring".`

  const userPrompt = `## Task Description
${ctx.ticketText}
${ctx.repoContext ? `\n## Repository Context\n${ctx.repoContext}` : ''}

## Phase 7: Risk Register

### 7.1 Risk Summary
| ID | Risk Description | Severity | Likelihood | Mitigation | Owner |
|----|-----------------|----------|------------|------------|-------|
| R1 | ...             | P0/P1/P2/P3 | High/Med/Low | ... | TBD |

### 7.2 P0 Risks (Showstoppers — must resolve before proceeding)
For each P0 risk, provide:
- **Root cause**: Why could this happen?
- **Impact**: What breaks? Who is affected?
- **Detection**: How would we know it happened?
- **Mitigation**: Exact steps to prevent or respond.
- **Acceptance criteria**: What evidence confirms this risk is resolved?

### 7.3 P1 Risks (High — resolve before release)
(same format as P0)

### 7.4 P2 Risks (Medium — resolve in follow-up sprint)
(same format, briefer)

### 7.5 Technical Debt Risks
Does this change introduce or worsen existing technical debt?
What is the compounding risk if the debt is not paid down?

### 7.6 Risk Matrix
Plot risks by Likelihood (x-axis) vs. Impact (y-axis):
\`\`\`
HIGH IMPACT |  [R3]   |  [R1]  |
            |         |        |
 LOW IMPACT |  [R4]   |  [R2]  |
            | LOW LH  | HIGH LH|
\`\`\``

  const model = getProvider(ctx.aiProvider, ctx.aiModel)
  let content = ''

  const { textStream } = await streamText({
    model,
    system: systemPrompt,
    prompt: userPrompt,
    maxTokens: 2500,
    temperature: 0.3,
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
