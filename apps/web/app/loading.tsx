export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="space-y-3 w-full max-w-4xl px-6">
        {/* Header shimmer */}
        <div className="shimmer h-10 w-64 rounded-xl" />
        {/* Phase card shimmers */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shimmer h-16 rounded-xl" />
        ))}
      </div>
    </main>
  )
}
