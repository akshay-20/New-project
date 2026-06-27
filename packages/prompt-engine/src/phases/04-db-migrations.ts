import type { PhaseContext, PhaseResult } from '@engineering-copilot/types'
import { streamText } from 'ai'
import { getProvider } from '../providers'

export const PHASE_INDEX = 4
export const PHASE_KEY = 'db-migrations' as const
export const PHASE_LABEL = 'Database & Migration Strategy'

/**
 * Phase 4: Database & Migration Strategy
 *
 * Analyzes every schema change required, produces forward and backward
 * migration pseudocode, and flags data migration risks.
 */
export async function runPhase(ctx: PhaseContext): Promise<PhaseResult> {
  const startedAt = new Date()

  const systemPrompt = `You are a staff database engineer analyzing schema changes before implementation.
Produce precise DDL pseudocode (not dialect-specific unless context is clear).
Always consider zero-downtime migration strategies (expand-contract pattern).`

  const userPrompt = `## Task Description
${ctx.ticketText}
${ctx.repoContext ? `\n## Repository Context\n${ctx.repoContext}` : ''}

## Phase 4: Database & Migration Strategy

### 4.1 Schema Changes Required
List every table, column, index, constraint, or view that needs to change.

For each change:
- Type: ADD COLUMN / DROP COLUMN / MODIFY COLUMN / ADD INDEX / ADD TABLE / etc.
- Table name and column details
- Nullable? Default value? Backfill needed?

### 4.2 Forward Migration (pseudocode)
\`\`\`sql
-- Migration: [description]
-- Estimated rows affected: [N]
-- Estimated duration: [X minutes]
-- Lock required: [table-level | row-level | none]

[DDL statements]
\`\`\`

### 4.3 Backward Migration / Rollback DDL
\`\`\`sql
-- Rollback: [description]
[DDL statements]
\`\`\`

### 4.4 Zero-Downtime Strategy (Expand–Contract)
Is this migration safe to run against a live production database?
- Expand phase: What can be added without breaking current code?
- Migrate phase: What data needs to be backfilled?
- Contract phase: What can be removed only after all callers are updated?

### 4.5 Data Migration Risks
- Row count estimates and migration duration
- Lock escalation risk
- Replication lag impact
- Any data loss scenarios?

### 4.6 Indexes & Query Performance
What indexes are added, removed, or changed?
Any query plans that will regress? Identify queries to benchmark before/after.`

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
