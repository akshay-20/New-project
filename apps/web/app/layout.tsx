import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { auth } from '../../auth'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Engineering Copilot — Pre-Coding Analysis for Staff Engineers',
  description:
    'The AI-powered pre-coding layer that forces structured analysis before touching a line of code. Dependency graphs, migration strategies, rollback plans, and more.',
  keywords: ['engineering', 'code review', 'AI', 'developer tools', 'SRE', 'software engineering'],
  openGraph: {
    title: 'Engineering Copilot',
    description: 'AI forces structured analysis before code generation.',
    type: 'website',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-surface-900 text-white antialiased`}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  )
}
