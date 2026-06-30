import Link from 'next/link'
import { AlertTriangle, ChevronRight, Receipt, Target, CreditCard } from 'lucide-react'
import type { ActiveAlert, AlertType } from '@/lib/db/queries/alerts'

interface AlertsPanelProps {
  alerts: ActiveAlert[]
}

const TYPE_ICONS: Record<AlertType, typeof Receipt> = {
  bill: Receipt,
  budget: Target,
  credit_card: CreditCard,
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) return null

  const visible = alerts.slice(0, 3)
  const remaining = alerts.length - visible.length

  return (
    <div className="space-y-2">
      {visible.map((alert) => {
        const isDanger = alert.severity === 'danger'
        const Icon = TYPE_ICONS[alert.type]
        const colorClass = isDanger
          ? 'bg-red-50 border-red-200'
          : 'bg-amber-50 border-amber-200'
        const textClass = isDanger ? 'text-red-700' : 'text-amber-700'
        const iconBg = isDanger ? 'bg-red-100' : 'bg-amber-100'

        return (
          <Link
            key={alert.id}
            href={alert.href}
            className={`flex items-center gap-3 p-3 rounded-xl border ${colorClass} hover:opacity-80 transition-opacity`}
          >
            <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${textClass}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className={`w-3.5 h-3.5 ${textClass} shrink-0`} />
                <p className={`text-sm font-medium ${textClass} truncate`}>
                  {alert.title}
                </p>
              </div>
              <p className="text-xs text-gray-600 truncate mt-0.5">
                {alert.description}
              </p>
            </div>
            <ChevronRight className={`w-4 h-4 ${textClass} shrink-0`} />
          </Link>
        )
      })}

      {remaining > 0 && (
        <Link
          href="/contas"
          className="block text-center text-xs text-gray-500 hover:text-gray-900 py-1.5 transition-colors"
        >
          Ver mais {remaining} {remaining === 1 ? 'alerta' : 'alertas'}
        </Link>
      )}
    </div>
  )
}
