import { cn } from '@/lib/utils'

interface SkeletonProps {
  variant?: 'card' | 'list' | 'chart' | 'text'
  className?: string
}

export function LoadingSkeleton({ variant = 'text', className }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn('bg-white rounded-2xl border border-gray-100 p-6 animate-pulse', className)}>
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
        <div className="h-8 bg-gray-100 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3 animate-pulse', className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
            <div className="h-4 bg-gray-100 rounded w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'chart') {
    return (
      <div className={cn('bg-white rounded-2xl border border-gray-100 p-6 animate-pulse', className)}>
        <div className="h-4 bg-gray-100 rounded w-1/4 mb-6" />
        <div className="h-48 bg-gray-100 rounded" />
      </div>
    )
  }

  return <div className={cn('h-4 bg-gray-100 rounded animate-pulse', className)} />
}
