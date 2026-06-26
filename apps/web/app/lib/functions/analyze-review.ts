import { inngest } from '../../lib/inngest'
import { prisma } from '@engineering-copilot/db'
import { runAllPhases, generateOptions, generateSections } from '@engineering-copilot/prompt-engine'
import type { AIProvider } from '@engineering-copilot/types'

/**
 * Inngest function: orchestrates the full review pipeline.
 *
 * Steps:
 * 1. Run all 10 analysis phases (each phase saved as it completes)
 * 2. Generate 2–3 implementation options
 * 3. Wait for engineer to select an option (event: review/option-selected)
 * 4. Generate all 28 review sections
 * 5. Mark review as COMPLETE
 */
export const analyzeReview = inngest.createFunction(
  {
    id: 'analyze-review',
    name: 'Analyze Review',
    retries: 2,
    concurrency: { limit: 10 },
  },
  { event: 'review/analyze' },
  async ({ event, step }) => {
    const { reviewId } = event.data as { reviewId: string }

    // ── Load review ──
    const review = await step.run('load-review', async () => {
      return prisma.review.findUniqueOrThrow({
        where: { id: reviewId },
      })
    })

    const ctx = {
      reviewId,
      ticketText: review.ticketText ?? review.ticketUrl ?? '',
      ...(review.ticketUrl !== null && { ticketUrl: review.ticketUrl }),
      ...(review.repoContext !== null && { repoContext: review.repoContext }),
      aiProvider: review.aiProvider as AIProvider,
      aiModel: review.aiModel,
      previousPhases: [] as never[],
    }

    // ── Run all 10 phases ──
    const phases = await step.run('run-phases', async () => {
      return runAllPhases(ctx, async (phase) => {
        await prisma.reviewPhase.upsert({
          where: { reviewId_phaseIndex: { reviewId, phaseIndex: phase.phaseIndex } },
          create: {
            reviewId,
            phaseIndex: phase.phaseIndex,
            phaseKey: phase.phaseKey,
            phaseLabel: phase.phaseLabel,
            content: phase.content,
            status: phase.status,
            startedAt: phase.startedAt,
            completedAt: phase.completedAt ?? null,
          },
          update: {
            content: phase.content,
            status: phase.status,
            completedAt: phase.completedAt ?? null,
          },
        })
      })
    })

    // ── Generate options ──
    const options = await step.run('generate-options', async () => {
      return generateOptions(ctx, phases)
    })

    await step.run('save-options', async () => {
      await prisma.$transaction(
        options.map((opt) =>
          prisma.reviewOption.upsert({
            where: { reviewId_optionIndex: { reviewId, optionIndex: opt.optionIndex } },
            create: { reviewId, ...opt },
            update: { ...opt },
          })
        )
      )
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: 'AWAITING_APPROVAL' },
      })
    })

    // ── Wait for engineer to pick an option ──
    const selectionEvent = await step.waitForEvent('wait-for-option-selection', {
      event: 'review/option-selected',
      match: 'data.reviewId',
      timeout: '7d', // engineer has 7 days to pick
    })

    if (!selectionEvent) {
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: 'FAILED' },
      })
      return { status: 'timed-out' }
    }

    const selectedOptionIndex = selectionEvent.data.selectedOption as number
    const selectedOption = options.find((o) => o.optionIndex === selectedOptionIndex)!

    await step.run('save-selection', async () => {
      await prisma.review.update({
        where: { id: reviewId },
        data: { selectedOption: selectedOptionIndex, status: 'GENERATING' },
      })
    })

    // ── Generate 28 sections ──
    await step.run('generate-sections', async () => {
      const generator = generateSections(ctx, phases, selectedOption)
      for await (const section of generator) {
        await prisma.reviewSection.upsert({
          where: { reviewId_sectionIndex: { reviewId, sectionIndex: section.sectionIndex } },
          create: { reviewId, ...section },
          update: { aiContent: section.aiContent },
        })
      }
    })

    // ── Mark complete ──
    await step.run('mark-complete', async () => {
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: 'COMPLETE' },
      })
    })

    return { status: 'complete', reviewId }
  }
)
