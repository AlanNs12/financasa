import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface PersonAvatarProps {
  user?: { name?: string; avatar_url?: string | null } | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

const AVATAR_COLORS = [
  'from-gray-500 to-gray-800',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-cyan-400 to-cyan-600',
  'from-rose-400 to-rose-600',
  'from-indigo-400 to-indigo-600',
]

function getAvatarColor(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
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
        className={cn('rounded-full object-cover shrink-0', SIZE_CLASSES[size], className)}
      />
    )
  }

  if (user?.name) {
    return (
      <div
        className={cn(
          'rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br shrink-0',
          SIZE_CLASSES[size],
          getAvatarColor(user.name),
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
        'rounded-full bg-secondary flex items-center justify-center shrink-0',
        SIZE_CLASSES[size],
        className
      )}
    >
      <User className={size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
    </div>
  )
}
