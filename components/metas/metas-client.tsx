'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, PlusCircle, Pencil, Trash2, X, Target, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { ProgressBar } from '@/components/shared/progress-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { createGoalAction, updateGoalAction, addGoalAmountAction, deleteGoalAction } from '@/app/actions/goals'
import { goalSchema, updateGoalSchema, type GoalInput, type UpdateGoalInput } from '@/lib/validations/goal'
import type { FinancialGoal, GoalStatus } from '@/types'
import { toast } from 'sonner'

type BadgeStatus = 'paid' | 'pending' | 'overdue' | 'in_progress' | 'completed' | 'cancelled' | 'paused'

interface MetasClientProps {
  goals: FinancialGoal[]
}

function mapGoalStatus(status: GoalStatus, isOverdue: boolean): BadgeStatus {
  if (status === 'IN_PROGRESS' && isOverdue) return 'overdue'
  if (status === 'IN_PROGRESS') return 'in_progress'
  if (status === 'COMPLETED') return 'completed'
  if (status === 'PAUSED') return 'paused'
  if (status === 'CANCELLED') return 'cancelled'
  return 'in_progress'
}

function isGoalLocked(status: GoalStatus): boolean {
  return status === 'COMPLETED' || status === 'PAUSED' || status === 'CANCELLED'
}

const GOAL_COLORS = [
  '#6366f1', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6b7280',
]

export function MetasClient({ goals }: MetasClientProps) {
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null)
  const [depositGoal, setDepositGoal] = useState<FinancialGoal | null>(null)
  const [deleteGoal, setDeleteGoal] = useState<FinancialGoal | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [isPending, startTransition] = useTransition()

  const createForm = useForm<GoalInput>({
    resolver: zodResolver(goalSchema) as never,
    defaultValues: {
      name: '',
      current_amount: 0,
      target_amount: 0,
    },
  })

  const editForm = useForm<UpdateGoalInput>({
    resolver: zodResolver(updateGoalSchema) as never,
  })

  function openEdit(goal: FinancialGoal) {
    setEditingGoal(goal)
    editForm.reset({
      name: goal.name,
      description: goal.description ?? '',
      target_amount: goal.target_amount,
      deadline: goal.deadline ?? '',
      icon: goal.icon ?? '',
      color: goal.color ?? '',
    })
  }

  function handleCreate(data: GoalInput) {
    startTransition(async () => {
      const result = await createGoalAction({
        name: data.name,
        description: data.description,
        target_amount: data.target_amount,
        current_amount: data.current_amount ?? 0,
        deadline: data.deadline,
      })

      if (result?.error) {
        toast.error('Erro ao criar meta. Verifique os dados.')
        return
      }

      toast.success('Meta criada com sucesso!')
      createForm.reset()
      setShowNewGoal(false)
    })
  }

  function handleEdit(data: UpdateGoalInput) {
    if (!editingGoal) return
    startTransition(async () => {
      const result = await updateGoalAction(editingGoal.id, {
        name: data.name,
        description: data.description,
        target_amount: data.target_amount,
        deadline: data.deadline,
        icon: data.icon,
        color: data.color,
      })

      if (result?.error) {
        toast.error('Erro ao editar meta.')
        return
      }

      toast.success('Meta atualizada!')
      editForm.reset()
      setEditingGoal(null)
    })
  }

  function handleDeposit() {
    if (!depositGoal) return
    const amount = Number(depositAmount)
    if (amount <= 0) {
      toast.error('Informe um valor positivo.')
      return
    }
    startTransition(async () => {
      const result = await addGoalAmountAction(depositGoal.id, amount)
      if (result.error) {
        toast.error(String(result.error))
        return
      }
      if (result.completed) {
        toast.success(`🎉 Meta atingida! Parabéns!`)
      } else {
        toast.success('Valor adicionado!')
      }
      setDepositGoal(null)
      setDepositAmount('')
    })
  }

  function handleDelete() {
    if (!deleteGoal) return
    startTransition(async () => {
      const result = await deleteGoalAction(deleteGoal.id)
      if (result.error) {
        toast.error(String(result.error))
        return
      }
      toast.success('Meta excluída.')
      setDeleteGoal(null)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground mb-1">Metas</h1>
        <p className="text-sm text-muted-foreground">Acompanhe seus objetivos financeiros</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Metas financeiras</h2>

        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Nenhuma meta cadastrada"
            description="Crie sua primeira meta financeira e acompanhe seu progresso até o objetivo."
            action={
              <button
                onClick={() => setShowNewGoal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova meta
              </button>
            }
          />
        ) : (
          <>
            {goals.map((goal) => {
              const target = goal.target_amount
              const current = goal.current_amount
              const isOverdue = goal.deadline
                ? new Date(goal.deadline) < new Date() && goal.status === 'IN_PROGRESS'
                : false
              const deadlineFormatted = goal.deadline ? formatDate(goal.deadline) : null
              const locked = isGoalLocked(goal.status)

              return (
                <div key={goal.id} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{goal.icon || '🎯'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{goal.name}</p>
                        <StatusBadge status={mapGoalStatus(goal.status, isOverdue)} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(current)} / {formatCurrency(target)}
                        {deadlineFormatted && (
                          <span className="ml-2">· Prazo: {deadlineFormatted}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!locked && (
                        <button
                          onClick={() => { setDepositGoal(goal); setDepositAmount('') }}
                          aria-label="Adicionar valor à meta"
                          className="p-2 min-w-[40px] min-h-[40px] rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                        >
                          <PlusCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(goal)}
                        aria-label="Editar meta"
                        className="p-2 min-w-[40px] min-h-[40px] rounded-lg hover:bg-accent transition-colors"
                      >
                        <Pencil size={18} className="text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => setDeleteGoal(goal)}
                        aria-label="Excluir meta"
                        className="p-2 min-w-[40px] min-h-[40px] rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <ProgressBar
                    value={current}
                    max={target}
                    size="sm"
                    showLabel
                    invertColors
                  />
                </div>
              )
            })}

            <button
              onClick={() => setShowNewGoal(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground font-medium text-sm hover:border-muted-foreground hover:text-muted-foreground transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova meta
            </button>
          </>
        )}
      </div>

      {showNewGoal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNewGoal(false)} />
          <div className="relative bg-card rounded-t-3xl lg:rounded-3xl w-full mx-4 lg:max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold text-foreground">Nova meta</h2>
              <button
                onClick={() => setShowNewGoal(false)}
                className="p-1 rounded-lg hover:bg-accent"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={createForm.handleSubmit(handleCreate)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Reserva de emergência"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                  {...createForm.register('name')}
                />
                {createForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{createForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Valor meta</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                    {...createForm.register('target_amount')}
                  />
                  {createForm.formState.errors.target_amount && (
                    <p className="text-red-500 text-xs mt-1">{createForm.formState.errors.target_amount.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Atual</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                    {...createForm.register('current_amount')}
                  />
                  {createForm.formState.errors.current_amount && (
                    <p className="text-red-500 text-xs mt-1">{createForm.formState.errors.current_amount.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Prazo</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                  {...createForm.register('deadline')}
                />
                {createForm.formState.errors.deadline && (
                  <p className="text-red-500 text-xs mt-1">{createForm.formState.errors.deadline.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewGoal(false)}
                  className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingGoal(null)} />
          <div className="relative bg-card rounded-t-3xl lg:rounded-3xl w-full mx-4 lg:max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold text-foreground">Editar meta</h2>
              <button
                onClick={() => setEditingGoal(null)}
                className="p-1 rounded-lg hover:bg-accent"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editForm.handleSubmit(handleEdit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {['🎯', '🏠', '🚗', '✈️', '🎓', '💻', '💍', '🏥', '💼', '📱', '🐱', '🌟'].map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => editForm.setValue('icon', ic)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${
                        editForm.watch('icon') === ic
                          ? 'border-foreground bg-muted'
                          : 'border-border hover:border-border'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Reserva de emergência"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                  {...editForm.register('name')}
                />
                {editForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{editForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                  {...editForm.register('description')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Valor alvo</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                  {...editForm.register('target_amount')}
                />
                {editForm.formState.errors.target_amount && (
                  <p className="text-red-500 text-xs mt-1">{editForm.formState.errors.target_amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Prazo</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                  {...editForm.register('deadline')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => editForm.setValue('color', c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        editForm.watch('color') === c ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Cor ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {depositGoal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDepositGoal(null)} />
          <div className="relative bg-card rounded-t-3xl lg:rounded-3xl w-full mx-4 lg:max-w-sm shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">Adicionar valor</h2>
              <button
                onClick={() => setDepositGoal(null)}
                className="p-1 rounded-lg hover:bg-accent"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Meta: <span className="text-foreground font-medium">{depositGoal.name}</span>
              <br />
              Atual: {formatCurrency(depositGoal.current_amount)} de {formatCurrency(depositGoal.target_amount)}
            </p>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Valor a adicionar</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-lg font-bold"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDeposit()
                    if (e.key === 'Escape') setDepositGoal(null)
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDepositGoal(null)}
                className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeposit}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-green-600 text-primary-foreground font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteGoal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteGoal(null)} />
          <div className="relative bg-card rounded-t-3xl lg:rounded-3xl w-full mx-4 lg:max-w-sm shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Excluir meta</h2>
              <button
                onClick={() => setDeleteGoal(null)}
                className="p-1 rounded-lg hover:bg-accent"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Tem certeza que deseja excluir permanentemente esta meta?
            </p>
            <p className="text-sm font-medium text-foreground mb-5">
              {deleteGoal.icon} {deleteGoal.name}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteGoal(null)}
                className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-red-600 text-primary-foreground font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
