import type { PhaseContext, PhaseResult } from '@engineering-copilot/types'
import { streamText } from 'ai'
import { getProvider } from '../providers'

export const PHASE_INDEX = 1
export const PHASE_KEY = 'context' as const
export const PHASE_LABEL = 'Context & Scope Analysis'

/**
 * Phase 1: Context & Scope Analysis
 *
 * Restates the task in engineering terms, identifies the bounded context,
 * extracts acceptance criteria, and flags immediate ambiguities.
 *
 * CONTRIBUTING: To improve this phase, edit the system prompt below.
 * Each phase file exports a single `runPhase` function.
 */
export async function runPhase(ctx: PhaseContext): Promise<PhaseResult> {
  const startedAt = new Date()

  const systemPrompt = `You are a staff software engineer conducting a pre-implementation analysis.
Your role is to analyze a task BEFORE any code is written.
Output structured Markdown. Be precise, technical, and concise.
Do not write any code in this phase.`

  const userPrompt = `## Task Description
${ctx.ticketText}
${ctx.ticketUrl ? `\nTicket URL: ${ctx.ticketUrl}` : ''}
${ctx.repoContext ? `\n## Repository Context\n${ctx.repoContext}` : ''}

## Phase 1: Context & Scope Analysis

Perform the following analysis:

### 1.1 Task Restatement
Restate the task in precise engineering language. Strip product/PM language.
What is the system being asked to do?

### 1.2 Bounded Context
Which domain/service/module owns this change?
What are the system boundaries?

### 1.3 Acceptance Criteria (Technical)
List 5–10 concrete, testable acceptance criteria.
Format: "Given X, when Y, then Z."

### 1.4 Explicit Assumptions
List every assumption you are making to proceed with analysis.

### 1.5 Ambiguities & Questions
List open questions that must be answered before implementation begins.
Flag any that are blockers (🔴) vs. nice-to-know (🟡).

### 1.6 Out of Scope
Explicitly list what this change does NOT include.`

  const model = getProvider(ctx.aiProvider, ctx.aiModel)
  let content = ''

  const { textStream } = await streamText({
    model,
    system: systemPrompt,
    prompt: userPrompt,
    maxTokens: 2000,
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
