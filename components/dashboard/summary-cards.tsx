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
      bg: 'bg-[#dcfce7] dark:bg-[#22c55e]/15',
      icon: 'text-[#16a34a] dark:text-[#4ade80]',
    },
  },
  {
    key: 'expenses' as const,
    label: 'Gastos do mês',
    icon: TrendingDown,
    color: {
      bg: 'bg-[#fee2e2] dark:bg-[#ef4444]/15',
      icon: 'text-[#dc2626] dark:text-[#f87171]',
    },
  },
  {
    key: 'balance' as const,
    label: 'Saldo',
    icon: Wallet,
    color: {
      bg: 'bg-[#dbeafe] dark:bg-[#3b82f6]/15',
      icon: 'text-[#2563eb] dark:text-[#60a5fa]',
    },
  },
  {
    key: 'pendingBills' as const,
    label: 'Contas pendentes',
    icon: Clock,
    color: {
      bg: 'bg-[#fef9c3] dark:bg-[#f59e0b]/15',
      icon: 'text-[#d97706] dark:text-[#fbbf24]',
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
