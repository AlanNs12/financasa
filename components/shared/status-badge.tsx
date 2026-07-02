import { cn } from '@/lib/utils'
import { Check, Clock, AlertTriangle, X, Loader2, Pause } from 'lucide-react'

interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'overdue' | 'in_progress' | 'completed' | 'cancelled' | 'paused'
  className?: string
}

const statusConfig = {
  paid: {
    icon: Check,
    label: 'Pago',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  },
  pending: {
    icon: Clock,
    label: 'Pendente',
    className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  },
  overdue: {
    icon: AlertTriangle,
    label: 'Atrasado',
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  },
  in_progress: {
    icon: Loader2,
    label: 'Em progresso',
    className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  completed: {
    icon: Check,
    label: 'Concluída',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  },
  cancelled: {
    icon: X,
    label: 'Cancelada',
    className: 'bg-secondary text-muted-foreground border-border',
  },
  paused: {
    icon: Pause,
    label: 'Pausada',
    className: 'bg-secondary text-muted-foreground border-border',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}
