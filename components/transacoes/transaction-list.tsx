'use client'

import { useState, useTransition } from 'react'
import { formatCurrency, formatDate } from '@/lib/format'
import { CategoryIcon } from '@/components/shared/category-icon'
import { MoneyDisplay } from '@/components/shared/money-display'
import { PersonAvatar } from '@/components/shared/person-avatar'
import { Filter, Trash2, AlertTriangle, Loader2, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteTransactionAction } from '@/app/actions/transactions'
import { exportTransactionsCsvAction } from '@/app/actions/export'
import { toast } from 'sonner'

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
  month: number
  year: number
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  CASH: 'Dinheiro',
  BANK_TRANSFER: 'Transferência',
  BOLETO: 'Boleto',
}

export function TransactionList({ transactions, month, year }: TransactionListProps) {
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [showFilters, setShowFilters] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<TransactionItem | null>(null)
  const [isPending, startTransition] = useTransition()

  function confirmDelete() {
    if (!pendingDelete) return
    const tx = pendingDelete
    startTransition(async () => {
      const result = await deleteTransactionAction(tx.id)
      if (result?.error) {
        toast.error('Erro ao excluir transação.')
        return
      }
      toast.success('Transação excluída')
      setPendingDelete(null)
    })
  }

  function handleExportCsv() {
    startTransition(async () => {
      const result = await exportTransactionsCsvAction(month, year)
      if ('error' in result && result.error) {
        toast.error('Erro ao exportar CSV.')
        return
      }
      if ('csv' in result && result.csv) {
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename
        a.click()
        URL.revokeObjectURL(url)
        toast.success('CSV exportado!')
      }
    })
  }

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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground bg-card border border-border hover:bg-accent transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          Filtrar
        </button>

        <button
          onClick={handleExportCsv}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground bg-card border border-border hover:bg-accent transition-colors disabled:opacity-50 ml-auto"
        >
          <Download className="w-3.5 h-3.5" />
          CSV
        </button>

        <div className="flex bg-card rounded-lg border border-border p-0.5">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f === 'ALL' ? 'Todos' : f === 'INCOME' ? 'Entradas' : 'Saídas'}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(groupedByDate).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">Nenhuma transação encontrada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, txs]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {date}
              </h3>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {txs.map((tx, idx) => (
                  <div
                    key={tx.id}
                    className={cn(
                      'flex items-center gap-3 p-3 transition-colors',
                      idx < txs.length - 1 && 'border-b border-border'
                    )}
                  >
                    <CategoryIcon category={tx.category} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {tx.category?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
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
                      <button
                        onClick={() => setPendingDelete(tx)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        aria-label="Excluir transação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isPending && setPendingDelete(null)}
          />
          <div className="relative bg-card rounded-t-3xl lg:rounded-3xl w-full lg:max-w-sm p-6 shadow-xl">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">
                Excluir esta transação?
              </h2>
              <p className="text-sm text-muted-foreground">
                {pendingDelete.description} · {formatCurrency(pendingDelete.amount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
