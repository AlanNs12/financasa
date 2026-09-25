'use client'

import { useState, useTransition } from 'react'
import { formatCurrency, formatDate } from '@/lib/format'
import { CategoryIcon } from '@/components/shared/category-icon'
import { MoneyDisplay } from '@/components/shared/money-display'
import { PersonAvatar } from '@/components/shared/person-avatar'
import { Filter, Trash2, Pencil, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { deleteTransactionAction, deleteInstallmentGroupAction } from '@/app/actions/transactions'
import { exportTransactionsCsvAction } from '@/app/actions/export'
import { toast } from 'sonner'

interface TransactionItem {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  created_at: string
  notes: string | null
  category_id: string
  payment_method: string
  credit_card_id?: string | null
  billing_month?: number | null
  billing_year?: number | null
  installment_group_id?: string | null
  installment_total?: number | null
  installment_current?: number | null
  category: { name: string; icon: string; color: string } | null
  user: { name: string; avatar_url: string | null } | null
}

interface TransactionListProps {
  transactions: TransactionItem[]
  categories: { id: string; name: string; icon: string; color: string; type: string }[]
  month: number
  year: number
  onSelectTransaction: (t: TransactionItem) => void
  onEdit: (t: TransactionItem) => void
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  CASH: 'Dinheiro',
  BANK_TRANSFER: 'Transferência',
  BOLETO: 'Boleto',
}

const MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function TransactionList({ transactions, categories, month, year, onSelectTransaction, onEdit }: TransactionListProps) {
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [filterUser, setFilterUser] = useState('ALL')
  const [pendingDelete, setPendingDelete] = useState<TransactionItem | null>(null)
  const [deleteAllInstallments, setDeleteAllInstallments] = useState(false)
  const [isPending, startTransition] = useTransition()

  function requestDelete(tx: TransactionItem) {
    setDeleteAllInstallments(false)
    setPendingDelete(tx)
  }

  const users = Array.from(
    new Set(transactions.map((t) => t.user?.name).filter((n): n is string => !!n))
  )

  const activeFilterCount =
    (filter !== 'ALL' ? 1 : 0) +
    (filterCategory !== 'ALL' ? 1 : 0) +
    (filterUser !== 'ALL' ? 1 : 0) +
    (search.trim() ? 1 : 0)

  function clearFilters() {
    setFilter('ALL')
    setFilterCategory('ALL')
    setFilterUser('ALL')
    setSearch('')
  }

  function confirmDelete() {
    if (!pendingDelete) return
    const tx = pendingDelete
    const groupId = tx.installment_group_id
    const deleteGroup = deleteAllInstallments && !!groupId
    startTransition(async () => {
      const result = deleteGroup
        ? await deleteInstallmentGroupAction(groupId!)
        : await deleteTransactionAction(tx.id)
      if (result?.error) {
        toast.error('Erro ao excluir transação.')
        return
      }
      toast.success(deleteGroup ? 'Parcelas excluídas' : 'Transação excluída')
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

  const searchTerm = search.trim().toLowerCase()

  const filtered = transactions.filter((t) => {
    if (filter !== 'ALL' && t.type !== filter) return false
    if (filterCategory !== 'ALL' && t.category_id !== filterCategory) return false
    if (filterUser !== 'ALL' && t.user?.name !== filterUser) return false
    if (searchTerm && !t.description.toLowerCase().includes(searchTerm)) return false
    return true
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
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
            showFilters || activeFilterCount > 0
              ? 'bg-primary text-primary-foreground border-primary'
              : 'text-muted-foreground bg-card border-border hover:bg-accent'
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          Filtrar
          {activeFilterCount > 0 && (
            <span className="ml-0.5 px-1.5 rounded-full bg-white/20 text-[10px] font-semibold">
              {activeFilterCount}
            </span>
          )}
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
                'px-2.5 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap',
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

      {showFilters && (
        <div className="bg-card rounded-xl border border-border p-3 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por descrição..."
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none"
            >
              <option value="ALL">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none"
            >
              <option value="ALL">Todas as pessoas</option>
              {users.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {filtered.length} de {transactions.length} transações
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-primary underline underline-offset-2"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {Object.keys(groupedByDate).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">
            {activeFilterCount > 0
              ? 'Nenhuma transação encontrada com os filtros aplicados'
              : 'Nenhuma transação encontrada'}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-3 text-xs text-primary underline underline-offset-2"
            >
              Limpar filtros
            </button>
          )}
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
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectTransaction(tx)}
                    onKeyDown={e => e.key === 'Enter' && onSelectTransaction(tx)}
                    className={cn(
                      'p-3 transition-colors cursor-pointer hover:bg-muted/50 group',
                      idx < txs.length - 1 && 'border-b border-border'
                    )}
                    aria-label={`Ver detalhes: ${tx.description}`}
                  >
                    {/* Desktop layout */}
                    <div className="hidden sm:flex items-center gap-3">
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
                      <div className="flex items-center gap-2 shrink-0">
                        <MoneyDisplay
                          amount={tx.amount}
                          type={tx.type === 'INCOME' ? 'income' : 'expense'}
                          size="sm"
                        />
                        {tx.payment_method === 'CREDIT_CARD' &&
                          tx.billing_month != null &&
                          tx.billing_month !== new Date(tx.date.includes('T') ? tx.date.split('T')[0] + 'T12:00:00' : tx.date).getMonth() + 1 && (
                          <span className="text-[10px] text-[#d97706] dark:text-[#fbbf24]
                                           bg-[#fef9c3] dark:bg-[#f59e0b]/10
                                           px-1.5 py-0.5 rounded-full font-medium shrink-0">
                            Fatura {MONTH_ABBR[tx.billing_month - 1]}
                          </span>
                        )}
                        {tx.installment_total && tx.installment_total > 1 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-primary/8 text-primary dark:text-primary shrink-0">
                            {tx.installment_current}/{tx.installment_total}x
                          </span>
                        )}
                        {tx.user && <PersonAvatar user={tx.user} size="sm" />}
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit(tx) }}
                          aria-label="Editar transação"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); requestDelete(tx) }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                          aria-label="Excluir transação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile layout */}
                    <div className="flex sm:hidden gap-3">
                      <CategoryIcon category={tx.category} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground truncate min-w-0">
                            {tx.description}
                          </p>
                          <MoneyDisplay
                            amount={tx.amount}
                            type={tx.type === 'INCOME' ? 'income' : 'expense'}
                            size="sm"
                            className="shrink-0"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {tx.category?.name}
                          </span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">
                            {PAYMENT_METHOD_LABELS[tx.payment_method] || tx.payment_method}
                          </span>
                          {tx.payment_method === 'CREDIT_CARD' &&
                            tx.billing_month != null &&
                            tx.billing_month !== new Date(tx.date.includes('T') ? tx.date.split('T')[0] + 'T12:00:00' : tx.date).getMonth() + 1 && (
                            <span className="text-[10px] text-[#d97706] dark:text-[#fbbf24]
                                             bg-[#fef9c3] dark:bg-[#f59e0b]/10
                                             px-1.5 py-0.5 rounded-full font-medium">
                              Fatura {MONTH_ABBR[tx.billing_month - 1]}
                            </span>
                          )}
                          {tx.installment_total && tx.installment_total > 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-primary/8 text-primary dark:text-primary">
                              {tx.installment_current}/{tx.installment_total}x
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1.5">
                            {tx.user && <PersonAvatar user={tx.user} size="xs" />}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); onEdit(tx) }}
                              aria-label="Editar transação"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); requestDelete(tx) }}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                              aria-label="Excluir transação"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => { if (!isPending) setPendingDelete(null) }}
        onConfirm={confirmDelete}
        title="Excluir esta transação?"
        description={
          <>
            <span className="text-foreground font-medium">{pendingDelete?.description}</span>
            {pendingDelete ? ` · ${formatCurrency(pendingDelete.amount)}` : ''}
            {pendingDelete?.installment_group_id &&
            pendingDelete.installment_total &&
            pendingDelete.installment_total > 1 ? (
              <label className="flex items-center gap-2 mt-3 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteAllInstallments}
                  onChange={(e) => setDeleteAllInstallments(e.target.checked)}
                  className="accent-primary"
                />
                Excluir todas as {pendingDelete.installment_total} parcelas
              </label>
            ) : (
              <span className="block text-xs mt-1">Esta ação não pode ser desfeita.</span>
            )}
          </>
        }
        confirmLabel="Excluir"
        pending={isPending}
      />
    </div>
  )
}
