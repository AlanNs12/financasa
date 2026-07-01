import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { CategoryIcon } from '@/components/shared/category-icon'
import { MoneyDisplay } from '@/components/shared/money-display'

interface RecentTransaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  category: {
    name: string
    icon: string
    color: string
  } | null
}

interface RecentTransactionsProps {
  transactions: RecentTransaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">Últimas transações</h2>
        <Link
          href="/transacoes"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todas
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Nenhuma transação este mês</p>
      ) : (
        <div className="space-y-1">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <CategoryIcon category={tx.category} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {tx.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{tx.category?.name}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                </div>
              </div>
              <MoneyDisplay
                amount={tx.amount}
                type={tx.type === 'INCOME' ? 'income' : 'expense'}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
