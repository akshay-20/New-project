import type { PhaseContext, ImplementationOption, PhaseResult } from '@engineering-copilot/types'
import { generateObject } from 'ai'
import { getProvider } from './providers'
import { z } from 'zod'

const OptionSchema = z.object({
  options: z
    .array(
      z.object({
        optionIndex: z.number().int().min(1).max(3),
        title: z.string(),
        summary: z.string(),
        tradeoffs: z.object({
          pros: z.array(z.string()),
          cons: z.array(z.string()),
          effort: z.enum(['low', 'medium', 'high']),
          risk: z.enum(['low', 'medium', 'high']),
          estimatedDays: z.number().optional(),
        }),
      })
    )
    .min(2)
    .max(3),
})

/**
 * Generates 2–3 distinct implementation options based on all 10 phases.
 * Uses structured output (JSON mode) so options are always parseable.
 *
 * The engineer must select one option before code generation unlocks.
 */
export async function generateOptions(
  ctx: PhaseContext,
  phases: PhaseResult[]
): Promise<ImplementationOption[]> {
  const phaseSummary = phases
    .map((p) => `## Phase ${p.phaseIndex}: ${p.phaseLabel}\n${p.content}`)
    .join('\n\n---\n\n')

  const model = getProvider(ctx.aiProvider, ctx.aiModel)

  const { object } = await generateObject({
    model,
    schema: OptionSchema,
    system: `You are a staff engineer presenting implementation options.
Each option must be genuinely distinct — different architectural approaches, not just tweaks.
Options should represent: (1) the safest/slowest path, (2) the balanced path, (3) the fastest/riskiest path.`,
    prompt: `## Original Task
${ctx.ticketText}

## 10-Phase Analysis Summary
${phaseSummary}

Generate 2–3 distinct implementation options for this task.
Each option must have a clear title, a detailed summary, and honest tradeoffs.
Order options from safest to most aggressive.`,
    temperature: 0.4,
    maxTokens: 3000,
  })

  return object.options as ImplementationOption[]
}
