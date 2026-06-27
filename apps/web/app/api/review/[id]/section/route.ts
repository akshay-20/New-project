import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { prisma } from '@engineering-copilot/db'
import { z } from 'zod'

const Schema = z.object({
  sectionIndex: z.number().int().min(1).max(28),
  userContent: z.string().min(1),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const review = await prisma.review.findUnique({ where: { id: params.id } })
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!review.isPublic && review.userId !== session?.user?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await prisma.reviewSection.update({
    where: {
      reviewId_sectionIndex: {
        reviewId: params.id,
        sectionIndex: parsed.data.sectionIndex,
      },
    },
    data: {
      userContent: parsed.data.userContent,
      editedByUser: true,
      editedAt: new Date(),
    },
  })

  return NextResponse.json(updated)
}
