'use client'

import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/format'
import { CategoryIcon } from '@/components/shared/category-icon'
import { MoneyDisplay } from '@/components/shared/money-display'
import { PersonAvatar } from '@/components/shared/person-avatar'
import { Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionItem {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  category: { name: string; icon: string; color: string } | null
  user?: { name: string } | null
  payment_method: string
}

interface TransactionListProps {
  transactions: TransactionItem[]
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  CASH: 'Dinheiro',
  BANK_TRANSFER: 'Transferência',
  BOLETO: 'Boleto',
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = transactions.filter((t) => {
    if (filter === 'ALL') return true
    return t.type === filter
  })

  const groupedByDate = filtered.reduce(
    (acc, tx) => {
      const dateKey = formatDate(tx.date)
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(tx)
      return acc
    },
    {} as Record<string, TransactionItem[]>
  )

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          Filtrar
        </button>

        <div className="flex bg-white rounded-lg border border-gray-200 p-0.5">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              {f === 'ALL' ? 'Todos' : f === 'INCOME' ? 'Entradas' : 'Saídas'}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(groupedByDate).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">Nenhuma transação encontrada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, txs]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                {date}
              </h3>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {txs.map((tx, idx) => (
                  <div
                    key={tx.id}
                    className={cn(
                      'flex items-center gap-3 p-3 transition-colors',
                      idx < txs.length - 1 && 'border-b border-gray-50'
                    )}
                  >
                    <CategoryIcon category={tx.category} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {tx.category?.name}
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">
                          {PAYMENT_METHOD_LABELS[tx.payment_method] || tx.payment_method}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MoneyDisplay
                        amount={tx.amount}
                        type={tx.type === 'INCOME' ? 'income' : 'expense'}
                        size="sm"
                      />
                      {tx.user && <PersonAvatar user={tx.user} size="sm" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
