import { cn } from '@/lib/utils'

interface CategoryIconProps {
  category?: {
    icon?: string | null
    color?: string | null
    name?: string
  } | null
  icon?: string
  color?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  xs: 'w-7 h-7 text-sm rounded-lg',
  sm: 'w-9 h-9 text-base rounded-xl',
  md: 'w-11 h-11 text-lg rounded-xl',
  lg: 'w-13 h-13 text-2xl rounded-2xl',
}

export function CategoryIcon({
  category,
  icon,
  color,
  size = 'md',
  className,
}: CategoryIconProps) {
  const displayIcon =
    icon ?? category?.icon ?? '📦'
  const displayColor = color ?? category?.color ?? '#6b7280'

  return (
    <div
      className={cn(
        'flex items-center justify-center shrink-0 shadow-theme-xs',
        SIZE_CLASSES[size],
        className
      )}
      style={{ backgroundColor: `${displayColor}20` }}
    >
      <span role="img" aria-hidden="true">{displayIcon}</span>
    </div>
  )
}
