import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../auth'
import { prisma } from '@engineering-copilot/db'
import { inngest } from '../../../lib/inngest'
import { z } from 'zod'

const Schema = z.object({
  reviewId: z.string(),
  selectedOption: z.number().int().min(1).max(3),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { reviewId, selectedOption } = parsed.data

  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!review.isPublic && review.userId !== session?.user?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Send Inngest event to wake up the waiting function
  await inngest.send({
    name: 'review/option-selected',
    data: { reviewId, selectedOption },
  })

  return NextResponse.json({ ok: true })
}
