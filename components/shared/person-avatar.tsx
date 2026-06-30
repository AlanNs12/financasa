import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface PersonAvatarProps {
  user?: { name?: string; avatar_url?: string | null } | null
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
}

export function PersonAvatar({ user, size = 'md', className }: PersonAvatarProps) {
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name || ''}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  if (user?.name) {
    return (
      <div
        className={cn(
          'rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600',
          sizeClasses[size],
          className
        )}
      >
        {initials}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gray-200 flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      <User className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
    </div>
  )
}
