'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, getMonthName } from '@/lib/format'
import { ProgressBar } from '@/components/shared/progress-bar'
import { upsertBudgetItemAction, updateBudgetIncomeAction } from '@/app/actions/budget'
import { confirmRecurringIncomeAction, unconfirmRecurringIncomeAction } from '@/app/actions/recurring-incomes'
import { exportPlanningCsvAction } from '@/app/actions/export'
import { toast } from 'sonner'
import { CategoryDetailPanel } from '@/components/planejamento/category-detail-panel'
import { Pencil, Check, X, Loader2, Download, AlertTriangle, TrendingUp } from 'lucide-react'

interface PlanejamentoItem {
  id: string
  budget_item_id: string | null
  name: string
  icon: string
  color: string
  planned: number
  spent: number
  percentage: number
}

interface PlanejamentoData {
  total_income: number
  actual_income: number
  budget_id: string | null
  total_planned: number
  total_spent: number
  items: PlanejamentoItem[]
}

interface PlanejamentoClientProps {
  data: PlanejamentoData
  totalPaidBills: number
  totalPendingBills: number
  month: number
  year: number
  incomeData: { effectiveIncome: number; actualIncome: number; budgetIncome: number; expectedIncome: number }
  allTransactions: Array<{
    id: string
    description: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    date: string
    category_id: string
    payment_method: string
    notes: string | null
    user: { name: string }
  }>
  monthIncomes: Array<{
    id: string
    name: string
    amount: number
    recurrence: string
    start_month: number
    start_year: number
    confirmed: boolean
    confirmedAmount: number | null
    confirmedTransactionId: string | null
  }>
}

export function PlanejamentoClient({ data, totalPaidBills, totalPendingBills, month, year, incomeData, allTransactions, monthIncomes }: PlanejamentoClientProps) {
  const router = useRouter()
  const { effectiveIncome: effectiveBudgetIncome, actualIncome, expectedIncome } = incomeData
  const [editMode, setEditMode] = useState(false)
  const [editingIncome, setEditingIncome] = useState(false)
  const [incomeValue, setIncomeValue] = useState(String(effectiveBudgetIncome))
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [itemValue, setItemValue] = useState('')
  const [isPending, startTransition] = useTransition()
  const [confirmingIncomeId, setConfirmingIncomeId] = useState<string | null>(null)
  const [confirmAmount, setConfirmAmount] = useState('')
  const [isConfirming, startConfirmTransition] = useTransition()
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string
    name: string
    icon: string
    color: string
    planned: number
  } | null>(null)

  const monthName = getMonthName(month)
  const baseIncome = actualIncome > 0 ? actualIncome : expectedIncome
  const saldoReal = baseIncome - data.total_spent
  const totalVariableExpenses = data.total_spent - totalPaidBills
  const naoAlocado = effectiveBudgetIncome - data.total_planned
  const warningOverBudget = data.total_planned > effectiveBudgetIncome

  const totalConfirmedIncome = monthIncomes
    .filter(i => i.confirmed)
    .reduce((s, i) => s + (i.confirmedAmount ?? 0), 0)

  const totalPendingExpectedIncome = monthIncomes
    .filter(i => !i.confirmed)
    .reduce((s, i) => s + i.amount, 0)

  const saldoPrevisto =
    saldoReal +
    totalPendingExpectedIncome -
    totalPendingBills

  function saveIncome() {
    const val = Number(incomeValue)
    if (val <= 0) return
    startTransition(async () => {
      const result = await updateBudgetIncomeAction(month, year, val)
      if (result?.success) {
        toast.success('Receita atualizada!')
        setEditingIncome(false)
      } else {
        toast.error('Erro ao salvar.')
      }
    })
  }

  function startEditItem(item: PlanejamentoItem) {
    setEditingItem(item.id)
    setItemValue(String(item.planned))
  }

  function saveItem() {
    const val = Number(itemValue)
    if (val < 0 || !editingItem) return
    startTransition(async () => {
      const result = await upsertBudgetItemAction(month, year, editingItem, val)
      if (result?.success) {
        toast.success('Planejamento salvo!')
        setEditingItem(null)
      } else {
        toast.error('Erro ao salvar.')
      }
    })
  }

  function cancelEdit() {
    setEditingItem(null)
    setEditingIncome(false)
    if (!editMode) setEditMode(false)
  }

  function handleExportCsv() {
    startTransition(async () => {
      const result = await exportPlanningCsvAction(month, year)
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">Planejamento</h1>
          <p className="text-sm text-muted-foreground">Orçamento por categoria</p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground bg-card border border-border hover:bg-accent transition-colors disabled:opacity-50 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          CSV
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">
            Receita total · {monthName}
          </span>
          {editingIncome ? (
            <div className="flex items-center gap-1">
              <button
                onClick={saveIncome}
                disabled={isPending}
                aria-label="Confirmar receita"
                className="p-2.5 min-w-[44px] min-h-[44px] rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 transition-colors"
              >
                {isPending ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <Check size={18} />}
              </button>
              <button
                onClick={() => setEditingIncome(false)}
                aria-label="Cancelar edição"
                className="p-2.5 min-w-[44px] min-h-[44px] rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingIncome(true)}
              aria-label="Editar receita"
              className="p-2.5 min-w-[44px] min-h-[44px] rounded-lg hover:bg-accent dark:hover:bg-gray-800 transition-colors"
            >
              <Pencil size={18} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {editingIncome ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">R$</span>
            <input
              type="number"
              value={incomeValue}
              onChange={(e) => setIncomeValue(e.target.value)}
              className="w-40 px-3 py-1.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-2xl font-bold"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveIncome()
                if (e.key === 'Escape') setEditingIncome(false)
              }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">R$</span>
              <span className="text-3xl font-bold text-foreground">
                {formatCurrency(effectiveBudgetIncome).replace('R$', '').trim()}
              </span>
              {actualIncome > 0 ? (
                <span className="text-xs text-muted-foreground">
                  (recebido: {formatCurrency(actualIncome)})
                </span>
              ) : expectedIncome > 0 ? (
                <span className="text-xs text-[#f59e0b]">
                  (previsto: {formatCurrency(expectedIncome)})
                </span>
              ) : null}
            </div>

            {(totalPaidBills > 0 || data.total_spent > 0) && (
              <>
                {totalPaidBills > 0 && (
                  <div className="flex items-center gap-2 pl-1 border-l-2 border-muted-foreground/30">
                    <span className="text-sm text-muted-foreground">(-) Contas fixas</span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatCurrency(totalPaidBills)}
                    </span>
                  </div>
                )}

                {totalVariableExpenses > 0 && (
                  <div className="flex items-center gap-2 pl-1 border-l-2 border-muted-foreground/30">
                    <span className="text-sm text-muted-foreground">(-) Gastos variáveis</span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatCurrency(totalVariableExpenses)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">(=) Saldo real</span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: saldoReal >= 0 ? '#22C55E' : '#EF4444' }}
                  >
                    {formatCurrency(saldoReal)}
                  </span>
                  {saldoReal < 0 && (
                    <AlertTriangle className="w-4 h-4" style={{ color: '#EF4444' }} />
                  )}
                </div>

                {(totalPendingExpectedIncome > 0 || totalPendingBills > 0) && (
                  <div className="flex items-center gap-2 mt-1 pl-1">
                    <div className="w-0.5 h-4 bg-border self-stretch mr-1" />
                    <span className="text-xs text-muted-foreground">Saldo previsto</span>
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: saldoPrevisto >= 0 ? '#22C55E' : '#EF4444' }}
                    >
                      {saldoPrevisto < 0 ? '-' : ''}
                      {formatCurrency(Math.abs(saldoPrevisto))}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      (se tudo planejado ocorrer)
                    </span>
                  </div>
                )}
              </>
            )}

            {effectiveBudgetIncome > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Orçamento não alocado: {formatCurrency(naoAlocado)}
              </p>
            )}
          </div>
        )}

        {monthIncomes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Receitas previstas este mês
            </p>
            {monthIncomes.map((income) => (
              <div key={income.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={13}
                    className={income.confirmed
                      ? 'text-[#22C55E]'
                      : 'text-muted-foreground'}
                  />
                  <span className={`text-sm flex-1 ${
                    income.confirmed ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {income.name}
                  </span>

                  {income.confirmed ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#22C55E]">
                        +{formatCurrency(income.confirmedAmount!)}
                      </span>
                      {income.confirmedAmount !== income.amount && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          {formatCurrency(income.amount)}
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium
                                       bg-[#dcfce7] dark:bg-[#22c55e]/15
                                       text-[#15803d] dark:text-[#4ade80]">
                        ✓ recebido
                      </span>
                      <button
                        onClick={() => {
                          setConfirmingIncomeId(income.id)
                          setConfirmAmount(String(income.confirmedAmount))
                        }}
                        className="text-[10px] text-muted-foreground hover:text-foreground
                                   underline underline-offset-2 transition-colors"
                      >
                        editar
                      </button>
                      <button
                        onClick={() => {
                          if (!income.confirmedTransactionId) return
                          if (!confirm('Desfazer recebimento?')) return
                          startConfirmTransition(async () => {
                            const r = await unconfirmRecurringIncomeAction(
                              income.confirmedTransactionId!
                            )
                            if (r?.error) toast.error(r.error)
                            else toast.success('Recebimento desfeito')
                          })
                        }}
                        className="text-[10px] text-muted-foreground hover:text-[#EF4444]
                                   transition-colors"
                        aria-label="Desfazer recebimento"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">
                        +{formatCurrency(income.amount)}
                      </span>
                      <button
                        onClick={() => {
                          setConfirmingIncomeId(income.id)
                          setConfirmAmount(String(income.amount))
                        }}
                        className="text-[10px] px-2 py-1 rounded-lg font-medium
                                   border border-[#22C55E]/40 text-[#16a34a] dark:text-[#4ade80]
                                   hover:bg-[#dcfce7] dark:hover:bg-[#22c55e]/10
                                   transition-colors whitespace-nowrap"
                      >
                        Confirmar recebimento
                      </button>
                    </div>
                  )}
                </div>

                {confirmingIncomeId === income.id && (
                  <div className="ml-5 flex items-center gap-2 p-3 rounded-xl
                                  bg-[#f0fdf4] dark:bg-[#22c55e]/8
                                  border border-[#bbf7d0] dark:border-[#22c55e]/25">
                    <div className="flex-1">
                      <label className="text-[10px] font-medium text-[#15803d] dark:text-[#4ade80]
                                        uppercase tracking-wide block mb-1">
                        Valor recebido
                        {income.amount !== Number(confirmAmount || '0') && Number(confirmAmount) > 0 && (
                          <span className="ml-1 text-[#f59e0b] normal-case font-normal">
                            (diferente do previsto: {formatCurrency(income.amount)})
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        value={confirmAmount}
                        onChange={e => setConfirmAmount(e.target.value)}
                        placeholder={String(income.amount)}
                        min="0.01"
                        step="0.01"
                        autoFocus
                        className="w-full h-9 px-3 rounded-lg border border-[#bbf7d0]
                                   dark:border-[#22c55e]/25 bg-white dark:bg-background
                                   text-foreground text-sm font-medium
                                   focus:outline-none focus:border-[#22C55E] transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        disabled={isConfirming || !confirmAmount || Number(confirmAmount) <= 0}
                        onClick={() => {
                          startConfirmTransition(async () => {
                            const today = new Date().toISOString().split('T')[0]
                            const r = await confirmRecurringIncomeAction(
                              income.id,
                              Number(confirmAmount),
                              today,
                              month,
                              year
                            )
                            if (r?.error) {
                              toast.error(r.error)
                            } else {
                              toast.success(
                                Number(confirmAmount) !== income.amount
                                  ? `Recebido ${formatCurrency(Number(confirmAmount))} (planejado: ${formatCurrency(income.amount)})`
                                  : `${income.name} confirmado!`
                              )
                              setConfirmingIncomeId(null)
                              router.refresh()
                            }
                          })
                        }}
                        className="h-9 px-3 rounded-lg bg-[#22C55E] text-white text-xs
                                   font-semibold hover:bg-[#16a34a] disabled:opacity-50
                                   transition-colors whitespace-nowrap"
                      >
                        {isConfirming ? '...' : 'Confirmar'}
                      </button>
                      <button
                        onClick={() => setConfirmingIncomeId(null)}
                        className="h-9 px-3 rounded-lg border border-border text-xs
                                   text-muted-foreground hover:bg-muted transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {totalPendingExpectedIncome === 0 && totalConfirmedIncome > 0 ? (
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="text-xs text-[#15803d] dark:text-[#4ade80] font-medium">
                  ✓ Todas as receitas confirmadas
                </span>
                <span className="text-xs font-semibold text-[#22C55E]">
                  +{formatCurrency(totalConfirmedIncome)}
                </span>
              </div>
            ) : totalConfirmedIncome > 0 ? (
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="text-xs text-muted-foreground">
                  Confirmado / Esperado total
                </span>
                <span className="text-xs font-semibold"
                      style={{ color: totalConfirmedIncome >= incomeData.expectedIncome
                        ? '#22C55E' : '#f59e0b' }}>
                  {formatCurrency(totalConfirmedIncome)} /
                  {formatCurrency(incomeData.expectedIncome)}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Categorias</h2>
          <span className="text-xs text-muted-foreground">
            {formatCurrency(data.total_spent)} de {formatCurrency(data.total_planned)} planejado
          </span>
        </div>

        {warningOverBudget && effectiveBudgetIncome > 0 && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Total planejado ({formatCurrency(data.total_planned)}) maior que a receita ({formatCurrency(effectiveBudgetIncome)})
            </span>
          </div>
        )}

        {data.items.map((item) => {
          const isEditing = editingItem === item.id

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <div
                onClick={() => {
                  if (isEditing) return
                  setSelectedCategory({
                    id: item.id,
                    name: item.name,
                    icon: item.icon,
                    color: item.color,
                    planned: item.planned,
                  })
                }}
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                aria-label={isEditing ? undefined : `Ver detalhes da categoria ${item.name}`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Gasto: <span style={{
                      color: item.spent > item.planned ? '#EF4444' : 'inherit'
                    }}>
                      {formatCurrency(item.spent)}
                    </span>
                    {item.planned === 0
                      ? ' · sem planejamento'
                      : ` de ${formatCurrency(item.planned)}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: item.planned === 0 ? 'var(--muted-foreground)' :
                        (item.spent / item.planned) >= 1 ? '#EF4444' :
                        (item.spent / item.planned) >= 0.7 ? '#f59e0b' : '#22C55E'
                    }}
                  >
                    {item.planned > 0
                      ? `${Math.min(100, Math.round((item.spent / item.planned) * 100))}%`
                      : '—'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startEditItem(item)
                    }}
                    aria-label={`Editar planejamento de ${item.name}`}
                    disabled={isEditing}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 disabled:opacity-30"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>

              <div className="px-4 pb-3">
                <ProgressBar value={item.spent} max={item.planned || item.spent || 1} size="sm" />
              </div>

              {isEditing && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-4 pb-4 pt-1 border-t border-border bg-muted/20"
                >
                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">
                      Valor planejado
                    </label>
                    <input
                      type="number"
                      value={itemValue}
                      onChange={(e) => setItemValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      min="0"
                      step="0.01"
                      autoFocus
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-base font-medium focus:outline-none focus:border-ring transition-colors"
                    />
                  </div>

                  <div className="flex gap-1.5 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        saveItem()
                      }}
                      disabled={isPending}
                      className="h-10 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47] disabled:opacity-50 transition-colors"
                    >
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        cancelEdit()
                      }}
                      className="h-10 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <CategoryDetailPanel
        category={selectedCategory}
        transactions={allTransactions}
        onClose={() => setSelectedCategory(null)}
      />
    </div>
  )
}
