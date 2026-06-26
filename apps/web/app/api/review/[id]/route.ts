import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../auth'
import { prisma } from '@engineering-copilot/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: {
      phases: { orderBy: { phaseIndex: 'asc' } },
      options: { orderBy: { optionIndex: 'asc' } },
      sections: { orderBy: { sectionIndex: 'asc' } },
    },
  })

  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!review.isPublic && review.userId !== session?.user?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(review)
}
