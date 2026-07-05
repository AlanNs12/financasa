'use client'

import { useState, useTransition } from 'react'
import { formatCurrency, getMonthName } from '@/lib/format'
import { ProgressBar } from '@/components/shared/progress-bar'
import { upsertBudgetItemAction, updateBudgetIncomeAction } from '@/app/actions/budget'
import { exportPlanningCsvAction } from '@/app/actions/export'
import { toast } from 'sonner'
import { Pencil, Check, X, Loader2, Download, AlertTriangle } from 'lucide-react'

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
  totalBills: number
  month: number
  year: number
  incomeData: { effectiveIncome: number; actualIncome: number; budgetIncome: number }
}

export function PlanejamentoClient({ data, totalBills, month, year, incomeData }: PlanejamentoClientProps) {
  const { effectiveIncome: effectiveBudgetIncome, actualIncome, budgetIncome } = incomeData
  const [editMode, setEditMode] = useState(false)
  const [editingIncome, setEditingIncome] = useState(false)
  const [incomeValue, setIncomeValue] = useState(String(effectiveBudgetIncome))
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [itemValue, setItemValue] = useState('')
  const [isPending, startTransition] = useTransition()

  const monthName = getMonthName(month)
  const disponible = effectiveBudgetIncome - totalBills
  const warningOverBudget = data.total_planned > disponible

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
              {budgetIncome === 0 && actualIncome > 0 && (
                <span className="text-xs text-muted-foreground">
                  (recebido: {formatCurrency(actualIncome)})
                </span>
              )}
              {budgetIncome > 0 && actualIncome !== budgetIncome && (
                <span className="text-xs text-muted-foreground">
                  (recebido: {formatCurrency(actualIncome)})
                </span>
              )}
            </div>

            {totalBills > 0 && (
              <>
                <div className="flex items-center gap-2 pl-1 border-l-2 border-muted-foreground/30">
                  <span className="text-sm text-muted-foreground">(-) Contas fixas</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatCurrency(totalBills)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">(=) Disponível</span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: disponible >= 0 ? 'var(--income)' : 'var(--expense)' }}
                  >
                    {formatCurrency(disponible)}
                  </span>
                  {disponible < 0 && (
                    <AlertTriangle className="w-4 h-4" style={{ color: 'var(--expense)' }} />
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {actualIncome > 0 && (
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
            Receita registrada em transações: {formatCurrency(actualIncome)}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Categorias</h2>
          <span className="text-xs text-muted-foreground">
            {formatCurrency(data.total_spent)} de {formatCurrency(data.total_planned)} planejado
          </span>
        </div>

        {warningOverBudget && totalBills > 0 && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Total planejado ({formatCurrency(data.total_planned)}) maior que o disponível ({formatCurrency(disponible)})
            </span>
          </div>
        )}

        {data.items.map((item) => {
          const isEditing = editingItem === item.id

          return (
            <div key={item.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-xs text-muted-foreground">Planejado: R$</span>
                      <input
                        type="number"
                        value={itemValue}
                        onChange={(e) => setItemValue(e.target.value)}
                        className="min-w-0 w-[120px] max-w-full px-3 py-1.5 rounded-lg border border-border bg-background text-base font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveItem()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                      />
                      <button
                        onClick={saveItem}
                        disabled={isPending}
                        aria-label="Confirmar valor"
                        className="p-2.5 min-w-[44px] min-h-[44px] rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 transition-colors"
                      >
                        {isPending ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <Check size={18} />}
                      </button>
                      <button
                        onClick={cancelEdit}
                        aria-label="Cancelar edição"
                        className="p-2.5 min-w-[44px] min-h-[44px] rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs">
                      {item.planned > 0 ? (
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-muted-foreground">Gasto:</span>
                          <span className={item.spent > item.planned ? 'text-expense font-medium' : 'text-foreground font-medium'}>
                            {formatCurrency(item.spent)}
                          </span>
                          <span className="text-muted-foreground">de</span>
                          <span className="text-foreground font-medium">{formatCurrency(item.planned)}</span>
                          <span style={{ color: item.planned - item.spent >= 0 ? 'var(--income)' : 'var(--expense)' }} className="font-medium">
                            ({item.planned - item.spent >= 0 ? '+' : '-'}{formatCurrency(Math.abs(item.planned - item.spent)).replace('R$', '').trim()})
                          </span>
                        </div>
                      ) : item.spent > 0 ? (
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-muted-foreground">Gasto:</span>
                          <span className="text-expense font-medium">{formatCurrency(item.spent)}</span>
                          <span className="text-muted-foreground">· sem planejamento</span>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Nenhum gasto · sem planejamento</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={item.percentage > 90 ? 'text-xs font-medium text-expense' : item.percentage >= 70 ? 'text-xs font-medium text-yellow-500' : 'text-xs font-medium text-muted-foreground'}>
                    {Math.round(item.percentage)}%
                  </span>
                  <button
                    onClick={() => startEditItem(item)}
                    aria-label="Editar planejamento"
                    className="p-2.5 min-w-[44px] min-h-[44px] rounded-lg hover:bg-accent dark:hover:bg-gray-800 transition-colors"
                  >
                    <Pencil size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              <ProgressBar value={item.spent} max={item.planned || item.spent || 1} size="sm" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
