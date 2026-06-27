import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen gradient-hero flex items-center justify-center text-center px-6">
      <div>
        <p className="text-8xl font-bold gradient-text mb-4">404</p>
        <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
        <p className="text-[--text-secondary] mb-8">
          This page doesn&apos;t exist or was moved.
        </p>
        <Link href="/" className="btn-primary px-6 py-3">
          Back to home
        </Link>
      </div>
    </main>
  )
}