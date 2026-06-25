import { cn } from '@/lib/utils'

interface CategoryIconProps {
  category: {
    icon?: string | null
    color?: string | null
    name?: string
  } | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
}

export function CategoryIcon({ category, size = 'md', className }: CategoryIconProps) {
  return (
    <div
      className={cn(
        'rounded-xl flex items-center justify-center font-medium shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: `${category?.color || '#6b7280'}20`, color: category?.color || '#6b7280' }}
    >
      {category?.icon || '📦'}
    </div>
  )
}
