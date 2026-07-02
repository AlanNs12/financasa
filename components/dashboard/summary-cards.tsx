import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Clock } from 'lucide-react'

interface SummaryCardsProps {
  income: number
  expenses: number
  balance: number
  pendingBills: number
}

const cards = [
  {
    key: 'income' as const,
    label: 'Receita do mês',
    icon: TrendingUp,
    color: {
      bg: 'bg-success-50 dark:bg-success-500/10',
      icon: 'text-success-600 dark:text-success-400',
    },
  },
  {
    key: 'expenses' as const,
    label: 'Gastos do mês',
    icon: TrendingDown,
    color: {
      bg: 'bg-error-50 dark:bg-error-500/10',
      icon: 'text-error-600 dark:text-error-400',
    },
  },
  {
    key: 'balance' as const,
    label: 'Saldo',
    icon: Wallet,
    color: {
      bg: 'bg-brand-50 dark:bg-brand-500/10',
      icon: 'text-brand-600 dark:text-brand-400',
    },
  },
  {
    key: 'pendingBills' as const,
    label: 'Contas pendentes',
    icon: Clock,
    color: {
      bg: 'bg-warning-50 dark:bg-warning-500/10',
      icon: 'text-warning-600 dark:text-warning-400',
    },
  },
]

export function SummaryCards({
  income,
  expenses,
  balance,
  pendingBills,
}: SummaryCardsProps) {
  const values = { income, expenses, balance, pendingBills }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.key}
            className="rounded-2xl border border-border bg-card p-5
                       shadow-theme-xs hover:shadow-theme-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  card.color.bg
                )}
              >
                <Icon size={18} className={card.color.icon} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1 tabular-nums">
              {formatCurrency(values[card.key])}
            </p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        )
      })}
    </div>
  )
}
