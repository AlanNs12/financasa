'use client'

import { useState, useTransition } from 'react'
import { formatCurrency, getMonthName } from '@/lib/format'
import { ProgressBar } from '@/components/shared/progress-bar'
import { upsertBudgetItemAction, updateBudgetIncomeAction } from '@/app/actions/budget'
import { toast } from 'sonner'
import { Pencil, Check, X, Loader2 } from 'lucide-react'

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
  month: number
  year: number
}

export function PlanejamentoClient({ data, month, year }: PlanejamentoClientProps) {
  const [editMode, setEditMode] = useState(false)
  const [editingIncome, setEditingIncome] = useState(false)
  const [incomeValue, setIncomeValue] = useState(String(data.total_income))
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [itemValue, setItemValue] = useState('')
  const [isPending, startTransition] = useTransition()

  const monthName = getMonthName(month)

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Planejamento</h1>
        <p className="text-sm text-gray-500">Orçamento por categoria</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">
            Receita total · {monthName}
          </span>
          {editingIncome ? (
            <div className="flex items-center gap-1">
              <button
                onClick={saveIncome}
                disabled={isPending}
                className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setEditingIncome(false)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingIncome(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Pencil className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {editingIncome ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">R$</span>
            <input
              type="number"
              value={incomeValue}
              onChange={(e) => setIncomeValue(e.target.value)}
              className="w-40 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-2xl font-bold"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveIncome()
                if (e.key === 'Escape') setEditingIncome(false)
              }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">R$</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.total_income).replace('R$', '').trim()}
            </span>
            {data.actual_income > 0 && data.total_income !== data.actual_income && (
              <span className="text-xs text-gray-400">
                (recebido: {formatCurrency(data.actual_income)})
              </span>
            )}
          </div>
        )}

        {data.actual_income > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            Receita registrada em transações: {formatCurrency(data.actual_income)}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Categorias</h2>
          <span className="text-xs text-gray-400">
            {formatCurrency(data.total_spent)} de {formatCurrency(data.total_planned)} planejado
          </span>
        </div>

        {data.items.map((item) => {
          const isEditing = editingItem === item.id

          return (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  {isEditing ? (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-400">Planejado: R$</span>
                      <input
                        type="number"
                        value={itemValue}
                        onChange={(e) => setItemValue(e.target.value)}
                        className="w-24 px-2 py-0.5 rounded border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-xs font-medium"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveItem()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                      />
                      <button onClick={saveItem} disabled={isPending} className="p-0.5 text-green-600 hover:bg-green-50 rounded">
                        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      </button>
                      <button onClick={cancelEdit} className="p-0.5 text-red-500 hover:bg-red-50 rounded">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">
                      {item.planned > 0
                        ? `Gasto: ${formatCurrency(item.spent)} de ${formatCurrency(item.planned)} planejado`
                        : item.spent > 0
                          ? `Gasto: ${formatCurrency(item.spent)} · sem planejamento`
                          : 'Nenhum gasto · sem planejamento'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={item.percentage > 90 ? 'text-xs font-medium text-red-500' : item.percentage >= 70 ? 'text-xs font-medium text-yellow-500' : 'text-xs font-medium text-gray-500'}>
                    {Math.round(item.percentage)}%
                  </span>
                  <button
                    onClick={() => startEditItem(item)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-gray-400" />
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
