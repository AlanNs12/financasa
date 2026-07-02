import Link from 'next/link'
import { AlertTriangle, Receipt, Target, CreditCard } from 'lucide-react'
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

        return (
          <Link
            key={alert.id}
            href={alert.href}
            className="flex gap-3 p-3.5 rounded-xl border transition-colors hover:opacity-80"
            style={{
              borderColor: isDanger
                ? 'var(--error-500)'
                : 'var(--warning-500)',
              borderLeftWidth: '3px',
              backgroundColor: isDanger
                ? 'var(--error-50)'
                : 'var(--warning-50)',
            }}
          >
            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0"
              style={{ color: isDanger ? 'var(--error-500)' : 'var(--warning-500)' }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Icon
                  size={14}
                  className="shrink-0"
                  style={{ color: isDanger ? 'var(--error-600)' : 'var(--warning-600)' }}
                />
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: isDanger ? 'var(--error-700)' : 'var(--warning-600)' }}
                >
                  {alert.title}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {alert.description}
              </p>
            </div>
          </Link>
        )
      })}

      {remaining > 0 && (
        <Link
          href="/contas"
          className="block text-center text-xs text-muted-foreground hover:text-foreground py-1.5 transition-colors"
        >
          Ver mais {remaining} {remaining === 1 ? 'alerta' : 'alertas'}
        </Link>
      )}
    </div>
  )
}
