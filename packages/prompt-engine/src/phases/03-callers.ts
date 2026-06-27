import type { PhaseContext, PhaseResult } from '@engineering-copilot/types'
import { streamText } from 'ai'
import { getProvider } from '../providers'

export const PHASE_INDEX = 3
export const PHASE_KEY = 'callers' as const
export const PHASE_LABEL = 'Caller Impact Analysis'

/**
 * Phase 3: Caller Impact Analysis
 *
 * Identifies every consumer (internal and external) of the APIs, functions,
 * events, or data contracts being changed. Assesses breaking change risk.
 */
export async function runPhase(ctx: PhaseContext): Promise<PhaseResult> {
  const startedAt = new Date()

  const systemPrompt = `You are a staff software engineer analyzing the blast radius of API and interface changes.
Be precise about breaking vs. non-breaking changes. Output structured Markdown.`

  const userPrompt = `## Task Description
${ctx.ticketText}
${ctx.repoContext ? `\n## Repository Context\n${ctx.repoContext}` : ''}

## Phase 3: Caller Impact Analysis

### 3.1 API Surface Being Changed
List every API endpoint, function signature, event schema, or data contract
that this change modifies, adds, or removes.

For each:
- Current signature / schema
- Proposed change
- Breaking: Yes / No / Potentially

### 3.2 Known Callers
For each API surface item above, list known callers:
- Internal services (with team ownership if known)
- External clients (mobile apps, third-party integrators, public API consumers)
- Batch jobs or scheduled tasks

### 3.3 Breaking Change Assessment
| Change | Breaking? | Callers Affected | Migration Required? |
|--------|-----------|-----------------|---------------------|
| ...    | ...       | ...             | ...                 |

### 3.4 Backward Compatibility Strategy
For each breaking change:
- Can we version the API? (v1 → v2)
- Can we use an adapter / shim pattern?
- What is the deprecation timeline?
- Who needs to be notified?

### 3.5 Contract Testing Gaps
What contract tests exist today? What new contract tests are needed?
Which callers have no tests and represent silent risk?`

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
