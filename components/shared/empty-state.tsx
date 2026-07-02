import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon | string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const iconContent =
    typeof icon === 'string' ? (
      <span className="text-3xl">{icon}</span>
    ) : (
      (() => {
        const Icon = icon
        return <Icon className="w-8 h-8 text-muted-foreground" />
      })()
    )

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 shadow-theme-xs">
        {iconContent}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
