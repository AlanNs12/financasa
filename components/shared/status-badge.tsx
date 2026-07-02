import { cn } from '@/lib/utils'

type BadgeVariant = 'light' | 'solid'
type BadgeStatus =
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'paused'

const CONFIG: Record<
  BadgeStatus,
  { label: string; light: string; solid: string; dot: string }
> = {
  paid: {
    label: 'Pago',
    dot: 'bg-success-500',
    light:
      'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400',
    solid: 'bg-success-500 text-white',
  },
  pending: {
    label: 'Pendente',
    dot: 'bg-warning-500',
    light:
      'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400',
    solid: 'bg-warning-500 text-white',
  },
  overdue: {
    label: 'Vencida',
    dot: 'bg-error-500',
    light:
      'bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400',
    solid: 'bg-error-500 text-white',
  },
  in_progress: {
    label: 'Em andamento',
    dot: 'bg-brand-500',
    light:
      'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400',
    solid: 'bg-brand-500 text-white',
  },
  completed: {
    label: 'Concluída',
    dot: 'bg-success-500',
    light:
      'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400',
    solid: 'bg-success-500 text-white',
  },
  cancelled: {
    label: 'Cancelada',
    dot: 'bg-muted-foreground',
    light: 'bg-muted text-muted-foreground',
    solid: 'bg-muted-foreground text-white',
  },
  paused: {
    label: 'Pausada',
    dot: 'bg-warning-500',
    light:
      'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400',
    solid: 'bg-warning-500 text-white',
  },
}

interface StatusBadgeProps {
  status: BadgeStatus
  variant?: BadgeVariant
  showDot?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({
  status,
  variant = 'light',
  showDot = false,
  size = 'sm',
  className,
}: StatusBadgeProps) {
  const cfg = CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        variant === 'light' ? cfg.light : cfg.solid,
        className
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      )}
      {cfg.label}
    </span>
  )
}
