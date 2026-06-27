'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen gradient-hero flex items-center justify-center text-center px-6">
      <div className="glass rounded-2xl p-10 max-w-md w-full space-y-5">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-[--text-secondary]">
          {error.message || 'An unexpected error occurred.'}
          {error.digest && (
            <span className="block mt-1 font-mono text-xs text-[--text-muted]">
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <button onClick={reset} className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </main>
  )
}
