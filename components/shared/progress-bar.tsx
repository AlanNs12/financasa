import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getBarColor(percentage: number): string {
  if (percentage > 90) return 'bg-red-500'
  if (percentage >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

export function ProgressBar({ value, max, showLabel = false, size = 'md', className }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-4' : 'h-2.5'

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', heightClass)}>
        <div
          className={cn('rounded-full transition-all duration-500', heightClass, getBarColor(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
