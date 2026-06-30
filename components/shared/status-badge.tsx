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
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  pending: {
    icon: Clock,
    label: 'Pendente',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  overdue: {
    icon: AlertTriangle,
    label: 'Atrasado',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  in_progress: {
    icon: Loader2,
    label: 'Em progresso',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  completed: {
    icon: Check,
    label: 'Concluída',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  cancelled: {
    icon: X,
    label: 'Cancelada',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
  paused: {
    icon: Pause,
    label: 'Pausada',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
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
