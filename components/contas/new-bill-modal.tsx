'use client'

import { useEffect, useState, useTransition } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { recurringBillSchema, updateRecurringBillSchema, type RecurringBillInput, type UpdateRecurringBillInput } from '@/lib/validations/bill'
import { createRecurringBillAction, updateRecurringBillAction } from '@/app/actions/bills'
import { toast } from 'sonner'

const BILL_ICONS = ['🏠', '🌐', '⚡', '💧', '🏥', '🏋️', '📱', '🎓', '🚗', '🛡️', '📺', '📦']

const RECURRENCE_OPTIONS = [
  { id: 'MONTHLY', label: 'Mensal' },
  { id: 'BIMONTHLY', label: 'Bimestral' },
  { id: 'QUARTERLY', label: 'Trimestral' },
  { id: 'SEMIANNUAL', label: 'Semestral' },
  { id: 'ANNUAL', label: 'Anual' },
]

interface Category {
  id: string
  name: string
  icon: string
}

interface EditingBill {
  id: string
  name: string
  amount: number
  due_day: number
  recurrence: string
  is_fixed: boolean
  installment_total?: number | null
  category_id?: string | null
}

interface NewBillModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  editingBill?: EditingBill | null
}

export function NewBillModal({ isOpen, onClose, categories, editingBill }: NewBillModalProps) {
  const isEditing = !!editingBill

  const [icon, setIcon] = useState('🏠')
  const [billType, setBillType] = useState<'fixa' | 'parcelada'>('fixa')
  const [categoryId, setCategoryId] = useState('')
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RecurringBillInput & UpdateRecurringBillInput>({
    resolver: zodResolver(isEditing ? updateRecurringBillSchema : recurringBillSchema) as never,
    defaultValues: {
      recurrence: 'MONTHLY',
    },
  })

  useEffect(() => {
    if (!isOpen) return
    if (editingBill) {
      const match = editingBill.name.match(/^(\S+)\s+(.+)$/)
      setIcon(match?.[1] ?? '🏠')
      setBillType(editingBill.is_fixed ? 'fixa' : 'parcelada')
      setCategoryId(editingBill.category_id ?? '')
      reset({
        name: match?.[2] ?? editingBill.name,
        amount: editingBill.amount,
        due_day: editingBill.due_day,
        recurrence: editingBill.recurrence as 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL',
        category_id: editingBill.category_id ?? undefined,
      })
    } else {
      setIcon('🏠')
      setBillType('fixa')
      setCategoryId('')
      reset({
        name: '',
        amount: undefined as never,
        due_day: undefined as never,
        recurrence: 'MONTHLY',
        bill_type: 'fixa' as never,
        installment_total: undefined as never,
      })
    }
  }, [isOpen, editingBill, reset])

  const installmentTotal = watch('installment_total')

  function handleFormSubmit(data: RecurringBillInput & UpdateRecurringBillInput) {
    startTransition(async () => {
      if (editingBill) {
        const fullName = `${icon} ${data.name}`
        const result = await updateRecurringBillAction(editingBill.id, {
          name: fullName,
          amount: data.amount,
          due_day: data.due_day,
          recurrence: data.recurrence,
          category_id: categoryId || undefined,
        })

        if (result?.error) {
          toast.error('Erro ao atualizar conta.')
          return
        }

        toast.success('Conta atualizada')
        onClose()
      } else {
        const result = await createRecurringBillAction({
          name: `${icon} ${data.name}`,
          amount: data.amount,
          due_day: data.due_day,
          recurrence: billType === 'parcelada' ? 'MONTHLY' : data.recurrence,
          bill_type: billType,
          installment_total: billType === 'parcelada' ? Number(data.installment_total) : undefined,
          category_id: categoryId || undefined,
        })

        if (result?.error) {
          toast.error('Erro ao criar conta.')
          return
        }

        toast.success('Conta criada com sucesso!')
        onClose()
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-theme-lg border border-border max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-base font-semibold text-foreground">
            {isEditing ? 'Editar conta' : 'Nova conta'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-5 space-y-5">
          {isEditing ? (
            <div className="flex bg-muted rounded-xl p-1 opacity-60 pointer-events-none">
              <div className="flex-1 py-2.5 rounded-lg text-sm font-medium text-center bg-card text-foreground shadow-theme-xs">Fixa</div>
              <div className="flex-1 py-2.5 rounded-lg text-sm font-medium text-center text-muted-foreground">Parcelada</div>
            </div>
          ) : (
            <div className="flex bg-muted rounded-xl p-1">
              <button
                type="button"
                onClick={() => setBillType('fixa')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  billType === 'fixa' ? 'bg-card text-foreground shadow-theme-xs' : 'text-muted-foreground'
                }`}
              >
                Fixa
              </button>
              <button
                type="button"
                onClick={() => setBillType('parcelada')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  billType === 'parcelada' ? 'bg-card text-foreground shadow-theme-xs' : 'text-muted-foreground'
                }`}
              >
                Parcelada
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Ícone
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {BILL_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${
                    icon === ic
                      ? 'border-foreground bg-muted'
                      : 'border-border hover:border-border'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Categoria <span className="text-muted-foreground font-normal normal-case tracking-normal">(opcional)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id === categoryId ? '' : cat.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                      categoryId === cat.id
                        ? 'border-foreground bg-muted'
                        : 'border-border hover:border-border'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Nome
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Ex: Aluguel, Internet, Energia..."
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none transition-colors"
            />
            {errors.name && (
              <p className="text-error-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              {billType === 'parcelada' && !isEditing ? 'Valor de cada parcela' : 'Valor'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                R$
              </span>
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                placeholder="0,00"
                className="w-full pl-10 pr-4 h-10 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none transition-colors"
              />
            </div>
            {errors.amount && (
              <p className="text-error-500 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          {!isEditing && billType === 'parcelada' ? (
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Número de parcelas
              </label>
              <div className="relative">
                <input
                  {...register('installment_total')}
                  type="number"
                  min={2}
                  max={360}
                  placeholder="Ex: 12"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">x</span>
              </div>
              {errors.installment_total && (
                <p className="text-error-500 text-xs mt-1">{errors.installment_total.message}</p>
              )}
              {installmentTotal && Number(installmentTotal) > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Total: {Number(installmentTotal)} parcelas
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Vencimento
                </label>
                <input
                  {...register('due_day')}
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Dia do mês"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none transition-colors"
                />
                {errors.due_day && (
                  <p className="text-error-500 text-xs mt-1">{errors.due_day.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Recorrência
                </label>
                <select
                  {...register('recurrence')}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none transition-colors"
                >
                  {RECURRENCE_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {!isEditing && billType === 'parcelada' && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Vencimento
              </label>
              <input
                {...register('due_day')}
                type="number"
                min={1}
                max={31}
                placeholder="Dia do mês"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none transition-colors"
              />
              {errors.due_day && (
                <p className="text-error-500 text-xs mt-1">{errors.due_day.message}</p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-theme-xs flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Salvar alterações' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
