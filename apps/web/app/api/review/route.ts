import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../auth'
import { prisma } from '@engineering-copilot/db'
import { inngest } from '../../../lib/inngest'
import { z } from 'zod'

const CreateReviewSchema = z.object({
  ticketText: z.string().min(10).optional(),
  ticketUrl: z.string().url().optional(),
  repoContext: z.string().optional(),
  aiProvider: z.enum(['anthropic', 'openai', 'google', 'ollama']).default('anthropic'),
  aiModel: z.string().default('claude-opus-4-5'),
}).refine((d) => d.ticketText || d.ticketUrl, {
  message: 'Either ticketText or ticketUrl is required',
})

export async function POST(req: NextRequest) {
  const session = await auth()

  // Support demo mode (no auth required)
  const isDemo = req.nextUrl.searchParams.get('demo') === '1'
  if (!session?.user?.id && !isDemo) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = CreateReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { ticketText, ticketUrl, repoContext, aiProvider, aiModel } = parsed.data

  // Derive a title from the ticket content
  const title = ticketText
    ? ticketText.slice(0, 80).replace(/\n/g, ' ').trim() + (ticketText.length > 80 ? '…' : '')
    : ticketUrl ?? 'Untitled Review'

  const userId = session?.user?.id ?? 'demo-user'

  const review = await prisma.review.create({
    data: {
      userId,
      title,
      ticketText,
      ticketUrl,
      repoContext,
      aiProvider,
      aiModel,
      isPublic: isDemo,
      status: 'ANALYZING',
    },
  })

  // Kick off background job
  await inngest.send({
    name: 'review/analyze',
    data: { reviewId: review.id },
  })

  return NextResponse.json({ reviewId: review.id }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(reviews)
}
