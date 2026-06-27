import Link from 'next/link'
import { auth } from '../auth'
import { ArrowRight, Zap, Shield, FileCode2, GitBranch, ChevronRight } from 'lucide-react'

const PHASES = [
  { icon: '🔍', label: 'Context & Scope' },
  { icon: '🕸️', label: 'Dependency Graph' },
  { icon: '📞', label: 'Caller Impact' },
  { icon: '🗄️', label: 'DB Migrations' },
  { icon: '⚡', label: 'Kafka & Infra' },
  { icon: '🔐', label: 'IAM & Secrets' },
  { icon: '⚠️', label: 'Risk Register' },
  { icon: '📊', label: 'SLO Impact' },
  { icon: '⏪', label: 'Rollback Strategy' },
  { icon: '🚦', label: 'Canary Plan' },
]

export default async function HomePage() {
  const session = await auth()

  return (
    <main className="min-h-screen gradient-hero">
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Engineering Copilot</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/demo" className="text-sm text-[--text-secondary] hover:text-white transition-colors">
            Live Demo
          </Link>
          <Link href="https://github.com/your-org/engineering-copilot" className="text-sm text-[--text-secondary] hover:text-white transition-colors">
            GitHub
          </Link>
          {session ? (
            <Link href="/dashboard" className="btn-primary text-sm">
              Dashboard <ArrowRight className="inline w-4 h-4 ml-1" />
            </Link>
          ) : (
            <Link href="/login" className="btn-primary text-sm">
              Sign in with GitHub
            </Link>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-[--text-secondary] mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 pulse-ring" />
          Open source · MIT license
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          <span className="gradient-text">Think like a staff engineer</span>
          <br />
          before writing a line of code
        </h1>

        <p className="text-xl text-[--text-secondary] max-w-2xl mx-auto mb-10">
          Paste a Jira ticket. Watch 10 analysis phases stream live — dependency graphs, migration
          strategies, rollback plans, SLOs. Approve a plan. <em>Then</em> generate code.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/demo" className="btn-primary text-base px-6 py-3">
            Try the live demo <ArrowRight className="inline w-5 h-5 ml-1" />
          </Link>
          <Link href="/login" className="btn-ghost text-base px-6 py-3">
            Sign in to save reviews
          </Link>
        </div>
      </section>

      {/* ── 10 Phases ── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-center text-2xl font-semibold mb-2">10-phase structured analysis</h2>
        <p className="text-center text-[--text-secondary] mb-10">
          Every analysis runs all 10 phases. Each builds on the last.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PHASES.map((phase, i) => (
            <div
              key={i}
              className="glass glass-hover rounded-xl p-4 flex flex-col items-center text-center gap-2 animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="text-2xl">{phase.icon}</span>
              <span className="text-xs text-[--text-secondary] font-medium">{i + 1}. {phase.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature callouts ── */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        {[
          {
            icon: <FileCode2 className="w-5 h-5" />,
            title: '28-section review doc',
            desc: 'Every review exports to Markdown, PDF, or directly into Jira/ADO as a comment.',
          },
          {
            icon: <GitBranch className="w-5 h-5" />,
            title: 'Provider agnostic',
            desc: 'Claude, GPT-4o, Gemini, or local Ollama. One env var to switch.',
          },
          {
            icon: <Shield className="w-5 h-5" />,
            title: 'Approve before code',
            desc: 'Code generation is gated. Engineers pick one of 3 options. Only then does code unlock.',
          },
        ].map((f, i) => (
          <div key={i} className="glass glass-hover rounded-2xl p-6 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center mb-4 text-white">
              {f.icon}
            </div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-[--text-secondary]">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-[--text-muted]">
        Engineering Copilot is open source under the MIT license. Built with Next.js, Vercel AI SDK, and Prisma.
        <div className="mt-2">
          <Link href="/demo" className="text-[--brand-400] hover:underline mr-4">Live Demo</Link>
          <Link href="https://github.com/your-org/engineering-copilot" className="text-[--brand-400] hover:underline mr-4">GitHub</Link>
          <Link href="/docs" className="text-[--brand-400] hover:underline">Docs</Link>
        </div>
      </footer>
    </main>
  )
}
