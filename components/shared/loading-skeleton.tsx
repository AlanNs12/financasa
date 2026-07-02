export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-40 rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-48 rounded-2xl bg-muted" />
        <div className="h-48 rounded-2xl bg-muted" />
      </div>
    </div>
  )
}
