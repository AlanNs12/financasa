import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  invertColors?: boolean
}

function getBarColor(percentage: number, invert: boolean): string {
  if (invert) {
    if (percentage >= 90) return 'var(--progress-safe)'
    if (percentage >= 70) return 'var(--progress-warning)'
    return 'var(--progress-danger)'
  }
  if (percentage > 90) return 'var(--progress-danger)'
  if (percentage >= 70) return 'var(--progress-warning)'
  return 'var(--progress-safe)'
}

export function ProgressBar({ value, max, showLabel = false, size = 'md', className, invertColors = false }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-4' : 'h-2.5'

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={cn('w-full bg-secondary rounded-full overflow-hidden', heightClass)}>
        <div
          className={cn('rounded-full transition-all duration-500', heightClass)}
          style={{ width: `${percentage}%`, backgroundColor: getBarColor(percentage, invertColors) }}
        />
      </div>
    </div>
  )
}
