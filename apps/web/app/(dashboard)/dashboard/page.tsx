import { auth } from '../../../auth'
import { redirect } from 'next/navigation'
import { prisma } from '@engineering-copilot/db'
import Link from 'next/link'
import { Plus, Clock, CheckCircle, AlertCircle, Loader2, FileText, ArrowRight } from 'lucide-react'

const STATUS_CONFIG = {
  ANALYZING: { label: 'Analyzing', icon: Loader2, color: 'text-blue-400', spin: true },
  AWAITING_APPROVAL: { label: 'Awaiting Approval', icon: Clock, color: 'text-amber-400', spin: false },
  GENERATING: { label: 'Generating', icon: Loader2, color: 'text-purple-400', spin: true },
  COMPLETE: { label: 'Complete', icon: CheckCircle, color: 'text-green-400', spin: false },
  FAILED: { label: 'Failed', icon: AlertCircle, color: 'text-red-400', spin: false },
} as const

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      status: true,
      aiProvider: true,
      aiModel: true,
      createdAt: true,
      _count: { select: { sections: true } },
    },
  })

  return (
    <main className="min-h-screen">
      {/* ── Header ── */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Your Reviews</h1>
          <p className="text-sm text-[--text-secondary]">{reviews.length} engineering reviews</p>
        </div>
        <Link href="/review/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Review
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {reviews.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <FileText className="w-12 h-12 text-[--text-muted] mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No reviews yet</h2>
            <p className="text-[--text-secondary] mb-6">Paste a ticket to run your first 10-phase analysis.</p>
            <Link href="/review/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Start a review
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              const cfg = STATUS_CONFIG[review.status]
              const Icon = cfg.icon
              return (
                <Link
                  key={review.id}
                  href={`/review/${review.id}`}
                  className="glass glass-hover rounded-xl p-5 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1.5 text-sm ${cfg.color}`}>
                      <Icon className={`w-4 h-4 ${cfg.spin ? 'animate-spin' : ''}`} />
                      <span>{cfg.label}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-[--brand-400] transition-colors">
                        {review.title}
                      </p>
                      <p className="text-xs text-[--text-muted] mt-0.5">
                        {review.aiProvider} · {review.aiModel} ·{' '}
                        {new Date(review.createdAt).toLocaleDateString()}
                        {review._count.sections > 0 && ` · ${review._count.sections} sections`}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[--text-muted] group-hover:text-[--brand-400] transition-colors" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
