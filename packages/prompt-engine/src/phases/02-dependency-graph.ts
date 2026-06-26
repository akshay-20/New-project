import type { PhaseContext, PhaseResult } from '@engineering-copilot/types'
import { streamText } from 'ai'
import { getProvider } from '../providers'

export const PHASE_INDEX = 2
export const PHASE_KEY = 'dependency-graph' as const
export const PHASE_LABEL = 'Dependency Graph'

/**
 * Phase 2: Dependency Graph
 *
 * Maps all services, packages, libraries, and infrastructure components
 * touched by this change. Produces a text-based dependency graph and
 * identifies which dependencies are read-only vs. write path.
 */
export async function runPhase(ctx: PhaseContext): Promise<PhaseResult> {
  const startedAt = new Date()
  const phase1Summary = ctx.previousPhases.find((p) => p.phaseKey === 'context')?.content ?? ''

  const systemPrompt = `You are a staff software engineer conducting dependency analysis.
Output structured Markdown with ASCII dependency graphs where helpful.
Do not write any code. Focus on architecture and system topology.`

  const userPrompt = `## Task Description
${ctx.ticketText}
${ctx.repoContext ? `\n## Repository Context\n${ctx.repoContext}` : ''}

## Phase 1 Summary (Context)
${phase1Summary}

## Phase 2: Dependency Graph

### 2.1 Direct Dependencies
List every service, package, library, or external system this change directly touches.
For each: name, type (service/lib/infra/external), and nature of coupling (read/write/event).

### 2.2 Transitive Dependencies (1 hop)
What depends ON the code being changed? Who calls it?
What does the changed code depend ON?

### 2.3 Dependency Graph (ASCII)
Draw a text-based dependency graph showing the relationships.
Use arrows: A --> B means A depends on B.
Use [SVC] for services, [LIB] for libraries, [DB] for databases, [Q] for queues.

Example format:
\`\`\`
[SVC: api-gateway] --> [SVC: user-service] --> [DB: users-pg]
                                            --> [Q: user-events-kafka]
\`\`\`

### 2.4 Shared Libraries at Risk
Identify any shared libraries or utilities this change modifies.
Who else uses them? What is the blast radius?

### 2.5 Version Constraints
Are there any version pinning issues, peer dependency conflicts, or
API version mismatches to be aware of?`

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
