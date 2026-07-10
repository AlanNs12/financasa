'use client'

import { X } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { ProgressBar } from '@/components/shared/progress-bar'

interface TransactionItem {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  category_id: string
  payment_method: string
  notes: string | null
  user: { name: string }
}

interface CategoryDetailPanelProps {
  category: {
    id: string
    name: string
    icon: string
    color: string
    planned: number
  } | null
  transactions: TransactionItem[]
  onClose: () => void
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  CASH: 'Dinheiro',
  BANK_TRANSFER: 'Transferência',
  BOLETO: 'Boleto',
}

function formatTransactionDate(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
}

export function CategoryDetailPanel({ category, transactions, onClose }: CategoryDetailPanelProps) {
  if (!category) return null

  const catTransactions = transactions.filter(
    (t) => t.category_id === category.id && t.type === 'EXPENSE'
  )

  const totalSpent = catTransactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-theme-lg border border-border max-h-[85dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
              style={{ backgroundColor: category.color ? `${category.color}20` : undefined }}
            >
              <span>{category.icon}</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{category.name}</h2>
              <p className="text-xs text-muted-foreground">Detalhes da categoria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total gasto</span>
              <span className="text-lg font-bold" style={{ color: 'var(--expense)' }}>
                {formatCurrency(totalSpent)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Planejado</span>
              <span className="text-sm font-medium text-foreground">
                {category.planned > 0 ? formatCurrency(category.planned) : 'Sem planejamento'}
              </span>
            </div>
            {category.planned > 0 && (
              <div className="space-y-1">
                <ProgressBar value={totalSpent} max={category.planned} size="sm" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {totalSpent > category.planned ? (
                      <span className="text-expense font-medium">
                        {Math.round((totalSpent / category.planned) * 100)}% · acima do planejado
                      </span>
                    ) : (
                      <>{Math.round((totalSpent / category.planned) * 100)}% utilizado</>
                    )}
                  </span>
                  <span className="text-xs font-medium" style={{ color: category.planned - totalSpent >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                    {category.planned - totalSpent >= 0 ? '+' : '-'}{formatCurrency(Math.abs(category.planned - totalSpent))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {catTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Nenhuma transação nesta categoria</p>
            </div>
          ) : (
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Transações ({catTransactions.length})
              </h3>
              <div className="bg-background rounded-2xl border border-border overflow-hidden">
                {catTransactions.map((tx, idx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-3"
                    style={idx < catTransactions.length - 1 ? { borderBottom: '1px solid var(--border)' } : undefined}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {formatTransactionDate(tx.date)}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {PAYMENT_METHOD_LABELS[tx.payment_method] || tx.payment_method}
                        </span>
                        {tx.notes && (
                          <>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground truncate">{tx.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-medium" style={{ color: 'var(--expense)' }}>
                        {formatCurrency(tx.amount)}
                      </span>
                      <span className="text-xs text-muted-foreground">{tx.user.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold" style={{ color: 'var(--expense)' }}>
              {formatCurrency(totalSpent)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
