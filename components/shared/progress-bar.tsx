import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
  invertColors?: boolean
}

function getBarColor(percentage: number, invert: boolean): string {
  if (invert) {
    if (percentage >= 90) return 'var(--progress-safe)'
    if (percentage >= 50) return 'var(--progress-warning)'
    return 'var(--progress-danger)'
  }
  if (percentage <= 70) return 'var(--progress-safe)'
  if (percentage <= 90) return 'var(--progress-warning)'
  return 'var(--progress-danger)'
}

export function ProgressBar({
  value,
  max,
  showLabel = false,
  size = 'sm',
  className,
  invertColors = false,
}: ProgressBarProps) {
  const pct =
    max !== undefined && max > 0
      ? Math.min((value / max) * 100, 100)
      : Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-muted overflow-hidden',
          size === 'sm' ? 'h-1.5' : 'h-2.5'
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: getBarColor(pct, invertColors),
          }}
        />
      </div>
    </div>
  )
}
