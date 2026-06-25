import { formatCurrency } from '@/lib/format'
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react'

interface SummaryCardsProps {
  income: number
  expenses: number
  balance: number
  pendingBills: number
}

const cards = [
  { key: 'income' as const, label: 'Receita do mês', icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-50' },
  { key: 'expenses' as const, label: 'Gastos do mês', icon: TrendingDown, color: 'text-red-500', bgColor: 'bg-red-50' },
  { key: 'balance' as const, label: 'Saldo', icon: Wallet, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { key: 'pendingBills' as const, label: 'Contas pendentes', icon: AlertCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
]

export function SummaryCards({ income, expenses, balance, pendingBills }: SummaryCardsProps) {
  const values = { income, expenses, balance, pendingBills }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.key}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
          >
            <div className={`w-8 h-8 rounded-lg ${card.bgColor} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className="text-sm font-bold text-gray-900 tabular-nums">
              {formatCurrency(values[card.key])}
            </p>
          </div>
        )
      })}
    </div>
  )
}
