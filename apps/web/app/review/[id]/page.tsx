import { notFound } from 'next/navigation'
import { prisma } from '@engineering-copilot/db'
import { ReviewDetailClient } from './ReviewDetailClient'

interface ReviewPageProps {
  params: { id: string }
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: {
      phases: { orderBy: { phaseIndex: 'asc' } },
      options: { orderBy: { optionIndex: 'asc' } },
      sections: { orderBy: { sectionIndex: 'asc' } },
    },
  })

  if (!review) notFound()

  return <ReviewDetailClient review={review} />
}

export async function generateMetadata({ params }: ReviewPageProps) {
  const review = await prisma.review.findUnique({
    where: { id: params.id },
    select: { title: true },
  })
  return {
    title: review ? `${review.title} — Engineering Copilot` : 'Review — Engineering Copilot',
  }
}
