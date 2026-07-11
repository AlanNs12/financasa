'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, TrendingUp, X } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  createRecurringIncomeAction,
  updateRecurringIncomeAction,
  deleteRecurringIncomeAction,
} from '@/app/actions/recurring-incomes'

const RECURRENCE_LABELS: Record<string, string> = {
  MONTHLY: 'Mensal',
  BIMONTHLY: 'Bimestral',
  QUARTERLY: 'Trimestral',
  SEMIANNUAL: 'Semestral',
  ANNUAL: 'Anual',
}

interface RecurringIncomeItem {
  id: string
  name: string
  amount: number
  recurrence: string
  start_month: number
  start_year: number
}

interface RecurringIncomeSectionProps {
  recurringIncomes: RecurringIncomeItem[]
  monthIncomes: RecurringIncomeItem[]
  currentMonth: number
  currentYear: number
}

export function RecurringIncomeSection({
  recurringIncomes,
  monthIncomes,
  currentMonth,
  currentYear,
}: RecurringIncomeSectionProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingIncome, setEditingIncome] = useState<RecurringIncomeItem | null>(null)
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [recurrence, setRecurrence] = useState('MONTHLY')

  const totalExpected = monthIncomes.reduce((s, i) => s + i.amount, 0)

  function openModal(income?: RecurringIncomeItem) {
    if (income) {
      setEditingIncome(income)
      setName(income.name)
      setAmount(String(income.amount))
      setRecurrence(income.recurrence)
    } else {
      setEditingIncome(null)
      setName('')
      setAmount('')
      setRecurrence('MONTHLY')
    }
    setShowModal(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      name,
      amount: Number(amount),
      recurrence,
      start_month: currentMonth,
      start_year: currentYear,
    }

    startTransition(async () => {
      if (editingIncome) {
        const result = await updateRecurringIncomeAction(editingIncome.id, data)
        if (result?.error) {
          toast.error(result.error)
          return
        }
        toast.success('Receita atualizada!')
      } else {
        const result = await createRecurringIncomeAction(data)
        if (result?.error) {
          toast.error(result.error)
          return
        }
        toast.success('Receita cadastrada!')
      }
      setShowModal(false)
    })
  }

  function handleDelete(income: RecurringIncomeItem) {
    if (!confirm(`Remover "${income.name}"?`)) return
    startTransition(async () => {
      const result = await deleteRecurringIncomeAction(income.id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Receita removida')
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Receitas fixas</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Salários e outras entradas recorrentes esperadas
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22C55E] text-white text-xs font-medium hover:bg-[#16a34a] transition-colors"
        >
          <Plus size={14} /> Nova receita
        </button>
      </div>

      {totalExpected > 0 && (
        <div className="p-4 rounded-2xl border border-[#bbf7d0] dark:border-[#22c55e]/25 bg-[#f0fdf4] dark:bg-[#22c55e]/8">
          <p className="text-xs text-[#15803d] dark:text-[#4ade80] font-medium mb-1">
            Receita esperada este mês
          </p>
          <p className="text-2xl font-bold text-[#15803d] dark:text-[#4ade80]">
            {formatCurrency(totalExpected)}
          </p>
        </div>
      )}

      {recurringIncomes.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-border text-center">
          <TrendingUp size={28} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma receita fixa cadastrada</p>
          <p className="text-xs text-muted-foreground mt-1">
            Cadastre salários e outras receitas mensais esperadas
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {recurringIncomes.map((income, idx) => {
            const isThisMonth = monthIncomes.some((m) => m.id === income.id)
            return (
              <div
                key={income.id}
                className={cn(
                  'flex items-center gap-3 p-4 group',
                  idx < recurringIncomes.length - 1 && 'border-b border-border'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-[#dcfce7] dark:bg-[#22c55e]/15 flex items-center justify-center shrink-0">
                  <TrendingUp size={18} className="text-[#16a34a] dark:text-[#4ade80]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{income.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {RECURRENCE_LABELS[income.recurrence] ?? income.recurrence}
                    {!isThisMonth && ' · não previsto este mês'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#16a34a] dark:text-[#4ade80]">
                    +{formatCurrency(income.amount)}
                  </p>
                  {isThisMonth && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-[#dcfce7] dark:bg-[#22c55e]/15 text-[#15803d] dark:text-[#4ade80]">
                      este mês
                    </span>
                  )}
                  <button
                    onClick={() => openModal(income)}
                    aria-label="Editar receita"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(income)}
                    aria-label="Remover receita"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-[#EF4444] hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border shadow-theme-lg">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">
                {editingIncome ? 'Editar receita' : 'Nova receita fixa'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Fechar"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Salário, Freelance mensal, Aluguel recebido"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Valor esperado
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Recorrência
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-ring transition-colors"
                >
                  {Object.entries(RECURRENCE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {!editingIncome && (
                <div className="p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground">
                  Esta receita começará a aparecer a partir de{' '}
                  <strong className="text-foreground">
                    {new Date(currentYear, currentMonth - 1).toLocaleString('pt-BR', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>
                  .
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-11 rounded-lg bg-[#22C55E] text-white text-sm font-semibold hover:bg-[#16a34a] disabled:opacity-50 transition-colors"
                >
                  {isPending ? 'Salvando...' : editingIncome ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
