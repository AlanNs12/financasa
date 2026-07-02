import { cn } from '@/lib/utils'

interface PageCardProps {
  title?: string
  desc?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function PageCard({
  title,
  desc,
  action,
  children,
  className,
  noPadding,
}: PageCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card shadow-theme-xs',
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-border">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-foreground">
                {title}
              </h3>
            )}
            {desc && (
              <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  )
}
